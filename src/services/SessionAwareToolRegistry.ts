import { SessionManager } from './SessionManager.js';
import { RedisStorageAdapter } from './RedisStorageAdapter.js';
import { Redis } from 'ioredis';

/**
 * Session-Aware Tool Registry
 * 
 * Automatically detects session-capable tools and manages session lifecycle
 * across all cognitive tools in the thinking-patterns system.
 */

export interface SessionCapableToolServer {
  sessionManager?: SessionManager | null;
  getSessionHistory?(sessionId: string): Promise<any[]>;
  clearSession?(sessionId: string): Promise<boolean>;
  getSessionData?(sessionId: string): Promise<any>;
}

export interface SessionDetectionResult {
  hasSessionId: boolean;
  sessionIdField: string | null;
  sessionIdValue: string | null;
  toolType: string;
  isSessionCapable: boolean;
}

export interface SessionAnalytics {
  activeSessions: number;
  toolUsage: Record<string, number>;
  sessionDurations: Record<string, number>;
  avgSessionDuration: number;
  mostUsedTool: string;
  sessionSuccessRate: number;
}

/**
 * Central registry for managing session-aware cognitive tools
 */
export class SessionAwareToolRegistry {
  private static instance: SessionAwareToolRegistry;
  private sessionManager: SessionManager | null = null;
  private toolServers: Map<string, SessionCapableToolServer> = new Map();
  private sessionDetectionRules: Map<string, string[]> = new Map();

  private constructor() {
    this.initializeSessionManager();
    this.setupSessionDetectionRules();
  }

  public static getInstance(): SessionAwareToolRegistry {
    if (!SessionAwareToolRegistry.instance) {
      SessionAwareToolRegistry.instance = new SessionAwareToolRegistry();
    }
    return SessionAwareToolRegistry.instance;
  }

