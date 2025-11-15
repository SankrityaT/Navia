// Custom hook for Hume EVI Speech-to-Speech functionality
// Manages WebSocket connection, audio streaming, and real-time conversation

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseEviSpeechToSpeechProps {
  onTranscript?: (text: string, isUser: boolean) => void;
  onError?: (error: string) => void;
}

interface EviMessage {
  type: string;
  message?: {
    role: string;
    content: string;
  };
  data?: string; // base64 audio
}

export function useEviSpeechToSpeech({ onTranscript, onError }: UseEviSpeechToSpeechProps = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  // Fetch access token
  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch('/api/evi/access-token', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch access token');
      }
      
      const data = await response.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error('Error fetching access token:', error);
      onError?.('Failed to authenticate');
      return null;
    }
  }, [onError]);

  // Connect to EVI WebSocket
  const connect = useCallback(async (configId?: string) => {
    if (isConnected || wsRef.current) {
      console.log('Already connected');
      return;
    }

    const token = accessToken || await fetchToken();
    if (!token) return;

    try {
      // Build WebSocket URL
      let wsUrl = `wss://api.hume.ai/v0/evi/chat?access_token=${token}`;
      if (configId) {
        wsUrl += `&config_id=${configId}`;
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ EVI WebSocket connected');
        setIsConnected(true);
      };

      ws.onmessage = async (event) => {
        try {
          const message: EviMessage = JSON.parse(event.data);
          
          // Handle different message types
          switch (message.type) {
            case 'user_message':
              // User's transcribed speech
              if (message.message?.content) {
                onTranscript?.(message.message.content, true);
              }
              break;
              
            case 'assistant_message':
              // EVI's text response
              if (message.message?.content) {
                onTranscript?.(message.message.content, false);
              }
              break;
              
            case 'audio_output':
              // EVI's audio response
              if (message.data) {
                await playAudioChunk(message.data);
              }
              break;
              
            case 'assistant_end':
              // EVI finished speaking
              setIsSpeaking(false);
              break;
              
            default:
              console.log('EVI message:', message.type);
          }
        } catch (error) {
          console.error('Error processing EVI message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('EVI WebSocket error:', error);
        onError?.('Connection error');
      };

      ws.onclose = () => {
        console.log('EVI WebSocket closed');
        setIsConnected(false);
        wsRef.current = null;
      };
    } catch (error) {
      console.error('Error connecting to EVI:', error);
      onError?.('Failed to connect');
    }
  }, [isConnected, accessToken, fetchToken, onTranscript, onError]);

  // Disconnect from EVI
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
  }, []);

  // Start recording and streaming audio to EVI
  const startRecording = useCallback(async () => {
    if (!isConnected || isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert blob to base64 and send to EVI
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            wsRef.current?.send(JSON.stringify({
              type: 'audio_input',
              data: base64,
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };

      mediaRecorder.start(100); // Send chunks every 100ms
      setIsRecording(true);
      setIsSpeaking(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError?.('Microphone access denied');
    }
  }, [isConnected, isRecording, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  }, [isRecording]);

  // Play audio chunk from EVI
  const playAudioChunk = useCallback(async (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Decode base64 to audio buffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      audioQueueRef.current.push(audioBuffer);

      // Start playing if not already playing
      if (!isPlayingRef.current) {
        playNextAudioChunk();
      }
    } catch (error) {
      console.error('Error playing audio chunk:', error);
    }
  }, []);

  // Play next audio chunk from queue
  const playNextAudioChunk = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const audioBuffer = audioQueueRef.current.shift()!;
    const source = audioContextRef.current!.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current!.destination);
    
    source.onended = () => {
      playNextAudioChunk();
    };
    
    source.start();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [disconnect]);

  return {
    isConnected,
    isRecording,
    isSpeaking,
    connect,
    disconnect,
    startRecording,
    stopRecording,
  };
}
