/**
 * Tests for SessionManager interface and InMemorySessionManager implementation
 * Tests session lifecycle management, state persistence, and cleanup
 */

import { jest } from '@jest/globals';
import { InMemorySessionManager, sessionManager } from '../../src/services/SessionManager.js';
import { createMockSessionData, createMockTimers, resetAllMocks } from '../helpers/mockFactories.js';

describe('InMemorySessionManager', () => {
  let manager: InMemorySessionManager;

  beforeEach(() => {
    resetAllMocks();
    manager = new InMemorySessionManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('constructor', () => {
    it('should initialize with empty sessions map', () => {
      expect(manager.getSessionCount()).toBe(0);
    });

    it('should set up cleanup interval', () => {
      expect(manager['cleanupInterval']).toBeDefined();
      expect(typeof manager['cleanupInterval']).toBe('object');
    });
  });

  describe('createSession', () => {
    it('should create a new session with empty history', () => {
      const sessionId = 'test-session-1';

      manager.createSession(sessionId);

      const session = manager.getSession(sessionId);
      expect(session).not.toBeNull();
      expect(session!.thoughtHistory).toEqual([]);
      expect(session!.branches).toEqual({});
      expect(session!.createdAt).toBeInstanceOf(Date);
      expect(session!.lastAccessedAt).toBeInstanceOf(Date);
    });

    it('should create multiple sessions independently', () => {
      manager.createSession('session-1');
      manager.createSession('session-2');

      expect(manager.getSessionCount()).toBe(2);

      const session1 = manager.getSession('session-1');
      const session2 = manager.getSession('session-2');

      expect(session1).not.toBe(session2);
      expect(session1!.thoughtHistory).toEqual([]);
      expect(session2!.thoughtHistory).toEqual([]);
    });

    it('should overwrite existing session with same ID', async () => {
      const sessionId = 'test-session';

      manager.createSession(sessionId);
      const originalSession = manager.getSession(sessionId);

      // Add some data to the original session
      manager.addThought(sessionId, {
        thought: "test thought",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      });

      // Wait a moment to ensure different timestamp (increased for CI reliability)
      await new Promise(resolve => setTimeout(resolve, 10));

      // Create new session with same ID
      manager.createSession(sessionId);
      const newSession = manager.getSession(sessionId);

      expect(newSession!.thoughtHistory).toHaveLength(0);
      expect(newSession!.createdAt.getTime()).toBeGreaterThan(originalSession!.createdAt.getTime());
    });
  });

  describe('getSession', () => {
    it('should return null for non-existent session', () => {
      const session = manager.getSession('non-existent');
      expect(session).toBeNull();
    });

    it('should return existing session and update lastAccessedAt', async () => {
      const sessionId = 'test-session';
      manager.createSession(sessionId);

      const originalTime = manager.getSession(sessionId)!.lastAccessedAt;

      // Wait a bit to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const session = manager.getSession(sessionId);
      expect(session).not.toBeNull();
      expect(session!.lastAccessedAt.getTime()).toBeGreaterThan(originalTime.getTime());
    });

    it('should return session data with correct structure', () => {
      const sessionId = 'test-session';
      manager.createSession(sessionId);

      const session = manager.getSession(sessionId);

      expect(session).toHaveProperty('thoughtHistory');
      expect(session).toHaveProperty('branches');
      expect(session).toHaveProperty('createdAt');
      expect(session).toHaveProperty('lastAccessedAt');
      expect(Array.isArray(session!.thoughtHistory)).toBe(true);
      expect(typeof session!.branches).toBe('object');
    });
  });

  describe('clearSession', () => {
    it('should remove existing session', () => {
      const sessionId = 'test-session';
      manager.createSession(sessionId);

      expect(manager.getSession(sessionId)).not.toBeNull();

      manager.clearSession(sessionId);

      expect(manager.getSession(sessionId)).toBeNull();
      expect(manager.getSessionCount()).toBe(0);
    });

    it('should not throw error for non-existent session', () => {
      expect(() => manager.clearSession('non-existent')).not.toThrow();
    });

    it('should only remove specified session', () => {
      manager.createSession('session-1');
      manager.createSession('session-2');

      manager.clearSession('session-1');

      expect(manager.getSession('session-1')).toBeNull();
      expect(manager.getSession('session-2')).not.toBeNull();
      expect(manager.getSessionCount()).toBe(1);
    });
  });

  describe('addThought', () => {
    it('should add thought to existing session', () => {
      const sessionId = 'test-session';
      manager.createSession(sessionId);

      const thought = {
        thought: "Test thought",
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      };

      manager.addThought(sessionId, thought);

      const session = manager.getSession(sessionId);
      expect(session!.thoughtHistory).toHaveLength(1);
      expect(session!.thoughtHistory[0]).toEqual(thought);
    });

    it('should create session if it does not exist', () => {
      const sessionId = 'new-session';
      const thought = {
        thought: "Test thought",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      manager.addThought(sessionId, thought);

      const session = manager.getSession(sessionId);
      expect(session).not.toBeNull();
      expect(session!.thoughtHistory).toHaveLength(1);
      expect(session!.thoughtHistory[0]).toEqual(thought);
    });

    it('should add multiple thoughts in order', () => {
      const sessionId = 'test-session';
      manager.createSession(sessionId);

      const thoughts = [
        { thought: "First thought", thoughtNumber: 1, totalThoughts: 3, nextThoughtNeeded: true },
        { thought: "Second thought", thoughtNumber: 2, totalThoughts: 3, nextThoughtNeeded: true },
        { thought: "Third thought", thoughtNumber: 3, totalThoughts: 3, nextThoughtNeeded: false }
      ];

      thoughts.forEach(thought => manager.addThought(sessionId, thought));

      const session = manager.getSession(sessionId);
      expect(session!.thoughtHistory).toHaveLength(3);
      expect(session!.thoughtHistory).toEqual(thoughts);
    });

    it('should handle optional thought properties', () => {
      const sessionId = 'test-session';
      const thought = {
        thought: "Revision thought",
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true,
        isRevision: true,
        revisesThought: 1,
        branchFromThought: 1,
        branchId: "branch-1"
      };

      manager.addThought(sessionId, thought);

      const session = manager.getSession(sessionId);
      expect(session!.thoughtHistory[0]).toEqual(thought);
    });
  });

  describe('addBranch', () => {
    it('should add branch to existing session', () => {
      const sessionId = 'test-session';
      const branchId = 'branch-1';
      manager.createSession(sessionId);

      const thought = {
        thought: "Branch thought",
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        branchFromThought: 1,
        branchId: branchId
      };

      manager.addBranch(sessionId, branchId, thought);

      const session = manager.getSession(sessionId);
      expect(session!.branches[branchId]).toHaveLength(1);
      expect(session!.branches[branchId][0]).toEqual(thought);
    });

    it('should create session if it does not exist', () => {
      const sessionId = 'new-session';
      const branchId = 'branch-1';
      const thought = {
        thought: "Branch thought",
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false
      };

      manager.addBranch(sessionId, branchId, thought);

      const session = manager.getSession(sessionId);
      expect(session).not.toBeNull();
      expect(session!.branches[branchId]).toHaveLength(1);
    });

    it('should add multiple thoughts to same branch', () => {
      const sessionId = 'test-session';
      const branchId = 'branch-1';
      manager.createSession(sessionId);

      const thoughts = [
        { thought: "Branch thought 1", thoughtNumber: 1, totalThoughts: 2, nextThoughtNeeded: true },
        { thought: "Branch thought 2", thoughtNumber: 2, totalThoughts: 2, nextThoughtNeeded: false }
      ];

      thoughts.forEach(thought => manager.addBranch(sessionId, branchId, thought));

      const session = manager.getSession(sessionId);
      expect(session!.branches[branchId]).toHaveLength(2);
      expect(session!.branches[branchId]).toEqual(thoughts);
    });

    it('should handle multiple branches independently', () => {
      const sessionId = 'test-session';
      manager.createSession(sessionId);

      const branch1Thought = { thought: "Branch 1", thoughtNumber: 1, totalThoughts: 1, nextThoughtNeeded: false };
      const branch2Thought = { thought: "Branch 2", thoughtNumber: 1, totalThoughts: 1, nextThoughtNeeded: false };

      manager.addBranch(sessionId, 'branch-1', branch1Thought);
      manager.addBranch(sessionId, 'branch-2', branch2Thought);

      const session = manager.getSession(sessionId);
      expect(Object.keys(session!.branches)).toHaveLength(2);
      expect(session!.branches['branch-1'][0]).toEqual(branch1Thought);
      expect(session!.branches['branch-2'][0]).toEqual(branch2Thought);
    });
  });

  describe('getThoughtHistory', () => {
    it('should return empty array for non-existent session', () => {
      const history = manager.getThoughtHistory('non-existent');
      expect(history).toEqual([]);
    });

    it('should return thought history for existing session', () => {
      const sessionId = 'test-session';
      manager.createSession(sessionId);

      const thoughts = [
        { thought: "First", thoughtNumber: 1, totalThoughts: 2, nextThoughtNeeded: true },
        { thought: "Second", thoughtNumber: 2, totalThoughts: 2, nextThoughtNeeded: false }
      ];

      thoughts.forEach(thought => manager.addThought(sessionId, thought));

      const history = manager.getThoughtHistory(sessionId);
      expect(history).toEqual(thoughts);
    });

    it('should return copy of history array', () => {
      const sessionId = 'test-session';
      manager.createSession(sessionId);

      const thought = { thought: "Test", thoughtNumber: 1, totalThoughts: 1, nextThoughtNeeded: false };
      manager.addThought(sessionId, thought);

      const history1 = manager.getThoughtHistory(sessionId);
      const history2 = manager.getThoughtHistory(sessionId);

      expect(history1).toEqual(history2);
      expect(history1).not.toBe(history2); // Different array instances
    });
  });

  describe('getBranches', () => {
    it('should return empty object for non-existent session', () => {
      const branches = manager.getBranches('non-existent');
      expect(branches).toEqual({});
    });

    it('should return branches for existing session', () => {
      const sessionId = 'test-session';
      manager.createSession(sessionId);

      const thought1 = { thought: "Branch 1", thoughtNumber: 1, totalThoughts: 1, nextThoughtNeeded: false };
      const thought2 = { thought: "Branch 2", thoughtNumber: 1, totalThoughts: 1, nextThoughtNeeded: false };

      manager.addBranch(sessionId, 'branch-1', thought1);
      manager.addBranch(sessionId, 'branch-2', thought2);

      const branches = manager.getBranches(sessionId);
      expect(Object.keys(branches)).toHaveLength(2);
      expect(branches['branch-1']).toEqual([thought1]);
      expect(branches['branch-2']).toEqual([thought2]);
    });
  });

  describe('cleanupExpiredSessions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should remove sessions older than timeout', () => {
      const sessionId = 'old-session';
      manager.createSession(sessionId);

      // Fast-forward time beyond session timeout (1 hour)
      jest.advanceTimersByTime(61 * 60 * 1000);

      manager.cleanupExpiredSessions();

      expect(manager.getSession(sessionId)).toBeNull();
      expect(manager.getSessionCount()).toBe(0);
    });

    it('should keep sessions within timeout window', () => {
      const sessionId = 'recent-session';
      manager.createSession(sessionId);

      // Fast-forward time but still within timeout (59 minutes)
      jest.advanceTimersByTime(59 * 60 * 1000);

      manager.cleanupExpiredSessions();

      expect(manager.getSession(sessionId)).not.toBeNull();
      expect(manager.getSessionCount()).toBe(1);
    });

    it('should update lastAccessedAt on getSession to prevent cleanup', () => {
      const sessionId = 'accessed-session';
      manager.createSession(sessionId);

      // Fast-forward time close to timeout
      jest.advanceTimersByTime(59 * 60 * 1000);

      // Access the session to update lastAccessedAt
      manager.getSession(sessionId);

      // Fast-forward more time
      jest.advanceTimersByTime(30 * 60 * 1000);

      manager.cleanupExpiredSessions();

      expect(manager.getSession(sessionId)).not.toBeNull();
    });

    it('should handle multiple sessions with different ages', () => {
      manager.createSession('old-session-1');
      manager.createSession('old-session-2');

      // Fast-forward past timeout
      jest.advanceTimersByTime(61 * 60 * 1000);

      manager.createSession('new-session');

      manager.cleanupExpiredSessions();

      expect(manager.getSession('old-session-1')).toBeNull();
      expect(manager.getSession('old-session-2')).toBeNull();
      expect(manager.getSession('new-session')).not.toBeNull();
      expect(manager.getSessionCount()).toBe(1);
    });
  });

  describe('destroy', () => {
    it('should clear all sessions', () => {
      manager.createSession('session-1');
      manager.createSession('session-2');

      expect(manager.getSessionCount()).toBe(2);

      manager.destroy();

      expect(manager.getSessionCount()).toBe(0);
    });

    it('should clear cleanup interval', () => {
      const intervalSpy = jest.spyOn(global, 'clearInterval');

      manager.destroy();

      expect(intervalSpy).toHaveBeenCalledWith(manager['cleanupInterval']);
    });
  });

  describe('utility methods', () => {
    describe('getSessionCount', () => {
      it('should return correct session count', () => {
        expect(manager.getSessionCount()).toBe(0);

        manager.createSession('session-1');
        expect(manager.getSessionCount()).toBe(1);

        manager.createSession('session-2');
        expect(manager.getSessionCount()).toBe(2);

        manager.clearSession('session-1');
        expect(manager.getSessionCount()).toBe(1);
      });
    });

    describe('getSessionInfo', () => {
      it('should return empty array when no sessions', () => {
        const info = manager.getSessionInfo();
        expect(info).toEqual([]);
      });

      it('should return session information', () => {
        manager.createSession('session-1');
        manager.addThought('session-1', {
          thought: "Test thought",
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false
        });
        manager.addBranch('session-1', 'branch-1', {
          thought: "Branch thought",
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false
        });

        const info = manager.getSessionInfo();

        expect(info).toHaveLength(1);
        expect(info[0]).toHaveProperty('sessionId', 'session-1');
        expect(info[0]).toHaveProperty('thoughtCount', 1);
        expect(info[0]).toHaveProperty('branchCount', 1);
        expect(info[0]).toHaveProperty('lastAccessed');
        expect(info[0].lastAccessed).toBeInstanceOf(Date);
      });

      it('should return information for multiple sessions', () => {
        manager.createSession('session-1');
        manager.createSession('session-2');

        manager.addThought('session-1', {
          thought: "Thought 1",
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false
        });

        const info = manager.getSessionInfo();

        expect(info).toHaveLength(2);
        expect(info.find(s => s.sessionId === 'session-1')!.thoughtCount).toBe(1);
        expect(info.find(s => s.sessionId === 'session-2')!.thoughtCount).toBe(0);
      });
    });
  });

  describe('singleton instance', () => {
    it('should provide a default singleton instance', () => {
      expect(sessionManager).toBeInstanceOf(InMemorySessionManager);
    });

    it('should be the same instance on multiple imports', () => {
      const anotherReference = sessionManager;
      expect(sessionManager).toBe(anotherReference);
    });
  });

  describe('automatic cleanup interval', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should run cleanup automatically every 15 minutes', () => {
      // Create a new manager with fake timers already in effect
      const testManager = new InMemorySessionManager();
      const cleanupSpy = jest.spyOn(testManager, 'cleanupExpiredSessions');

      // Fast-forward to 15 minutes
      jest.advanceTimersByTime(15 * 60 * 1000);

      expect(cleanupSpy).toHaveBeenCalledTimes(1);

      // Fast-forward another 15 minutes
      jest.advanceTimersByTime(15 * 60 * 1000);

      expect(cleanupSpy).toHaveBeenCalledTimes(2);

      // Clean up
      testManager.destroy();
    });
  });
});
