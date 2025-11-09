// Agent System Types
// Shared TypeScript interfaces for the multi-agent architecture

import { KnowledgeSource } from '../pinecone/rag';
import { ChatMessage } from '../pinecone/chat-history';

/**
 * Domain types for specialized agents
 */
export type AgentDomain = 'finance' | 'career' | 'daily_task';

/**
 * User context passed to agents for personalization
 */
export interface UserContext {
  ef_profile?: string[];
  current_goals?: string[];
  energy_level?: 'low' | 'medium' | 'high';
  preferences?: {
    breakdownPreference?: 'always' | 'ask' | 'never';
    communicationStyle?: 'concise' | 'detailed' | 'supportive';
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Context provided to each agent for processing
 */
export interface AgentContext {
  userId: string;
  query: string;
  userContext?: UserContext;
  profileSummary?: string;
  recentMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  chatHistory?: ChatMessage[];
  relevantConversations?: ChatMessage[];
  relevantSources?: KnowledgeSource[];
}

/**
 * Structured response from any agent
 */
export interface AIResponse {
  domain: AgentDomain;
  summary: string;
  breakdown?: string[];
  resources?: ResourceLink[];
  sources?: SourceReference[];
  metadata?: {
    confidence?: number;
    complexity?: number;
    needsBreakdown?: boolean;
    suggestedActions?: string[];
    [key: string]: any;
  };
}

/**
 * Resource link with description
 */
export interface ResourceLink {
  title: string;
  url: string;
  description: string;
  type: 'article' | 'tool' | 'guide' | 'template' | 'video';
}

/**
 * Source reference from RAG
 */
export interface SourceReference {
  title: string;
  url?: string;
  excerpt: string;
  relevance?: number;
}

/**
 * Task breakdown from breakdown tool
 */
export interface TaskBreakdown {
  breakdown: string[];
  needsBreakdown: boolean;
  complexity: number;
  estimatedTime?: string;
  reasoning?: string;
}

/**
 * Intent detection result from orchestrator
 */
export interface IntentDetection {
  domains: AgentDomain[];
  confidence: number;
  needsBreakdown: boolean;
  complexity: number;
  reasoning: string;
}

/**
 * Agent execution result
 */
export interface AgentResult {
  success: boolean;
  response?: AIResponse;
  error?: string;
  executionTime?: number;
}

/**
 * Multi-agent orchestration result
 */
export interface OrchestrationResult {
  success: boolean;
  responses: AIResponse[];
  combinedSummary?: string;
  breakdown?: string[];
  allSources?: SourceReference[];
  allResources?: ResourceLink[];
  metadata: {
    domainsInvolved: AgentDomain[];
    executionTime: number;
    usedBreakdown: boolean;
    [key: string]: any;
  };
}

/**
 * External tool result
 */
export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
  source: 'tavily' | 'finance_api' | 'career_api' | 'internal';
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  domain: AgentDomain;
  name: string;
  description: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  useRAG?: boolean;
  useExternalTools?: boolean;
  autoBreakdown?: boolean;
}

/**
 * Breakdown request
 */
export interface BreakdownRequest {
  task: string;
  context?: string;
  complexity?: number;
  userEFProfile?: string[];
}

/**
 * Breakdown response
 */
export interface BreakdownResponse {
  breakdown: string[];
  needsBreakdown: boolean;
  complexity: number;
  estimatedTime?: string;
  tips?: string[];
}

