// FRONTEND: Main chat interface with persona detection
// TODO: Implement streaming responses
// TODO: Add voice input option
// TODO: Store chat history locally

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  persona?: string;
  personaIcon?: string;
  timestamp: Date;
  functionCall?: any;
}

interface ChatInterfaceProps {
  userContext?: {
    ef_profile?: string[];
    current_goals?: string[];
    energy_level?: number;
  };
}

export default function ChatInterface({ userContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Navia, your AI executive function coach. I'm here to help you with career planning, finances, daily tasks, and more. What's on your mind?",
      persona: 'daily_tasks',
      personaIcon: '✅',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<string>('daily_tasks');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          persona: null, // Auto-detect
          userContext,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        persona: data.persona,
        personaIcon: data.personaIcon,
        timestamp: new Date(),
        functionCall: data.functionCall,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentPersona(data.persona);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonaLabel = (persona: string) => {
    const labels: Record<string, string> = {
      career: '💼 Career',
      finance: '💰 Finance',
      daily_tasks: '✅ Daily Tasks',
    };
    return labels[persona] || '✅ Daily Tasks';
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Chat with Navia</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-600">Current mode:</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {getPersonaLabel(currentPersona)}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.role === 'assistant' && message.personaIcon && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{message.personaIcon}</span>
                  <span className="text-xs font-medium text-gray-600">
                    {getPersonaLabel(message.persona || 'daily_tasks')}
                  </span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* Function call result */}
              {message.functionCall && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-sm font-medium mb-2">
                    {message.functionCall.name === 'break_down_task' && '📋 Task Breakdown Created'}
                    {message.functionCall.name === 'get_references' && '📚 Resources Found'}
                  </p>
                  {message.functionCall.result?.link && (
                    <a
                      href={message.functionCall.result.link}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View in Task Visualizer →
                    </a>
                  )}
                </div>
              )}
              
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Navia anything or describe what you're working on..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