  private initializeSessionManager(): void {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const redis = new Redis(redisUrl);
      const redisAdapter = new RedisStorageAdapter(redis);
      this.sessionManager = new SessionManager(redisAdapter);
    } catch (error) {
      console.warn('Redis not available for session management:', error);
      this.sessionManager = null;
    }
  }

  /**
   * Define session ID field names for each tool type
   */
  private setupSessionDetectionRules(): void {
    this.sessionDetectionRules.set('sequential_thinking', ['sessionId']);
    this.sessionDetectionRules.set('collaborative_reasoning', ['sessionId']);
    this.sessionDetectionRules.set('scientific_method', ['inquiryId']);
    this.sessionDetectionRules.set('domain_modeling', ['modelingId']);
    this.sessionDetectionRules.set('problem_decomposition', ['decompositionId']);
    this.sessionDetectionRules.set('temporal_thinking', ['temporalId', 'sessionId']);
    
    // Future session-capable tools
    this.sessionDetectionRules.set('visual_reasoning', ['diagramId', 'sessionId']);
    this.sessionDetectionRules.set('structured_argumentation', ['argumentId', 'sessionId']);
  }

  /**
   * Register a tool server with session capabilities
   */
  public registerTool(toolName: string, server: SessionCapableToolServer): void {
    this.toolServers.set(toolName, server);
    
    // Inject session manager if the tool supports it
    if (server.sessionManager !== undefined && this.sessionManager) {
      server.sessionManager = this.sessionManager;
    }
  }

  /**
   * Detect session information from tool input
   */
  public detectSession(toolName: string, input: any): SessionDetectionResult {
    const sessionFields = this.sessionDetectionRules.get(toolName) || [];
    let sessionIdField: string | null = null;
    let sessionIdValue: string | null = null;

    // Look for session ID fields in the input
    for (const field of sessionFields) {
      if (input && typeof input === 'object' && input[field]) {
        sessionIdField = field;
        sessionIdValue = input[field];
        break;
      }
    }

    return {
      hasSessionId: !!sessionIdValue,
      sessionIdField,
      sessionIdValue,
      toolType: this.getToolTypeFromName(toolName),
      isSessionCapable: this.sessionDetectionRules.has(toolName)
    };
  }

  /**
   * Get the appropriate tool type for session management
   */
  private getToolTypeFromName(toolName: string): string {
    const typeMapping: Record<string, string> = {
      'sequential_thinking': 'sequential_thinking',
      'collaborative_reasoning': 'collaborative_reasoning', 
      'scientific_method': 'scientific_method',
      'domain_modeling': 'domain_modeling',
      'problem_decomposition': 'problem_decomposition',
      'temporal_thinking': 'temporal_thinking'
    };

    return typeMapping[toolName] || 'unknown';
  }

  /**
   * Automatically create session if one doesn't exist
   */
  public async ensureSession(sessionDetection: SessionDetectionResult): Promise<boolean> {
    if (!sessionDetection.hasSessionId || !sessionDetection.sessionIdValue || !this.sessionManager) {
      return false;
    }

    try {
      const existingSession = await this.sessionManager.getSession(sessionDetection.sessionIdValue);
      
      if (!existingSession) {
        await this.sessionManager.createSession(sessionDetection.sessionIdValue, sessionDetection.toolType);
        return true;
      }
      
      return false; // Session already existed
    } catch (error) {
      console.warn('Error ensuring session:', error);
      return false;
    }
  }

  /**
   * Get session metadata for any tool
   */
  public async getSessionMetadata(sessionId: string): Promise<any> {
    if (!this.sessionManager) {
      return null;
    }

    try {
      return await this.sessionManager.getSessionMetadata(sessionId);
    } catch (error) {
      console.warn('Error getting session metadata:', error);
      return null;
    }
  }

  /**
   * Get session data for any tool  
   */
  public async getSessionData(toolName: string, sessionId: string): Promise<any> {
    const server = this.toolServers.get(toolName);
    
    if (server && server.getSessionData) {
      try {
        return await server.getSessionData(sessionId);
      } catch (error) {
        console.warn(`Error getting session data for ${toolName}:`, error);
      }
    }

    // Fallback to tool-specific session data
    if (this.sessionManager) {
      try {
        switch (toolName) {
          case 'sequential_thinking':
            return await this.sessionManager.getSequentialThinkingSession(sessionId);
          case 'collaborative_reasoning':
            return await this.sessionManager.getCollaborativeReasoningSession(sessionId);
          case 'scientific_method':
            return await this.sessionManager.getScientificMethodSession(sessionId);
          case 'domain_modeling':
            return await this.sessionManager.getDomainModelingSession(sessionId);
          case 'problem_decomposition':
            return await this.sessionManager.getProblemDecompositionSession(sessionId);
          default:
            return await this.sessionManager.getSession(sessionId);
        }
      } catch (error) {
        console.warn('Error getting tool-specific session data:', error);
      }
    }

    return null;
  }

  /**
   * Get session history for any tool
   */
  public async getSessionHistory(toolName: string, sessionId: string): Promise<any[]> {
    const server = this.toolServers.get(toolName);
    
    if (server && server.getSessionHistory) {
      try {
        return await server.getSessionHistory(sessionId);
      } catch (error) {
        console.warn(`Error getting session history for ${toolName}:`, error);
      }
    }

    return [];
  }

  /**
   * Clear session for any tool
   */
  public async clearSession(toolName: string, sessionId: string): Promise<boolean> {
    const server = this.toolServers.get(toolName);
    
    if (server && server.clearSession) {
      try {
        return await server.clearSession(sessionId);
      } catch (error) {
        console.warn(`Error clearing session for ${toolName}:`, error);
      }
    }

    // Fallback to generic session clearing
    if (this.sessionManager) {
      try {
        await this.sessionManager.clearSession(sessionId);
        return true;
      } catch (error) {
        console.warn('Error clearing generic session:', error);
      }
    }

    return false;
  }

  /**
   * List all active sessions across all tools
   */
  public async listActiveSessions(): Promise<Array<{ sessionId: string; toolType: string; createdAt: Date; lastAccessed: Date }>> {
    if (!this.sessionManager) {
      return [];
    }

    // This would require implementing a session index in Redis
    // For now, returning empty array as mentioned in SessionManager
    return [];
  }

  /**
   * Get session analytics across all tools
   */
  public async getSessionAnalytics(): Promise<SessionAnalytics> {
    // This would require implementing session analytics in Redis
    // For now, returning basic structure
    return {
      activeSessions: 0,
      toolUsage: {},
      sessionDurations: {},
      avgSessionDuration: 0,
      mostUsedTool: '',
      sessionSuccessRate: 0
    };
  }

  /**
   * Process tool request with automatic session detection and management
   */
  public async processWithSessionAwareness(toolName: string, input: any): Promise<{
    sessionDetection: SessionDetectionResult;
    sessionCreated: boolean;
    sessionMetadata?: any;
  }> {
    const sessionDetection = this.detectSession(toolName, input);
    const sessionCreated = await this.ensureSession(sessionDetection);
    
    let sessionMetadata = null;
    if (sessionDetection.sessionIdValue) {
      sessionMetadata = await this.getSessionMetadata(sessionDetection.sessionIdValue);
    }

    return {
      sessionDetection,
      sessionCreated,
      sessionMetadata
    };
  }

  /**
   * Check if a tool supports session management
   */
  public isSessionCapable(toolName: string): boolean {
    return this.sessionDetectionRules.has(toolName);
  }

  /**
   * Get all session-capable tools
   */
  public getSessionCapableTools(): string[] {
    return Array.from(this.sessionDetectionRules.keys());
  }

  /**
   * Get session detection rules for a tool
   */
  public getSessionDetectionRules(toolName: string): string[] {
    return this.sessionDetectionRules.get(toolName) || [];
  }

  /**
   * Add new session detection rule for a tool
   */
  public addSessionDetectionRule(toolName: string, sessionFields: string[]): void {
    this.sessionDetectionRules.set(toolName, sessionFields);
  }

  /**
   * Cleanup expired sessions (would be called periodically)
   */
  public async cleanupExpiredSessions(): Promise<number> {
    // This would implement session cleanup logic
    // For now, returning 0 as no sessions were cleaned
    return 0;
  }

  /**
   * Generate session ID for a tool if not provided
   */
  public generateSessionId(toolName: string, input?: any): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const prefix = toolName.replace('_', '-');
    
    // Include a hash of input for consistency if input is provided
    let inputHash = '';
    if (input && typeof input === 'object') {
      const inputString = JSON.stringify(input).substring(0, 50);
      inputHash = Math.abs(inputString.split('').reduce((hash, char) => {
        return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
      }, 0)).toString(36);
    }
    
    return `${prefix}-${timestamp}-${random}${inputHash ? '-' + inputHash : ''}`;
  }

  /**
   * Get session manager instance (for advanced usage)
   */
  public getSessionManager(): SessionManager | null {
    return this.sessionManager;
  }

  /**
   * Close all connections and cleanup
   */
  public async close(): Promise<void> {
    // Close Redis connections if needed
    // Implementation would depend on connection pooling setup
  }
}

// Export singleton instance
export const sessionAwareToolRegistry = SessionAwareToolRegistry.getInstance();