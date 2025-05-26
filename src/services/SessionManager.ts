interface SessionData {
  thoughtHistory: ThoughtData[];
  branches: Record<string, ThoughtData[]>;
  createdAt: Date;
  lastAccessedAt: Date;
}

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

export interface SessionManager {
  createSession(sessionId: string): void;
  getSession(sessionId: string): SessionData | null;
  clearSession(sessionId: string): void;
  cleanupExpiredSessions(): void;
  addThought(sessionId: string, thought: ThoughtData): void;
  addBranch(sessionId: string, branchId: string, thought: ThoughtData): void;
  getThoughtHistory(sessionId: string): ThoughtData[];
  getBranches(sessionId: string): Record<string, ThoughtData[]>;
}

export class InMemorySessionManager implements SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private readonly SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Run cleanup every 15 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 15 * 60 * 1000);
  }

  createSession(sessionId: string): void {
    const now = new Date();
    this.sessions.set(sessionId, {
      thoughtHistory: [],
      branches: {},
      createdAt: now,
      lastAccessedAt: now,
    });
  }

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastAccessedAt = new Date();
      return session;
    }
    return null;
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastAccess = now.getTime() - session.lastAccessedAt.getTime();
      if (timeSinceLastAccess > this.SESSION_TIMEOUT_MS) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.sessions.delete(sessionId);
      console.log(`Cleaned up expired session: ${sessionId}`);
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  addThought(sessionId: string, thought: ThoughtData): void {
    let session = this.getSession(sessionId);
    if (!session) {
      this.createSession(sessionId);
      session = this.getSession(sessionId)!;
    }
    session.thoughtHistory.push(thought);
  }

  addBranch(sessionId: string, branchId: string, thought: ThoughtData): void {
    let session = this.getSession(sessionId);
    if (!session) {
      this.createSession(sessionId);
      session = this.getSession(sessionId)!;
    }

    if (!session.branches[branchId]) {
      session.branches[branchId] = [];
    }
    session.branches[branchId].push(thought);
  }

  getThoughtHistory(sessionId: string): ThoughtData[] {
    const session = this.getSession(sessionId);
    return session ? session.thoughtHistory : [];
  }

  getBranches(sessionId: string): Record<string, ThoughtData[]> {
    const session = this.getSession(sessionId);
    return session ? session.branches : {};
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.sessions.clear();
  }

  // Utility methods for monitoring
  getSessionCount(): number {
    return this.sessions.size;
  }

  getSessionInfo(): Array<{ sessionId: string, thoughtCount: number, branchCount: number, lastAccessed: Date }> {
    const sessionInfo: Array<{ sessionId: string, thoughtCount: number, branchCount: number, lastAccessed: Date }> = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      sessionInfo.push({
        sessionId,
        thoughtCount: session.thoughtHistory.length,
        branchCount: Object.keys(session.branches).length,
        lastAccessed: session.lastAccessedAt,
      });
    }

    return sessionInfo;
  }
}

// Export a singleton instance
export const sessionManager = new InMemorySessionManager();
