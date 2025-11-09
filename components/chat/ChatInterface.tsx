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
  breakdown?: string[];
  resources?: Array<{ title: string; url: string; description?: string; type?: string }>;
  sources?: Array<{ title: string; url: string; excerpt?: string }>;
  suggestBreakdown?: boolean;
  originalQuery?: string; // Store the original query for context when "Yes" is clicked
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

  const handleSend = async (messageText?: string, forceBreakdown?: boolean) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          userContext,
          forceBreakdown: forceBreakdown || false, // Explicit flag when "Yes" is clicked
        }),
      });

      const data = await response.json();

      console.log('📨 Frontend received:', {
        hasBreakdown: !!data.breakdown,
        breakdownLength: data.breakdown?.length || 0,
        needsBreakdown: data.metadata?.needsBreakdown,
        willShowButtons: data.metadata?.needsBreakdown && (!data.breakdown || data.breakdown.length === 0),
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.summary || data.message,
        persona: data.domains?.[0] || data.persona,
        personaIcon: getPersonaIcon(data.domains?.[0] || data.persona),
        timestamp: new Date(),
        functionCall: data.functionCall,
        breakdown: data.breakdown,
        resources: data.resources,
        sources: data.sources,
        suggestBreakdown: data.metadata?.needsBreakdown && (!data.breakdown || data.breakdown.length === 0),
        originalQuery: textToSend,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.domains?.[0]) {
        setCurrentPersona(data.domains[0]);
      }
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

  const handleBreakdownResponse = async (accept: boolean, originalQuery: string) => {
    if (accept) {
      // Send the original query again with forceBreakdown flag
      await handleSend(originalQuery + ' - create a plan', false);
    } else {
      // User declined, just acknowledge
      const declineMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "No problem! Let me know if you need anything else.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, declineMessage]);
    }
  };

  const getPersonaIcon = (persona: string) => {
    const icons: Record<string, string> = {
      career: '💼',
      finance: '💰',
      daily_task: '✅',
      daily_tasks: '✅',
    };
    return icons[persona] || '✅';
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
              
              {/* Breakdown suggestion buttons */}
              {message.role === 'assistant' && message.suggestBreakdown && !message.breakdown && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-sm font-medium mb-3">Would you like me to break this down into step-by-step actions?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleBreakdownResponse(true, message.originalQuery || '')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      ✅ Yes, create a plan
                    </button>
                    <button
                      onClick={() => handleBreakdownResponse(false, message.originalQuery || '')}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors text-sm"
                    >
                      No, thanks
                    </button>
                  </div>
                </div>
              )}
              
              {/* Breakdown steps */}
              {message.breakdown && message.breakdown.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span>📋</span>
                    <span>Step-by-Step Plan:</span>
                  </p>
                  <ol className="space-y-2 ml-1">
                    {message.breakdown.map((step, index) => (
                      <li key={index} className="text-sm flex gap-3">
                        <span className="font-bold text-blue-600 min-w-[24px]">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {/* Resources */}
              {message.resources && message.resources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-sm font-semibold mb-2">🔗 Recommended Resources:</p>
                  <div className="space-y-2">
                    {message.resources.slice(0, 3).map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {resource.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
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
            onClick={() => handleSend()}
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
