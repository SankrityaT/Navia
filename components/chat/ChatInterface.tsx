// FRONTEND: Main chat interface with persona detection - Enhanced with streaming and modern UI
// TODO: Add voice input option
// TODO: Store chat history locally

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

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
  originalQuery?: string;
  isStreaming?: boolean; // For streaming animation
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
      content: "Hi! I'm Navia, your AI executive function coach. 💚\n\nI'm here to support you with career planning, managing finances, organizing daily tasks, and more—without any masking required. Just tell me what's on your mind, and we'll figure it out together.",
      persona: 'daily_tasks',
      personaIcon: '✅',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<string>('daily_tasks');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
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
    setIsTyping(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          userContext,
          forceBreakdown: forceBreakdown || false,
        }),
      });

      const data = await response.json();

      // Update persona immediately
      const newPersona = data.domains?.[0] || data.persona || 'daily_tasks';
      setCurrentPersona(newPersona);

      // Simulate streaming effect
      const assistantMessageId = (Date.now() + 1).toString();
      const fullContent = data.summary || data.message;
      
      // Add empty message first
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        persona: newPersona,
        personaIcon: getPersonaIcon(newPersona),
        timestamp: new Date(),
        functionCall: data.functionCall,
        breakdown: data.breakdown,
        breakdownTips: data.breakdownTips,
        resources: data.resources,
        sources: data.sources,
        suggestBreakdown: data.metadata?.needsBreakdown && (!data.breakdown || data.breakdown.length === 0),
        originalQuery: textToSend,
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Stream the content character by character
      const words = fullContent.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30)); // Faster streaming
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === assistantMessageId
              ? { ...msg, content: words.slice(0, i + 1).join(' ') + (i < words.length - 1 ? ' ' : '') }
              : msg
          )
        );
      }
      
      // Mark streaming complete
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
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
      // User accepted - resend query with explicit breakdown request
      // This triggers the explicitlyRequestsBreakdown() check in backend
      const explicitRequest = `${originalQuery} - create a plan for this`;
      await handleSend(explicitRequest, false);
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
      career: 'Career',
      finance: 'Finance',
      daily_tasks: 'Daily Tasks',
    };
    return labels[persona] || 'Daily Tasks';
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-[2rem] border-2 border-[var(--clay-200)] shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="px-6 py-5 border-b-2 border-[var(--clay-200)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-md">
            <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
              Chat with Navia
            </h2>
            <p className="text-sm text-[var(--charcoal)]/60">Your AI executive function coach</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--charcoal)]/70 font-medium">Current mode:</span>
          <span className="px-3 py-1.5 bg-gradient-to-r from-[var(--clay-100)] to-[var(--clay-200)] text-[var(--clay-700)] rounded-full text-sm font-semibold border border-[var(--clay-300)]">
            {getPersonaLabel(currentPersona)}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            {message.role === 'user' ? (
              /* User Message - Bubble on Right */
              <div className="flex justify-end">
                <div className="max-w-[75%] bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] text-white rounded-3xl px-6 py-4 shadow-lg">
                  <p className="whitespace-pre-wrap leading-relaxed text-[16px] font-medium">{message.content}</p>
                </div>
              </div>
            ) : (
              /* AI Message - No Bubble, Plain Text on Left */
              <div className="flex flex-col max-w-[90%]">
                {/* Persona Badge */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-500)] flex items-center justify-center shadow-md">
                    <span className="text-base">{message.personaIcon}</span>
                  </div>
                  <span className="text-xs font-bold text-[var(--charcoal)]/70 uppercase tracking-wider">
                    {getPersonaLabel(message.persona || 'daily_tasks')}
                  </span>
                </div>
                
                {/* Message Content - No Bubble */}
                <div className="text-[var(--charcoal)] space-y-4">
                  <p className="whitespace-pre-wrap text-[16px] leading-[1.7] font-normal">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-1.5 h-5 ml-1 bg-[var(--clay-500)] animate-pulse rounded-sm"></span>
                    )}
                  </p>
              
                  {/* Breakdown suggestion buttons - Enhanced for Accessibility */}
                  {message.suggestBreakdown && !message.breakdown && (
                    <div className="mt-6 p-5 bg-[var(--clay-50)] rounded-2xl border-2 border-[var(--clay-300)]">
                      <p className="text-base font-semibold mb-4 text-[var(--charcoal)] leading-relaxed">
                        💡 Would you like me to break this down into step-by-step actions?
                      </p>
                      <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleBreakdownResponse(true, message.originalQuery || '')}
                          className="flex-1 min-w-[140px] px-5 py-3.5 bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] hover:from-[var(--sage-600)] hover:to-[var(--sage-700)] text-white rounded-xl font-bold transition-all duration-200 text-sm shadow-md hover:shadow-lg active:scale-95"
                    >
                      ✅ Yes, create a plan
                    </button>
                    <button
                      onClick={() => handleBreakdownResponse(false, message.originalQuery || '')}
                          className="flex-1 min-w-[140px] px-5 py-3.5 bg-white hover:bg-[var(--stone)] text-[var(--charcoal)] rounded-xl font-bold transition-all duration-200 text-sm border-2 border-[var(--clay-300)] hover:border-[var(--clay-400)] shadow-sm active:scale-95"
                    >
                      No, thanks
                    </button>
                  </div>
                </div>
              )}
              
                  {/* Breakdown steps - Enhanced for Clarity */}
              {message.breakdown && message.breakdown.length > 0 && (
                    <div className="mt-6 p-5 bg-[var(--clay-50)] rounded-2xl border-2 border-[var(--clay-300)]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-md">
                          <span className="text-lg">📋</span>
                        </div>
                        <p className="text-base font-bold text-[var(--charcoal)]">
                          Your Step-by-Step Plan ({message.breakdown.length} main steps)
                        </p>
                      </div>
                      <div className="space-y-4">
                        {message.breakdown.map((step: any, index: number) => {
                          // Handle both old format (string) and new format (object)
                          const isOldFormat = typeof step === 'string';
                          const title = isOldFormat ? step : step.title;
                          const timeEstimate = !isOldFormat ? step.timeEstimate : null;
                          const subSteps = !isOldFormat ? step.subSteps : null;
                          const isOptional = !isOldFormat ? step.isOptional : false;
                          const isHard = !isOldFormat ? step.isHard : false;

                          return (
                            <div 
                              key={index} 
                              className={`p-4 bg-white rounded-xl border-2 ${
                                isOptional ? 'border-[var(--sage-300)]' : 'border-[var(--clay-300)]'
                              } hover:border-[var(--clay-500)] transition-all`}
                            >
                              {/* Main Step Header */}
                              <div className="flex items-start gap-3 mb-2">
                                <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                  isOptional ? 'bg-[var(--sage-500)]' : 'bg-[var(--clay-500)]'
                                } text-white font-bold text-sm flex-shrink-0`}>
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-[var(--charcoal)] text-base leading-snug">
                                      {title}
                                    </span>
                                    {isOptional && (
                                      <span className="px-2 py-0.5 bg-[var(--sage-200)] text-[var(--sage-700)] text-xs font-bold rounded-md">
                                        OPTIONAL
                                      </span>
                                    )}
                                    {isHard && (
                                      <span className="px-2 py-0.5 bg-[var(--clay-200)] text-[var(--clay-700)] text-xs font-bold rounded-md">
                                        ⚠️ CHALLENGING
                                      </span>
                                    )}
                                    {timeEstimate && (
                                      <span className="text-xs text-[var(--charcoal)]/60 font-medium">
                                        ⏱ {timeEstimate}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Sub-steps (if any) */}
                              {subSteps && subSteps.length > 0 && (
                                <ul className="ml-11 mt-3 space-y-2">
                                  {subSteps.map((subStep: string, subIndex: number) => (
                                    <li key={subIndex} className="flex items-start gap-2 text-sm text-[var(--charcoal)]/80 leading-relaxed">
                                      <span className="text-[var(--clay-500)] mt-0.5">•</span>
                                      <span className="flex-1">{subStep}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Breakdown Tips (if any) */}
                      {(message as any).breakdownTips && (message as any).breakdownTips.length > 0 && (
                        <div className="mt-4 p-4 bg-[var(--sage-50)] rounded-xl border border-[var(--sage-300)]">
                          <p className="text-sm font-bold text-[var(--charcoal)] mb-2 flex items-center gap-2">
                            <span>💡</span>
                            <span>Helpful Tips</span>
                          </p>
                          <ul className="space-y-1.5">
                            {(message as any).breakdownTips.map((tip: string, tipIndex: number) => (
                              <li key={tipIndex} className="text-sm text-[var(--charcoal)]/80 leading-relaxed flex items-start gap-2">
                                <span className="text-[var(--sage-600)] mt-0.5">→</span>
                                <span className="flex-1">{tip}</span>
                      </li>
                    ))}
                          </ul>
                        </div>
                      )}
                </div>
              )}
              
                  {/* Sources/Resources - ChatGPT/Claude Style - Horizontal Layout */}
                  {(() => {
                    // Filter valid resources and sources
                    const validResources = message.resources?.filter(r => r.title && r.title.trim() && r.url && r.url.trim()) || [];
                    const validSources = message.sources?.filter(s => s.title && s.title.trim() && s.url && s.url.trim()) || [];
                    const totalSources = validResources.length + validSources.length;
                    
                    if (totalSources === 0) return null;
                    
                    return (
                      <div className="mt-6">
                        <button
                          onClick={() => setExpandedSources(prev => ({ ...prev, [message.id]: !prev[message.id] }))}
                          className="inline-flex items-center gap-3 px-4 py-3 bg-[var(--sand)] hover:bg-[var(--stone)] border-2 border-[var(--clay-300)] hover:border-[var(--clay-400)] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-[var(--clay-500)] rounded-lg">
                            {expandedSources[message.id] ? (
                              <ChevronUp className="w-5 h-5 text-white" strokeWidth={3} />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-[var(--charcoal)]">
                              {totalSources}
                            </span>
                            <span className="text-sm font-semibold text-[var(--charcoal)]/80">
                              {totalSources === 1 ? 'Source' : 'Sources'}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--charcoal)]/60 font-medium ml-1">
                            {expandedSources[message.id] ? 'Hide' : 'Show'}
                          </span>
                        </button>
                        
                        {expandedSources[message.id] && (
                          <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
                            {validResources.map((resource, index) => (
                              <a
                                key={`resource-${index}`}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                                className="flex-shrink-0 w-72 p-4 bg-white hover:bg-[var(--sand)] rounded-2xl border-2 border-[var(--clay-300)] hover:border-[var(--clay-500)] transition-all hover:shadow-lg active:scale-[0.98] group"
                      >
                                <div className="flex items-start gap-3 mb-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-[var(--clay-500)] flex items-center justify-center flex-shrink-0">
                                    <ExternalLink className="w-4 h-4 text-white" strokeWidth={2.5} />
                                  </div>
                                  <p className="text-sm font-bold text-[var(--charcoal)] group-hover:text-[var(--clay-600)] line-clamp-2 leading-snug">
                        {resource.title}
                                  </p>
                                </div>
                                {resource.description && (
                                  <p className="text-sm text-[var(--charcoal)]/70 line-clamp-2 leading-relaxed ml-11">
                                    {resource.description}
                                  </p>
                                )}
                              </a>
                            ))}
                            {validSources.map((source, index) => (
                              <a
                                key={`source-${index}`}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 w-72 p-4 bg-white hover:bg-[var(--sand)] rounded-2xl border-2 border-[var(--clay-300)] hover:border-[var(--clay-500)] transition-all hover:shadow-lg active:scale-[0.98] group"
                              >
                                <div className="flex items-start gap-3 mb-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-[var(--clay-500)] flex items-center justify-center flex-shrink-0">
                                    <ExternalLink className="w-4 h-4 text-white" strokeWidth={2.5} />
                                  </div>
                                  <p className="text-sm font-bold text-[var(--charcoal)] group-hover:text-[var(--clay-600)] line-clamp-2 leading-snug">
                                    {source.title}
                                  </p>
                                </div>
                                {source.excerpt && (
                                  <p className="text-sm text-[var(--charcoal)]/70 line-clamp-2 leading-relaxed ml-11">
                                    {source.excerpt}
                                  </p>
                                )}
                      </a>
                    ))}
                  </div>
                        )}
                </div>
                    );
                  })()}
              
              {/* Function call result */}
              {message.functionCall && (
                    <div className="mt-5 p-3 bg-[var(--sage-100)]/50 rounded-lg border border-[var(--sage-300)]">
                      <p className="text-xs font-semibold mb-1.5 text-[var(--charcoal)]">
                    {message.functionCall.name === 'break_down_task' && '📋 Task Breakdown Created'}
                    {message.functionCall.name === 'get_references' && '📚 Resources Found'}
                  </p>
                  {message.functionCall.result?.link && (
                    <a
                      href={message.functionCall.result.link}
                          className="text-xs text-[var(--clay-600)] hover:text-[var(--clay-700)] font-medium hover:underline underline-offset-2 transition-colors"
                    >
                      View in Task Visualizer →
                    </a>
                  )}
                </div>
              )}
                </div>
            </div>
            )}
          </div>
        ))}
        
        {/* Modern Typing Indicator */}
        {isTyping && (
          <div className="flex flex-col max-w-[90%]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-500)] flex items-center justify-center shadow-sm">
                <MessageCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-[var(--charcoal)]/60 uppercase tracking-wider">
                Navia
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[var(--clay-400)] rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
                <div className="w-2 h-2 bg-[var(--clay-400)] rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></div>
                <div className="w-2 h-2 bg-[var(--clay-400)] rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Enhanced for Accessibility */}
      <div className="px-6 py-6 border-t-2 border-[var(--clay-200)] bg-[var(--sand)]/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Type your message here..."
            className="flex-1 px-5 py-4 text-base border-2 border-[var(--clay-300)] rounded-2xl focus:ring-4 focus:ring-[var(--clay-400)]/30 focus:border-[var(--clay-500)] text-[var(--charcoal)] placeholder:text-[var(--charcoal)]/50 transition-all duration-200 bg-white font-medium shadow-sm"
            disabled={isLoading}
            aria-label="Message input"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-7 py-4 bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] hover:from-[var(--clay-600)] hover:to-[var(--clay-700)] text-white rounded-2xl font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 min-w-[100px]"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-sm">Send</span>
          </button>
        </div>
        <p className="text-xs text-[var(--charcoal)]/60 mt-3 font-medium">
          💡 Tip: Press Enter to send your message
        </p>
      </div>
    </div>
  );
}
