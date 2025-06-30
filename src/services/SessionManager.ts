import { IStorageService } from './IStorageService.js';
import { SequentialThoughtData, CollaborativeReasoningData, ScientificMethodData, ProblemDecompositionData } from '../schemas/index.js';

// Generic session data wrapper
interface BaseSessionData {
  toolType: string;
  createdAt: Date;
  lastAccessedAt: Date;
  metadata?: Record<string, any>;
}

// Specific tool session data interfaces
interface SequentialThinkingSessionData extends BaseSessionData {
  toolType: 'sequential_thinking';
  thoughtHistory: SequentialThoughtData[];
  branches: Record<string, SequentialThoughtData[]>;
  currentThought?: SequentialThoughtData;
}

interface CollaborativeReasoningSessionData extends BaseSessionData {
  toolType: 'collaborative_reasoning';
  sessionData: CollaborativeReasoningData;
  contributionHistory: any[];
  stageProgress: Record<string, boolean>;
}

interface ScientificMethodSessionData extends BaseSessionData {
  toolType: 'scientific_method';
  inquiryData: ScientificMethodData;
  stageHistory: Array<{ stage: string; timestamp: Date; data: any }>;
  hypothesesHistory: any[];
}

interface DomainModelingSessionData extends BaseSessionData {
  toolType: 'domain_modeling';
  modelData: any;
  iterationHistory: any[];
  validationResults: any[];
}

interface ProblemDecompositionSessionData extends BaseSessionData {
  toolType: 'problem_decomposition';
  decompositionData: ProblemDecompositionData;
  revisionHistory: Array<{ revision: number; timestamp: Date; data: ProblemDecompositionData; changes: any }>;
  progressUpdates: Array<{ timestamp: Date; taskId: string; oldStatus: string; newStatus: string; notes?: string }>;
  metricsHistory: Array<{ timestamp: Date; metrics: any }>;
}

// Union type for all supported session data
type SessionData = SequentialThinkingSessionData | CollaborativeReasoningSessionData | ScientificMethodSessionData | DomainModelingSessionData | ProblemDecompositionSessionData;

// Legacy interface for backward compatibility
interface ThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  nextThoughtNeeded: boolean;
}

/**
 * Defines the contract for session management.
 * All operations are asynchronous and return Promises.
 */
export interface ISessionManager {
  // Generic session management
  createSession(sessionId: string, toolType?: string): Promise<void>;
  getSession(sessionId: string): Promise<SessionData | null>;
  clearSession(sessionId: string): Promise<void>;
  updateSession(sessionId: string, updateData: Partial<SessionData>): Promise<void>;

  // Sequential thinking specific methods (legacy compatibility)
  addThought(sessionId: string, thought: ThoughtData): Promise<void>;
  addBranch(sessionId: string, branchId: string, thought: ThoughtData): Promise<void>;
  getThoughtHistory(sessionId: string): Promise<ThoughtData[]>;
  getBranches(sessionId: string): Promise<Record<string, ThoughtData[]>>;

  // Tool-specific session management
  getSequentialThinkingSession(sessionId: string): Promise<SequentialThinkingSessionData | null>;
  updateSequentialThinkingSession(sessionId: string, data: Partial<SequentialThinkingSessionData>): Promise<void>;

  getCollaborativeReasoningSession(sessionId: string): Promise<CollaborativeReasoningSessionData | null>;
  updateCollaborativeReasoningSession(sessionId: string, data: Partial<CollaborativeReasoningSessionData>): Promise<void>;

  getScientificMethodSession(sessionId: string): Promise<ScientificMethodSessionData | null>;
  updateScientificMethodSession(sessionId: string, data: Partial<ScientificMethodSessionData>): Promise<void>;

  getDomainModelingSession(sessionId: string): Promise<DomainModelingSessionData | null>;
  updateDomainModelingSession(sessionId: string, data: Partial<DomainModelingSessionData>): Promise<void>;

  getProblemDecompositionSession(sessionId: string): Promise<ProblemDecompositionSessionData | null>;
  updateProblemDecompositionSession(sessionId: string, data: Partial<ProblemDecompositionSessionData>): Promise<void>;
}

/**
 * Manages user sessions using a persistent storage backend.
 * This implementation is stateless and relies on an injected IStorageService.
 * Supports multiple tool types with tool-specific session data structures.
 */
export class SessionManager implements ISessionManager {
  private storage: IStorageService;
  private readonly sessionTTL: number; // Session TTL in seconds
  private readonly redisNamespace: string;

