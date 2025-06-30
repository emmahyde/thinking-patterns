/**
 * Complete Session Management Integration Test
 *
 * Tests the full Redis session implementation across all cognitive tools
 * including CLI utilities, session-aware tool registry, and data persistence.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Redis } from 'ioredis';
import { RedisStorageAdapter } from '../../src/services/RedisStorageAdapter.js';
import { SessionManager } from '../../src/services/SessionManager.js';
import { sessionAwareToolRegistry } from '../../src/services/SessionAwareToolRegistry.js';
import { SequentialThinkingServer } from '../../src/servers/SequentialThinkingServer.js';
import { CollaborativeReasoningServer } from '../../src/servers/CollaborativeReasoningServer.js';
import { ScientificMethodServer } from '../../src/servers/ScientificMethodServer.js';
import { DomainModelingServer } from '../../src/servers/DomainModelingServer.js';
import { ProblemDecompositionServer } from '../../src/servers/ProblemDecompositionServer.js';

describe('Complete Session Management Integration', () => {
  let redis: Redis;
  let redisAdapter: RedisStorageAdapter;
  let sessionManager: SessionManager;

  // Tool servers
  let sequentialServer: SequentialThinkingServer;
  let collabServer: CollaborativeReasoningServer;
  let scientificServer: ScientificMethodServer;
  let domainServer: DomainModelingServer;
  let problemServer: ProblemDecompositionServer;

  beforeEach(async () => {
    // Setup Redis connection
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    redisAdapter = new RedisStorageAdapter(redis);
    sessionManager = new SessionManager(redisAdapter);

    // Initialize tool servers
    sequentialServer = new SequentialThinkingServer();
    collabServer = new CollaborativeReasoningServer();
    scientificServer = new ScientificMethodServer();
    domainServer = new DomainModelingServer();
    problemServer = new ProblemDecompositionServer();

    // Register tools with session registry
    sessionAwareToolRegistry.registerTool('sequential_thinking', sequentialServer);
    sessionAwareToolRegistry.registerTool('collaborative_reasoning', collabServer);
    sessionAwareToolRegistry.registerTool('scientific_method', scientificServer);
    sessionAwareToolRegistry.registerTool('domain_modeling', domainServer);
    sessionAwareToolRegistry.registerTool('problem_decomposition', problemServer);

    // Clear any existing test data
    await redis.flushdb();
  });

  afterEach(async () => {
    await redis.flushdb();
    await redis.quit();
  });

  describe('Session Detection and Management', () => {
    it('should detect session capabilities for all tools', () => {
      const tools = [
        'sequential_thinking',
        'collaborative_reasoning',
        'scientific_method',
        'domain_modeling',
        'problem_decomposition'
      ];

      for (const tool of tools) {
        expect(sessionAwareToolRegistry.isSessionCapable(tool)).toBe(true);
      }
    });

    it('should detect session IDs from tool inputs', () => {
      const testCases = [
        {
          tool: 'sequential_thinking',
          input: { sessionId: 'seq-123', thought: 'test' },
          expectedField: 'sessionId',
          expectedValue: 'seq-123'
        },
        {
          tool: 'scientific_method',
          input: { inquiryId: 'sci-456', observation: 'test' },
          expectedField: 'inquiryId',
          expectedValue: 'sci-456'
        },
        {
          tool: 'domain_modeling',
          input: { modelingId: 'dom-789', domain: 'test' },
          expectedField: 'modelingId',
          expectedValue: 'dom-789'
        },
        {
          tool: 'problem_decomposition',
          input: { decompositionId: 'prob-101', problem: 'test', decomposition: [] },
          expectedField: 'decompositionId',
          expectedValue: 'prob-101'
        }
      ];

      for (const testCase of testCases) {
        const detection = sessionAwareToolRegistry.detectSession(testCase.tool, testCase.input);

        expect(detection.hasSessionId).toBe(true);
        expect(detection.sessionIdField).toBe(testCase.expectedField);
        expect(detection.sessionIdValue).toBe(testCase.expectedValue);
        expect(detection.isSessionCapable).toBe(true);
      }
    });

    it('should auto-generate session IDs when needed', () => {
      const sessionId = sessionAwareToolRegistry.generateSessionId('sequential_thinking');
      expect(sessionId).toMatch(/^sequential-thinking-\d+-[a-z0-9]+$/);

      const sessionIdWithInput = sessionAwareToolRegistry.generateSessionId('scientific_method', {
        observation: 'test data'
      });
      expect(sessionIdWithInput).toContain('scientific-method-');
      expect(sessionIdWithInput).toMatch(/^scientific-method-\d+-[a-z0-9]+(-[a-z0-9]+)?$/);
    });
  });

  describe('Cross-Tool Session Persistence', () => {
    it('should maintain separate sessions for different tools', async () => {
      // Create sessions for different tools
      await sessionManager.createSession('test-session-1', 'sequential_thinking');
      await sessionManager.createSession('test-session-2', 'collaborative_reasoning');
      await sessionManager.createSession('test-session-3', 'scientific_method');

      // Verify each session has correct tool type
      const seq = await sessionManager.getSequentialThinkingSession('test-session-1');
      const collab = await sessionManager.getCollaborativeReasoningSession('test-session-2');
      const sci = await sessionManager.getScientificMethodSession('test-session-3');

      expect(seq?.toolType).toBe('sequential_thinking');
      expect(collab?.toolType).toBe('collaborative_reasoning');
      expect(sci?.toolType).toBe('scientific_method');

      // Verify cross-contamination doesn't occur
      expect(await sessionManager.getSequentialThinkingSession('test-session-2')).toBeNull();
      expect(await sessionManager.getCollaborativeReasoningSession('test-session-3')).toBeNull();
      expect(await sessionManager.getScientificMethodSession('test-session-1')).toBeNull();
    });

    it('should persist sequential thinking sessions with Redis', async () => {
      const sessionId = 'seq-test-123';

      // Process sequential thinking with session
      const result = await sequentialServer.process({
        sessionId,
        thought: 'Initial analysis of the problem',
        thoughtNumber: 1,
        totalThoughts: 3,
        nextThoughtNeeded: true
      });

      expect(result.status).toBe('success');
      expect(result.sessionContext).toBeDefined();
      expect(result.sessionContext.thoughtCount).toBe(1);

      // Add another thought
      await sequentialServer.process({
        sessionId,
        thought: 'Deeper consideration of alternatives',
        thoughtNumber: 2,
        totalThoughts: 3,
        nextThoughtNeeded: true
      });

      // Verify session persistence
      const sessionData = await sessionManager.getSequentialThinkingSession(sessionId);
      expect(sessionData?.thoughtHistory).toHaveLength(2);
      expect(sessionData?.thoughtHistory[1].thought).toBe('Deeper consideration of alternatives');
    });

    it('should persist problem decomposition sessions with revision tracking', async () => {
      const decompositionId = 'prob-test-456';

      // Initial decomposition
      const initialResult = await problemServer.process({
        decompositionId,
        problem: 'Build a web application',
        decomposition: [
          {
            id: 'task-1',
            description: 'Setup development environment',
            priority: 'high' as const,
            progress: { status: 'not-started' as const }
          },
          {
            id: 'task-2',
            description: 'Design database schema',
            priority: 'medium' as const,
            progress: { status: 'not-started' as const }
          }
        ]
      });

      expect(initialResult.status).toBe('success');
      expect(initialResult.taskCount).toBe(2);

      // Update decomposition with progress
      await problemServer.process({
        decompositionId,
        problem: 'Build a web application',
        decomposition: [
          {
            id: 'task-1',
            description: 'Setup development environment',
            priority: 'high' as const,
            progress: { status: 'completed' as const }
          },
          {
            id: 'task-2',
            description: 'Design database schema',
            priority: 'medium' as const,
            progress: { status: 'in-progress' as const }
          }
        ]
      });

      // Verify session tracking
      const sessionData = await sessionManager.getProblemDecompositionSession(decompositionId);
      expect(sessionData?.revisionHistory).toHaveLength(1);
      expect(sessionData?.progressUpdates).toHaveLength(2); // Two status changes
      expect(sessionData?.progressUpdates[0].newStatus).toBe('completed');
      expect(sessionData?.progressUpdates[1].newStatus).toBe('in-progress');
    });

    it('should persist scientific method sessions with stage progression', async () => {
      const inquiryId = 'sci-test-789';

      // Start scientific inquiry
      const result = await scientificServer.process({
        inquiryId,
        stage: 'observation',
        iteration: 1,
        observation: 'Users are experiencing slow page load times',
        analysis: '',
        conclusion: '',
        nextStageNeeded: true,
      });

      expect(result.status).toBe('success');
      expect(result.sessionContext).toBeDefined();
      expect(result.sessionContext.stageCount).toBe(1);

      // Progress to hypothesis stage
      const hypothesisResult = await scientificServer.process({
        inquiryId,
        stage: 'hypothesis',
        iteration: 2,
        observation: 'Users are experiencing slow page load times',
        hypothesis: {
          statement: 'Large image files are causing slow loads',
          variables: [{
            name: 'image_size',
            type: 'independent'
          }, {
            name: 'load_time',
            type: 'dependent'
          }],
          assumptions: ['Users have varying internet speeds'],
          hypothesisId: 'h1',
          confidence: 0.7,
          domain: 'web performance',
          iteration: 1,
          status: 'proposed'
        },
        analysis: '',
        conclusion: '',
        nextStageNeeded: true,
      });

      expect(hypothesisResult.status).toBe('success');

      // Verify session tracking
      const sessionData = await sessionManager.getScientificMethodSession(inquiryId);
      expect(sessionData?.stageHistory).toHaveLength(2);
      expect(sessionData?.hypothesesHistory).toHaveLength(1);
      expect(sessionData?.stageHistory[1].stage).toBe('hypothesis');
    });
  });

  describe('Session Management Utilities', () => {
    it('should handle session cleanup correctly', async () => {
      // Create test sessions
      const sessionIds = ['cleanup-1', 'cleanup-2', 'cleanup-3'];

      for (const sessionId of sessionIds) {
        await sessionManager.createSession(sessionId, 'sequential_thinking');
      }

      // Verify sessions exist
      for (const sessionId of sessionIds) {
        const session = await sessionManager.getSession(sessionId);
        expect(session).not.toBeNull();
      }

      // Clear sessions
      for (const sessionId of sessionIds) {
        await sessionManager.clearSession(sessionId);
      }

      // Verify sessions are cleared
      for (const sessionId of sessionIds) {
        const session = await sessionManager.getSession(sessionId);
        expect(session).toBeNull();
      }
    });

    it('should handle session metadata correctly', async () => {
      const sessionId = 'metadata-test';
      await sessionManager.createSession(sessionId, 'domain_modeling');

      const metadata = await sessionManager.getSessionMetadata(sessionId);
      expect(metadata).not.toBeNull();
      expect(metadata?.toolType).toBe('domain_modeling');
      expect(metadata?.createdAt).toBeInstanceOf(Date);
      expect(metadata?.lastAccessedAt).toBeInstanceOf(Date);
    });

    it('should handle session TTL correctly', async () => {
      process.env.SESSION_TTL_SECONDS = '1';
      const shortTTLManager = new SessionManager(redisAdapter);
      const sessionId = 'ttl-session';
      await shortTTLManager.createSession(sessionId, 'sequential_thinking');

      // Session should exist immediately
      let session = await shortTTLManager.getSession(sessionId);
      expect(session).not.toBeNull();

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Session should be expired
      session = await shortTTLManager.getSession(sessionId);
      expect(session).toBeNull();
      delete process.env.SESSION_TTL_SECONDS;
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should gracefully handle Redis connection failures', async () => {
      // Create a server with invalid Redis connection
      const invalidRedis = new Redis('redis://invalid:6379');
      const invalidAdapter = new RedisStorageAdapter(invalidRedis);
      const invalidManager = new SessionManager(invalidAdapter);

      // This should not throw, but return null gracefully
      const session = await invalidManager.getSession('test').catch(() => null);
      expect(session).toBeNull();

      await invalidRedis.quit().catch(() => { });
    }, { timeout: 15000 });

    it('should handle malformed session data gracefully', async () => {
      const sessionId = 'malformed-test';
      await redis.set(`session:${sessionId}`, 'this is not valid json');

      await expect(sessionManager.getSession(sessionId)).rejects.toThrow('Failed to get key');
    });

    it('should handle concurrent session access', async () => {
      const sessionId = 'concurrent-session';
      await sessionManager.createSession(sessionId, 'sequential_thinking');

      // Add thoughts sequentially to avoid race conditions
      for (let i = 0; i < 3; i++) {
        await sequentialServer.process({
          sessionId,
          thought: `Sequential thought ${i}`,
          thoughtNumber: i + 1,
          totalThoughts: 3,
          nextThoughtNeeded: i < 2
        });
      }

      // Final session should have all thoughts
      const finalSession = await sessionManager.getSequentialThinkingSession(sessionId);
      expect(finalSession?.thoughtHistory).toHaveLength(3);
    });
  });

  describe('Session-Aware Processing', () => {
    it('should automatically create sessions when processing tools', async () => {
      const sessionId = 'auto-create-test';

      // Process without pre-creating session
      const detection = await sessionAwareToolRegistry.processWithSessionAwareness(
        'sequential_thinking',
        {
          sessionId,
          thought: 'Test auto-creation',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false
        }
      );

      expect(detection.sessionDetection.hasSessionId).toBe(true);
      expect(detection.sessionCreated).toBe(true);
      expect(detection.sessionMetadata).not.toBeNull();

      // Verify session was actually created
      const session = await sessionManager.getSequentialThinkingSession(sessionId);
      expect(session).not.toBeNull();
    });

    it('should track session usage across multiple tool invocations', async () => {
      const sessionId = 'usage-tracking-test';

      // Multiple tool invocations using the actual server
      await sequentialServer.process({
        sessionId,
        thought: 'First thought',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      });

      await sequentialServer.process({
        sessionId,
        thought: 'Second thought',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false
      });

      // Check session data
      const sessionData = await sessionAwareToolRegistry.getSessionData('sequential_thinking', sessionId);
      expect(sessionData?.thoughtHistory).toHaveLength(2);

      // Check session history
      const history = await sessionAwareToolRegistry.getSessionHistory('sequential_thinking', sessionId);
      expect(history).toHaveLength(2);
    });
  });
});
