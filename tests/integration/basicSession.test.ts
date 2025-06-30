/**
 * Basic Session Management Integration Test
 * 
 * Tests core Redis session functionality with simplified scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Redis } from 'ioredis';
import { RedisStorageAdapter } from '../../src/services/RedisStorageAdapter.js';
import { SessionManager } from '../../src/services/SessionManager.js';
import { sessionAwareToolRegistry } from '../../src/services/SessionAwareToolRegistry.js';
import { SequentialThinkingServer } from '../../src/servers/SequentialThinkingServer.js';
import { ProblemDecompositionServer } from '../../src/servers/ProblemDecompositionServer.js';

describe('Basic Session Management', () => {
  let redis: Redis;
  let redisAdapter: RedisStorageAdapter;
  let sessionManager: SessionManager;
  let sequentialServer: SequentialThinkingServer;
  let problemServer: ProblemDecompositionServer;

  beforeEach(async () => {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    redisAdapter = new RedisStorageAdapter(redis);
    sessionManager = new SessionManager(redisAdapter);
    
    sequentialServer = new SequentialThinkingServer();
    problemServer = new ProblemDecompositionServer();
    
    // Clear test data
    await redis.flushdb();
  });

  afterEach(async () => {
    await redis.flushdb();
    await redis.quit();
  });

  describe('Core Session Operations', () => {
    it('should create and retrieve sessions', async () => {
      await sessionManager.createSession('test-session', 'sequential_thinking');
      
      const session = await sessionManager.getSession('test-session');
      expect(session).not.toBeNull();
      expect(session?.toolType).toBe('sequential_thinking');
      expect(session?.createdAt).toBeInstanceOf(Date);
    });

    it('should handle session TTL', async () => {
      const shortTTLManager = new SessionManager(redisAdapter, 1);
      await shortTTLManager.createSession('ttl-test', 'sequential_thinking');
      
      // Should exist immediately
      let session = await shortTTLManager.getSession('ttl-test');
      expect(session).not.toBeNull();
      
      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be expired
      session = await shortTTLManager.getSession('ttl-test');
      expect(session).toBeNull();
    });

    it('should clear sessions', async () => {
      await sessionManager.createSession('clear-test', 'sequential_thinking');
      
      let session = await sessionManager.getSession('clear-test');
      expect(session).not.toBeNull();
      
      await sessionManager.clearSession('clear-test');
      
      session = await sessionManager.getSession('clear-test');
      expect(session).toBeNull();
    });
  });

  describe('Tool Session Integration', () => {
    it('should detect session capabilities', () => {
      expect(sessionAwareToolRegistry.isSessionCapable('sequential_thinking')).toBe(true);
      expect(sessionAwareToolRegistry.isSessionCapable('problem_decomposition')).toBe(true);
      expect(sessionAwareToolRegistry.isSessionCapable('nonexistent_tool')).toBe(false);
    });

    it('should detect session IDs from inputs', () => {
      const detection = sessionAwareToolRegistry.detectSession('sequential_thinking', {
        sessionId: 'test-123',
        thought: 'test'
      });
      
      expect(detection.hasSessionId).toBe(true);
      expect(detection.sessionIdValue).toBe('test-123');
      expect(detection.isSessionCapable).toBe(true);
    });

    it('should persist sequential thinking data', async () => {
      const sessionId = 'seq-test';
      
      const result = await sequentialServer.process({
        sessionId,
        thought: 'First thought',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      });
      
      expect(result.status).toBe('success');
      expect(result.sessionId).toBe(sessionId);
      
      // Verify session was created
      const sessionData = await sessionManager.getSequentialThinkingSession(sessionId);
      expect(sessionData).not.toBeNull();
      expect(sessionData?.thoughtHistory).toHaveLength(1);
    });

    it('should persist problem decomposition data', async () => {
      const decompositionId = 'prob-test';
      
      const result = await problemServer.process({
        decompositionId,
        problem: 'Test problem',
        decomposition: [
          {
            id: 'task-1',
            description: 'Test task',
            priority: 'high' as const
          }
        ]
      });
      
      expect(result.status).toBe('success');
      expect(result.taskCount).toBe(1);
      
      // Verify session was created
      const sessionData = await sessionManager.getProblemDecompositionSession(decompositionId);
      expect(sessionData).not.toBeNull();
      expect(sessionData?.decompositionData.problem).toBe('Test problem');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed session data', async () => {
      // Manually insert bad data
      await redis.set('session:bad-data', 'invalid json');
      
      // Should return null gracefully
      const session = await sessionManager.getSession('bad-data');
      expect(session).toBeNull();
    });

    it('should handle missing sessions gracefully', async () => {
      const session = await sessionManager.getSession('nonexistent');
      expect(session).toBeNull();
    });
  });

  describe('Session Metadata', () => {
    it('should provide session metadata', async () => {
      await sessionManager.createSession('meta-test', 'sequential_thinking');
      
      const metadata = await sessionManager.getSessionMetadata('meta-test');
      expect(metadata).not.toBeNull();
      expect(metadata?.toolType).toBe('sequential_thinking');
      expect(metadata?.createdAt).toBeInstanceOf(Date);
    });

    it('should update last accessed time', async () => {
      await sessionManager.createSession('access-test', 'sequential_thinking');
      
      const first = await sessionManager.getSession('access-test');
      const firstAccess = first?.lastAccessedAt;
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const second = await sessionManager.getSession('access-test');
      const secondAccess = second?.lastAccessedAt;
      
      expect(secondAccess?.getTime()).toBeGreaterThan(firstAccess?.getTime() || 0);
    });
  });
});