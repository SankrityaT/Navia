'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Volume2, VolumeX, SkipForward, X } from 'lucide-react';

interface FocusMusicPlayerProps {
  isPlaying?: boolean;
  onPlayPause?: () => void;
}

// Smooth, soothing lofi music tracks - using working Pixabay audio
const LOFI_TRACKS = [
  {
    id: 1,
    title: 'Lofi Study',
    artist: 'Chill Beats',
    url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
  },
  {
    id: 2,
    title: 'Gentle Morning',
    artist: 'Lofi Dreams',
    url: 'https://cdn.pixabay.com/audio/2022/03/10/audio_2c9e6ea3f8.mp3',
  },
  {
    id: 3,
    title: 'Peaceful Mind',
    artist: 'Study Vibes',
    url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d1718ab41b.mp3',
  },
  {
    id: 4,
    title: 'Chill Vibes',
    artist: 'Ambient Lofi',
    url: 'https://cdn.pixabay.com/audio/2021/11/25/audio_4e5d201f0f.mp3',
  },
];

export default function FocusMusicPlayer({ isPlaying = false, onPlayPause }: FocusMusicPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [spotifyTrack, setSpotifyTrack] = useState<any>(null);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showPlaylistBrowser, setShowPlaylistBrowser] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [playerError, setPlayerError] = useState<string>('');
  const [musicSource, setMusicSource] = useState<'lofi' | 'spotify'>('lofi');

  // Get available Spotify devices (app, web player, etc.)
  useEffect(() => {
    if (!isSpotifyConnected) return;

    const getDevices = async () => {
      const token = localStorage.getItem('spotify_access_token');
      if (!token) return;

      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📱 Available Spotify devices:', data.devices);
          
          if (data.devices.length > 0) {
            // Use the first active device, or just the first device
            const activeDevice = data.devices.find((d: any) => d.is_active) || data.devices[0];
            setDeviceId(activeDevice.id);
            console.log('✅ Using device:', activeDevice.name);
          } else {
            console.log('⚠️ No Spotify devices found - please open Spotify app or web player');
            setPlayerError('Please open Spotify app or web player first');
          }
        }
      } catch (error) {
        console.error('Failed to get devices:', error);
      }
    };

    getDevices();
    // Check for devices every 10 seconds
    const interval = setInterval(getDevices, 10000);
    return () => clearInterval(interval);
  }, [isSpotifyConnected]);

  // Check if Spotify is already connected on mount and poll for current track
  useEffect(() => {
    const checkSpotifyConnection = async () => {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          console.log('No Spotify token found');
          return;
        }

        const response = await fetch('/api/spotify/player', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Check if token needs refresh
          if (data.needsRefresh) {
            console.log('🔄 Token expired, attempting refresh...');
            const refreshToken = localStorage.getItem('spotify_refresh_token');
            
            if (refreshToken) {
              try {
                const refreshResponse = await fetch('/api/spotify/refresh', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refresh_token: refreshToken }),
                });
                
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  localStorage.setItem('spotify_access_token', refreshData.access_token);
                  if (refreshData.refresh_token) {
                    localStorage.setItem('spotify_refresh_token', refreshData.refresh_token);
                  }
                  console.log('✅ Token refreshed successfully');
                  // Retry the connection check with new token
                  return checkSpotifyConnection();
                } else {
                  console.error('❌ Token refresh failed');
                  setIsSpotifyConnected(false);
                  setPlayerError('Session expired. Please reconnect Spotify.');
                }
              } catch (refreshError) {
                console.error('❌ Token refresh error:', refreshError);
                setIsSpotifyConnected(false);
                setPlayerError('Session expired. Please reconnect Spotify.');
              }
            } else {
              console.log('⚠️ No refresh token available');
              setIsSpotifyConnected(false);
              setPlayerError('Session expired. Please reconnect Spotify.');
            }
            return;
          }
          
          setIsSpotifyConnected(true);
          if (data.track) {
            setSpotifyTrack(data.track);
            setLocalIsPlaying(data.is_playing || false);
            console.log('✅ Spotify connected, current track:', data.track);
          }
        } else if (response.status === 401) {
          // Token expired, trigger refresh
          const data = await response.json();
          if (data.needsRefresh) {
            console.log('🔄 Token expired (401), attempting refresh...');
            const refreshToken = localStorage.getItem('spotify_refresh_token');
            
            if (refreshToken) {
              try {
                const refreshResponse = await fetch('/api/spotify/refresh', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refresh_token: refreshToken }),
                });
                
                if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  localStorage.setItem('spotify_access_token', refreshData.access_token);
                  if (refreshData.refresh_token) {
                    localStorage.setItem('spotify_refresh_token', refreshData.refresh_token);
                  }
                  console.log('✅ Token refreshed successfully after 401');
                  // Retry immediately
                  return checkSpotifyConnection();
                }
              } catch (refreshError) {
                console.error('❌ Token refresh error:', refreshError);
              }
            }
          }
          setIsSpotifyConnected(false);
          setPlayerError('Session expired. Please reconnect Spotify.');
        }
      } catch (error) {
        console.log('Spotify not connected, using lofi fallback');
      }
    };
    
    checkSpotifyConnection();
    
    // Poll every 5 seconds to update current track when Spotify is connected
    const interval = setInterval(() => {
      if (isSpotifyConnected) {
        checkSpotifyConnection();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isSpotifyConnected]);

  // Control Spotify playback
  const controlSpotifyPlayback = async (action: 'play' | 'pause' | 'next') => {
    try {
      if (player) {
        // Use Web Playback SDK directly
        if (action === 'play') {
          await player.resume();
        } else if (action === 'pause') {
          await player.pause();
        } else if (action === 'next') {
          await player.nextTrack();
        }
        console.log(`✅ Spotify ${action} successful`);
      }
    } catch (error) {
      console.error('Failed to control Spotify:', error);
    }
  };

  useEffect(() => {
    setLocalIsPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (player && isSpotifyConnected) {
      // Set Spotify player volume
      player.setVolume(isMuted ? 0 : volume);
    } else if (audioRef.current) {
      // Set local audio volume
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, player, isSpotifyConnected]);

  // Removed interfering useEffect - buttons control audio directly now

  const handlePlayPause = async () => {
    setHasInteracted(true);
    
    if (musicSource === 'spotify' && isSpotifyConnected && deviceId) {
      const token = localStorage.getItem('spotify_access_token');
      if (!token) return;

      try {
        const endpoint = localIsPlaying ? 'pause' : 'play';
        const response = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}?device_id=${deviceId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok || response.status === 204) {
          setLocalIsPlaying(!localIsPlaying);
          console.log(`✅ ${localIsPlaying ? 'Paused' : 'Playing'}`);
        }
      } catch (err) {
        console.error('❌ Playback error:', err);
      }
      return;
    }
    
    // Fallback to local audio
    if (!audioRef.current) return;
    
    try {
      if (localIsPlaying) {
        audioRef.current.pause();
        setLocalIsPlaying(false);
        console.log('⏸️ PAUSED');
      } else {
        audioRef.current.volume = isMuted ? 0 : volume;
        await audioRef.current.play();
        setLocalIsPlaying(true);
        console.log('▶️ PLAYING');
      }
    } catch (err) {
      console.error('❌ Playback error:', err);
    }
  };

  const handleNextTrack = async () => {
    if (musicSource === 'spotify' && isSpotifyConnected && deviceId) {
      const token = localStorage.getItem('spotify_access_token');
      if (!token) return;

      try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok || response.status === 204) {
          console.log('✅ Skipped to next track');
        }
      } catch (err) {
        console.error('❌ Skip error:', err);
      }
      return;
    }
    
    // Fallback to local audio
    const wasPlaying = localIsPlaying;
    const nextTrack = (currentTrack + 1) % LOFI_TRACKS.length;
    
    console.log('⏭️ SKIP - Current:', LOFI_TRACKS[currentTrack].title, '→ Next:', LOFI_TRACKS[nextTrack].title);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setCurrentTrack(nextTrack);
    
    if (wasPlaying && audioRef.current) {
      setTimeout(async () => {
        try {
          if (audioRef.current) {
            audioRef.current.load();
            await audioRef.current.play();
            console.log('✅ New track playing:', LOFI_TRACKS[nextTrack].title);
          }
        } catch (err) {
          console.error('❌ Skip play error:', err);
        }
      }, 200);
    }
  };

  // Fetch user's playlists
  const fetchPlaylists = async () => {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;

    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data.items);
        setShowPlaylistBrowser(true);
      }
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    }
  };

  // Fetch tracks from a playlist
  const fetchPlaylistTracks = async (playlistId: string) => {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;

    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlaylistTracks(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch playlist tracks:', error);
    }
  };

  // Play track on active Spotify device
  const playTrack = async (trackUri: string, trackIndex?: number) => {
    const token = localStorage.getItem('spotify_access_token');
    if (!token) return;

    if (!deviceId) {
      alert('Please open Spotify app or web player (open.spotify.com) first, then try again!');
      return;
    }

    try {
      const playBody: any = {};
      
      if (selectedPlaylist && trackIndex !== undefined) {
        playBody.context_uri = selectedPlaylist.uri;
        playBody.offset = { position: trackIndex };
      } else {
        playBody.uris = [trackUri];
      }

      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playBody),
      });

      if (response.ok || response.status === 204) {
        console.log('✅ Playing on Spotify device');
        setLocalIsPlaying(true);
        setShowPlaylistBrowser(false);
      } else {
        console.error('Play failed:', response.status);
        alert('Failed to play. Make sure Spotify is open and playing something first.');
      }
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  const handleSpotifyConnect = async () => {
    // Save focus session state before redirecting
    const focusState = {
      focusMode: true,
      focusTime: parseInt(document.querySelector('[class*="text-9xl"]')?.textContent?.split(':')[0] || '25') * 60,
      focusIntention: document.querySelector('[class*="text-5xl"]')?.textContent || '',
      selectedTaskForFocus: '',
      showImmersiveFocus: window.location.pathname.includes('dashboard'),
      isPausedInFocus: !isPlaying,
      timerActive: isPlaying,
    };
    sessionStorage.setItem('focus_session_state', JSON.stringify(focusState));
    sessionStorage.setItem('spotify_connecting', 'true');
    
    // Redirect to Spotify auth in same window
    window.location.href = '/api/auth/spotify';
  };

  // Check if we just came back from Spotify connection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('spotify_connected') === 'true') {
      const token = urlParams.get('spotify_token');
      const refresh = urlParams.get('spotify_refresh');
      const expires = urlParams.get('spotify_expires');
      
      if (token) {
        // Store tokens in localStorage
        localStorage.setItem('spotify_access_token', token);
        if (refresh) localStorage.setItem('spotify_refresh_token', refresh);
        if (expires) localStorage.setItem('spotify_token_expires', (Date.now() + parseInt(expires) * 1000).toString());
        
        setIsSpotifyConnected(true);
        sessionStorage.removeItem('spotify_connecting');
        console.log('✅ Stored Spotify tokens in localStorage');
        
        // Clean up URL (remove tokens from URL for security)
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  return (
    <>
      {/* Hidden audio element - for lofi music */}
      {musicSource === 'lofi' && (
        <audio
          ref={audioRef}
          src={LOFI_TRACKS[currentTrack].url}
          loop
          preload="metadata"
        />
      )}

      <div className="w-full">
        <AnimatePresence>
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-br from-[var(--sage-50)] to-[var(--clay-50)] rounded-2xl p-4 border-2 border-[var(--sage-200)] mb-4"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-[var(--sage-600)]" />
                    <h3 className="font-bold text-[var(--charcoal)]">Focus Music</h3>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="text-[var(--clay-600)] hover:text-[var(--charcoal)] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Music Source Toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setMusicSource('lofi')}
                    className={`flex-1 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                      musicSource === 'lofi'
                        ? 'bg-[var(--clay-500)] text-white'
                        : 'bg-[var(--sage-100)] text-[var(--charcoal)] hover:bg-[var(--sage-200)]'
                    }`}
                  >
                    🎵 Lofi Music
                  </button>
                  <button
                    onClick={() => setMusicSource('spotify')}
                    className={`flex-1 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                      musicSource === 'spotify'
                        ? 'bg-[#1DB954] text-white'
                        : 'bg-[var(--sage-100)] text-[var(--charcoal)] hover:bg-[var(--sage-200)]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Spotify
                    </span>
                  </button>
                </div>

                {/* Music Source Specific Buttons */}
                {musicSource === 'lofi' ? (
                  // Lofi Browse Songs Button
                  <button
                    onClick={() => setShowPlaylistBrowser(true)}
                    className="w-full bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-4 py-2.5 rounded-full transition-all font-semibold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <Music className="w-4 h-4" />
                    Browse Songs
                  </button>
                ) : !isSpotifyConnected ? (
                  // Spotify Connection
                  <button
                    onClick={handleSpotifyConnect}
                    className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white px-4 py-2.5 rounded-full transition-all font-semibold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Connect Spotify
                  </button>
                ) : playerError ? (
                  <div className="w-full space-y-2">
                    <div className="w-full bg-red-100 text-red-700 px-4 py-2.5 rounded-full text-sm text-center">
                      ⚠️ {playerError}
                      <p className="text-xs mt-1">Note: Spotify Web Player requires Premium</p>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem('spotify_access_token');
                        localStorage.removeItem('spotify_refresh_token');
                        setPlayerError('');
                        setIsSpotifyConnected(false);
                        setPlayer(null);
                        setDeviceId('');
                        setTimeout(() => handleSpotifyConnect(), 100);
                      }}
                      className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white px-4 py-2.5 rounded-full transition-all font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      🔄 Reconnect Spotify
                    </button>
                  </div>
                ) : !deviceId ? (
                  <div className="w-full bg-[var(--sage-200)] text-[var(--charcoal)] px-4 py-2.5 rounded-full text-sm flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--charcoal)] border-t-transparent"></div>
                    Loading Spotify Player...
                  </div>
                ) : (
                  <button
                    onClick={fetchPlaylists}
                    className="w-full bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-4 py-2.5 rounded-full transition-all font-semibold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                  >
                    <Music className="w-4 h-4" />
                    Browse Your Playlists
                  </button>
                )}

                {/* Current Track */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-[var(--sage-200)]">
                  <p className="text-xs text-[var(--clay-600)] mb-1">Now Playing</p>
                  {musicSource === 'spotify' && isSpotifyConnected && spotifyTrack ? (
                    <>
                      <p className="font-semibold text-[var(--charcoal)]">{spotifyTrack.name}</p>
                      <p className="text-xs text-[var(--sage-600)] mt-1">{spotifyTrack.artist} • {spotifyTrack.album}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <svg className="w-3 h-3 text-[#1DB954]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        <p className="text-[10px] text-[#1DB954] font-semibold">Playing from Spotify</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-[var(--charcoal)]">{LOFI_TRACKS[currentTrack].title}</p>
                      <p className="text-xs text-[var(--sage-600)] mt-1">{LOFI_TRACKS[currentTrack].artist}</p>
                    </>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handlePlayPause}
                    className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white p-3 rounded-full transition-all hover:scale-110 active:scale-95 shadow-lg"
                  >
                    {localIsPlaying ? (
                      <Pause className="w-5 h-5" fill="currentColor" />
                    ) : (
                      <Play className="w-5 h-5" fill="currentColor" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleNextTrack}
                    className="bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-white p-2.5 rounded-full transition-all hover:scale-110 active:scale-95"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-[var(--clay-600)] hover:text-[var(--charcoal)] transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className="flex-1 h-2 bg-[var(--sage-200)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--clay-500)] [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setIsExpanded(true)}
              className="w-full bg-gradient-to-r from-[var(--sage-100)] to-[var(--clay-100)] hover:from-[var(--sage-200)] hover:to-[var(--clay-200)] border-2 border-[var(--sage-200)] px-4 py-3 rounded-xl transition-all flex items-center justify-between group hover:scale-[1.02] active:scale-[0.98] mb-4"
            >
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-[var(--sage-600)]" />
                <span className="font-semibold text-[var(--charcoal)] text-sm">
                  {localIsPlaying ? '🎵 Music Playing' : 'Add Focus Music'}
                </span>
              </div>
              <svg className="w-5 h-5 text-[var(--clay-600)] group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Playlist Browser Modal */}
      <AnimatePresence>
        {showPlaylistBrowser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPlaylistBrowser(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-[var(--charcoal)]">
                  {musicSource === 'lofi' ? 'Lofi Songs' : (selectedPlaylist ? selectedPlaylist.name : 'Your Playlists')}
                </h2>
                <button
                  onClick={() => {
                    setShowPlaylistBrowser(false);
                    setSelectedPlaylist(null);
                  }}
                  className="text-[var(--charcoal)] hover:text-[var(--clay-600)] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {musicSource === 'lofi' ? (
                  // Show lofi songs
                  LOFI_TRACKS.map((track, index) => (
                    <button
                      key={index}
                      onClick={async () => {
                        setHasInteracted(true);
                        setShowPlaylistBrowser(false);
                        
                        if (audioRef.current) {
                          try {
                            // Pause and reset current playback
                            audioRef.current.pause();
                            audioRef.current.currentTime = 0;
                            
                            // Update track index
                            setCurrentTrack(index);
                            
                            // Small delay to ensure state updates
                            await new Promise(resolve => setTimeout(resolve, 50));
                            
                            // Now play
                            await audioRef.current.play();
                            setLocalIsPlaying(true);
                            console.log('✅ Playing:', track.title);
                          } catch (err: any) {
                            // Ignore abort errors (they're expected when switching tracks)
                            if (err.name !== 'AbortError') {
                              console.error('❌ Play error:', err);
                            }
                          }
                        }
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--sand)] transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--charcoal)]">{track.title}</p>
                        <p className="text-xs text-[var(--sage-600)]">{track.artist}</p>
                      </div>
                      <Play className="w-5 h-5 text-[var(--clay-500)]" />
                    </button>
                  ))
                ) : !selectedPlaylist ? (
                  // Show Spotify playlists
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => {
                        setSelectedPlaylist(playlist);
                        fetchPlaylistTracks(playlist.id);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--sand)] transition-colors text-left"
                    >
                      {playlist.images?.[0]?.url && (
                        <img src={playlist.images[0].url} alt={playlist.name} className="w-12 h-12 rounded-lg" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-[var(--charcoal)]">{playlist.name}</p>
                        <p className="text-xs text-[var(--sage-600)]">{playlist.tracks.total} tracks</p>
                      </div>
                    </button>
                  ))
                ) : (
                  // Show Spotify tracks
                  <>
                    <button
                      onClick={() => setSelectedPlaylist(null)}
                      className="text-[var(--clay-600)] hover:text-[var(--charcoal)] text-sm mb-2"
                    >
                      ← Back to playlists
                    </button>
                    {playlistTracks.map((item, index) => (
                      <button
                        key={`${item.track.id}-${index}`}
                        onClick={() => playTrack(item.track.uri, index)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--sand)] transition-colors text-left"
                      >
                        {item.track.album?.images?.[0]?.url && (
                          <img src={item.track.album.images[0].url} alt={item.track.name} className="w-12 h-12 rounded-lg" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-[var(--charcoal)]">{item.track.name}</p>
                          <p className="text-xs text-[var(--sage-600)]">{item.track.artists[0]?.name}</p>
                        </div>
                        <Play className="w-5 h-5 text-[var(--clay-500)]" />
                      </button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
