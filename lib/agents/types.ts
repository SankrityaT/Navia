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
  breakdown?: BreakdownStep[];  // Hierarchical steps with sub-steps
  breakdownTips?: string[];  // Tips for completing the breakdown
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
 * Individual step in a breakdown (with sub-steps)
 */
export interface BreakdownStep {
  title: string;  // Main step description
  timeEstimate?: string;  // e.g., "5 min"
  subSteps?: string[];  // Optional sub-steps for this main step
  isOptional?: boolean;  // Can be skipped without blocking progress
  isHard?: boolean;  // Flag for steps users find difficult (phone calls, asking for help, etc.)
}

/**
 * Hierarchical task step with sub-steps
 */
export interface TaskStep {
  stepNumber: number;
  action: string;
  duration: string; // e.g., "2 minutes", "30 seconds"
  isComplex: boolean; // true if this step has sub-steps
  subSteps: string[]; // empty array if not complex
}

/**
 * Task breakdown from breakdown tool (hierarchical format)
 */
export interface TaskBreakdown {
  why: string; // One sentence explaining why this task matters
  mainSteps: TaskStep[];
  totalSteps: number; // Count of main steps
  totalSubSteps: number; // Total count of all sub-steps across all main steps
  encouragement: string; // Message shown when task is complete
  energyNote?: string; // Optional note if user has low energy
}

/**
 * Legacy task breakdown format (deprecated, use TaskBreakdown instead)
 */
export interface LegacyTaskBreakdown {
  breakdown: BreakdownStep[];  // Hierarchical steps with sub-steps
  needsBreakdown: boolean;
  complexity: number;
  estimatedTime?: string;
  reasoning?: string;
  tips?: string[];  // Helpful tips for completing the task
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
  breakdown?: BreakdownStep[];  // Hierarchical breakdown from primary agent only
  breakdownTips?: string[];  // Tips from primary agent
  resources?: ResourceLink[];  // Changed from allResources for consistency
  sources?: SourceReference[];  // Changed from allSources for consistency
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
  breakdown: BreakdownStep[];  // Hierarchical steps with sub-steps
  needsBreakdown: boolean;
  complexity: number;
  estimatedTime?: string;
  tips?: string[];
}