  /**
   * @param storageService The storage service to be used for persistence.
   */
  constructor(storageService: IStorageService) {
    this.storage = storageService;
    this.sessionTTL = process.env.SESSION_TTL_SECONDS ? parseInt(process.env.SESSION_TTL_SECONDS, 10) : 14400;
    this.redisNamespace = process.env.REDIS_NAMESPACE || 'session';
  }

  private getSessionKey(sessionId: string): string {
    return `${this.redisNamespace}:${sessionId}`;
  }

  /**
   * Recursively convert date strings back to Date objects in session data
   */
  private reviveDates(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      // Try to parse as date if it looks like an ISO date string
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(obj)) {
        return new Date(obj);
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.reviveDates(item));
    }

    if (typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.reviveDates(value);
      }
      return result;
    }

    return obj;
  }

  async createSession(sessionId: string, toolType: string = 'sequential_thinking'): Promise<void> {
    const now = new Date();
    let newSession: SessionData;

    switch (toolType) {
      case 'sequential_thinking':
        newSession = {
          toolType: 'sequential_thinking',
          thoughtHistory: [],
          branches: {},
          createdAt: now,
          lastAccessedAt: now,
        } as SequentialThinkingSessionData;
        break;

      case 'collaborative_reasoning':
        newSession = {
          toolType: 'collaborative_reasoning',
          sessionData: {} as CollaborativeReasoningData,
          contributionHistory: [],
          stageProgress: {},
          createdAt: now,
          lastAccessedAt: now,
        } as CollaborativeReasoningSessionData;
        break;

      case 'scientific_method':
        newSession = {
          toolType: 'scientific_method',
          inquiryData: {} as ScientificMethodData,
          stageHistory: [],
          hypothesesHistory: [],
          createdAt: now,
          lastAccessedAt: now,
        } as ScientificMethodSessionData;
        break;

      case 'domain_modeling':
        newSession = {
          toolType: 'domain_modeling',
          modelData: {},
          iterationHistory: [],
          validationResults: [],
          createdAt: now,
          lastAccessedAt: now,
        } as DomainModelingSessionData;
        break;

      case 'problem_decomposition':
        newSession = {
          toolType: 'problem_decomposition',
          decompositionData: {} as ProblemDecompositionData,
          revisionHistory: [],
          progressUpdates: [],
          metricsHistory: [],
          createdAt: now,
          lastAccessedAt: now,
        } as ProblemDecompositionSessionData;
        break;

      default:
        throw new Error(`Unsupported tool type: ${toolType}`);
    }

    await this.storage.set(this.getSessionKey(sessionId), newSession, this.sessionTTL);
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const sessionKey = this.getSessionKey(sessionId);
    const session = await this.storage.get<SessionData>(sessionKey);

    if (session) {
      if (this.storage.expire) {
        await this.storage.expire(sessionKey, this.sessionTTL);
      }
      // Convert all date strings back to Date objects recursively
      const revivedSession = this.reviveDates(session) as SessionData;
      revivedSession.lastAccessedAt = new Date();
      // await this.storage.set(sessionKey, revivedSession, this.sessionTTL);
      return revivedSession;
    }
    return null;
  }

  async updateSession(sessionId: string, updateData: Partial<SessionData>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      const updatedSession = { ...session, ...updateData, lastAccessedAt: new Date() };
      await this.storage.set(this.getSessionKey(sessionId), updatedSession, this.sessionTTL);
    }
  }

  async clearSession(sessionId: string): Promise<void> {
    await this.storage.delete(this.getSessionKey(sessionId));
  }

  async addThought(sessionId: string, thought: ThoughtData): Promise<void> {
    let session = await this.getSession(sessionId);
    if (!session) {
      await this.createSession(sessionId, 'sequential_thinking');
      session = await this.getSession(sessionId);
    }

    if (session && session.toolType === 'sequential_thinking') {
      const sequentialSession = session as SequentialThinkingSessionData;
      sequentialSession.thoughtHistory.push(thought as SequentialThoughtData);
      await this.storage.set(this.getSessionKey(sessionId), sequentialSession, this.sessionTTL);
    }
  }

  async addBranch(sessionId: string, branchId: string, thought: ThoughtData): Promise<void> {
    let session = await this.getSession(sessionId);
    if (!session) {
      await this.createSession(sessionId, 'sequential_thinking');
      session = await this.getSession(sessionId);
    }

    if (session && session.toolType === 'sequential_thinking') {
      const sequentialSession = session as SequentialThinkingSessionData;
      if (!sequentialSession.branches[branchId]) {
        sequentialSession.branches[branchId] = [];
      }
      sequentialSession.branches[branchId].push(thought as SequentialThoughtData);
      await this.storage.set(this.getSessionKey(sessionId), sequentialSession, this.sessionTTL);
    }
  }

  async getThoughtHistory(sessionId: string): Promise<ThoughtData[]> {
    const session = await this.getSession(sessionId);
    if (session && session.toolType === 'sequential_thinking') {
      const sequentialSession = session as SequentialThinkingSessionData;
      return [...sequentialSession.thoughtHistory] as ThoughtData[];
    }
    return [];
  }

  async getBranches(sessionId: string): Promise<Record<string, ThoughtData[]>> {
    const session = await this.getSession(sessionId);
    if (session && session.toolType === 'sequential_thinking') {
      const sequentialSession = session as SequentialThinkingSessionData;
      return { ...sequentialSession.branches } as Record<string, ThoughtData[]>;
    }
    return {};
  }

  // Tool-specific session management methods

  async getSequentialThinkingSession(sessionId: string): Promise<SequentialThinkingSessionData | null> {
    const session = await this.getSession(sessionId);
    return (session && session.toolType === 'sequential_thinking') ? session as SequentialThinkingSessionData : null;
  }

  async updateSequentialThinkingSession(sessionId: string, data: Partial<SequentialThinkingSessionData>): Promise<void> {
    await this.updateSession(sessionId, data);
  }

  async getCollaborativeReasoningSession(sessionId: string): Promise<CollaborativeReasoningSessionData | null> {
    const session = await this.getSession(sessionId);
    return (session && session.toolType === 'collaborative_reasoning') ? session as CollaborativeReasoningSessionData : null;
  }

  async updateCollaborativeReasoningSession(sessionId: string, data: Partial<CollaborativeReasoningSessionData>): Promise<void> {
    await this.updateSession(sessionId, data);
  }

  async getScientificMethodSession(sessionId: string): Promise<ScientificMethodSessionData | null> {
    const session = await this.getSession(sessionId);
    return (session && session.toolType === 'scientific_method') ? session as ScientificMethodSessionData : null;
  }

  async updateScientificMethodSession(sessionId: string, data: Partial<ScientificMethodSessionData>): Promise<void> {
    await this.updateSession(sessionId, data);
  }

  async getDomainModelingSession(sessionId: string): Promise<DomainModelingSessionData | null> {
    const session = await this.getSession(sessionId);
    return (session && session.toolType === 'domain_modeling') ? session as DomainModelingSessionData : null;
  }

  async updateDomainModelingSession(sessionId: string, data: Partial<DomainModelingSessionData>): Promise<void> {
    await this.updateSession(sessionId, data);
  }

  async getProblemDecompositionSession(sessionId: string): Promise<ProblemDecompositionSessionData | null> {
    const session = await this.getSession(sessionId);
    return (session && session.toolType === 'problem_decomposition') ? session as ProblemDecompositionSessionData : null;
  }

  async updateProblemDecompositionSession(sessionId: string, data: Partial<ProblemDecompositionSessionData>): Promise<void> {
    await this.updateSession(sessionId, data);
  }

  // Utility methods

  async getSessionMetadata(sessionId: string): Promise<{ toolType: string; createdAt: Date; lastAccessedAt: Date; metadata?: Record<string, any> } | null> {
    const session = await this.getSession(sessionId);
    if (session) {
      return {
        toolType: session.toolType,
        createdAt: session.createdAt,
        lastAccessedAt: session.lastAccessedAt,
        metadata: session.metadata
      };
    }
    return null;
  }

  async listActiveSessions(): Promise<string[]> {
    // This would require implementing a session index in Redis
    // For now, returning empty array as it requires additional Redis operations
    return [];
  }

  // --- Sequential Thinking (new Redis model) ---

  private getSeqMetaKey(sessionId: string): string {
    return `${this.redisNamespace}:sequential:${sessionId}:meta`;
  }
  private getSeqThoughtsKey(sessionId: string): string {
    return `${this.redisNamespace}:sequential:${sessionId}:thoughts`;
  }
  private getSeqBranchesKey(sessionId: string): string {
    return `${this.redisNamespace}:sequential:${sessionId}:branches`;
  }

  /**
   * Creates a new Sequential Thinking session using Redis hash for metadata.
   */
  async createSequentialThinkingSession(sessionId: string): Promise<void> {
    if (!this.storage.hset) {
      throw new Error('Storage service does not support hset operation required for sequential thinking sessions');
    }
    const now = new Date();
    const meta = {
      toolType: 'sequential_thinking',
      createdAt: now.toISOString(),
      lastAccessedAt: now.toISOString(),
    };
    await this.storage.hset(this.getSeqMetaKey(sessionId), 'meta', meta);
    // No need to initialize thoughts or branches; they are empty by default
  }

  /**
   * Adds a thought to the sorted set for the session.
   */
  async addSequentialThought(sessionId: string, thought: SequentialThoughtData): Promise<void> {
    if (!this.storage.zadd) {
      throw new Error('Storage service does not support zadd operation required for sequential thoughts');
    }
    if (!this.storage.hset) {
      throw new Error('Storage service does not support hset operation required for sequential thoughts');
    }
    const key = this.getSeqThoughtsKey(sessionId);
    await this.storage.zadd(key, [thought.thoughtNumber, JSON.stringify(thought)]);
    // Optionally update lastAccessedAt
    await this.storage.hset(this.getSeqMetaKey(sessionId), 'lastAccessedAt', new Date().toISOString());
  }

  /**
   /**
    * Gets the full thought history for a session from the sorted set.
    */
   async getSequentialThoughtHistory(sessionId: string): Promise<SequentialThoughtData[]> {
     if (!this.storage.zrange) {
       throw new Error('Storage service does not support zrange operation required for sequential thought history');
     }
     const key = this.getSeqThoughtsKey(sessionId);
     const raw = await this.storage.zrange(key, 0, -1);
     // Ensure we have a string array (not withScores format)
     if (!Array.isArray(raw)) {
       return [];
     }
     return (raw as string[]).map((v: string) => JSON.parse(v));
   }
  /**
   * Adds a branch (array of thoughts) to the branches hash.
   */
  async addSequentialBranch(sessionId: string, branchId: string, thoughts: SequentialThoughtData[]): Promise<void> {
    if (!this.storage.hset) {
      throw new Error('Storage service does not support hset operation required for sequential branch management');
    }
    await this.storage.hset(this.getSeqBranchesKey(sessionId), branchId, thoughts);
    await this.storage.hset(this.getSeqMetaKey(sessionId), 'lastAccessedAt', new Date().toISOString());
  }

  /**
   /**
    * Gets all branches for a session from the branches hash.
    */
   async getSequentialBranches(sessionId: string): Promise<Record<string, SequentialThoughtData[]>> {
     if (!this.storage.hgetall) {
       throw new Error('Storage service does not support hgetall operation required for sequential branches');
     }
     return await this.storage.hgetall(this.getSeqBranchesKey(sessionId));
   }
  /**
   /**
    * Gets the full SequentialThinkingSessionData by reconstructing from Redis primitives.
    */
   async getSequentialThinkingSessionNew(sessionId: string): Promise<SequentialThinkingSessionData | null> {
     if (!this.storage.hget) {
       throw new Error('Storage service does not support hget operation required for sequential thinking sessions');
     }
     const metaRaw = await this.storage.hget(this.getSeqMetaKey(sessionId), 'meta');
     if (!metaRaw) return null;
     const meta = typeof metaRaw === 'string' ? JSON.parse(metaRaw) : metaRaw;
     const thoughtHistory = await this.getSequentialThoughtHistory(sessionId);
     const branches = await this.getSequentialBranches(sessionId);
     return {
       toolType: 'sequential_thinking',
       createdAt: new Date(meta.createdAt),
       lastAccessedAt: new Date(meta.lastAccessedAt),
       thoughtHistory,
       branches,
     };
   }
  /**
   /**
    * Updates only the metadata hash for a Sequential Thinking session.
    */
   async updateSequentialThinkingSessionMeta(sessionId: string, update: Partial<{ createdAt: string; lastAccessedAt: string }>): Promise<void> {
     if (!this.storage.hset) {
       throw new Error('Storage service does not support hset operation required for sequential thinking session metadata updates');
     }
     for (const [k, v] of Object.entries(update)) {
       await this.storage.hset(this.getSeqMetaKey(sessionId), k, v);
     }
   }
}

// Export session data types for use by tool servers
export type {
  SessionData,
  SequentialThinkingSessionData,
  CollaborativeReasoningSessionData,
  ScientificMethodSessionData,
  DomainModelingSessionData,
  ProblemDecompositionSessionData,
  ThoughtData
};
