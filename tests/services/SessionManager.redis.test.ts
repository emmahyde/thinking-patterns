import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Redis } from 'ioredis';
import { RedisStorageAdapter } from '../../src/services/RedisStorageAdapter.js';
import { SessionManager } from '../../src/services/SessionManager.js';

/**
 * SessionManager Redis Integration Unit Tests
 *
 * Tests the SessionManager with Redis storage adapter specifically,
 * focusing on multi-tool session management capabilities.
 */

describe('SessionManager with Redis', () => {
  let redis: Redis;
  let storageAdapter: RedisStorageAdapter;
  let sessionManager: SessionManager;

  beforeAll(async () => {
    redis = new Redis({
      host: 'localhost',
      port: 6379,
      db: 1,
      lazyConnect: true,
      maxRetriesPerRequest: 0,
    });
    await redis.connect();
    storageAdapter = new RedisStorageAdapter(redis);
    sessionManager = new SessionManager(storageAdapter);
  });

  afterAll(async () => {
    if (redis) {
      await redis.quit();
    }
  });

  beforeEach(async () => {
    if (redis) {
      await redis.flushdb();
    }
  });

  afterEach(() => {
    delete process.env.SESSION_TTL_SECONDS;
    delete process.env.REDIS_NAMESPACE;
  });

  describe('Multi-Tool Session Creation', () => {
    it('should create sequential thinking session', async () => {
      if (!redis) return;

      const sessionId = 'seq-unit-test';
      await sessionManager.createSession(sessionId, 'sequential_thinking');

      const session = await sessionManager.getSequentialThinkingSession(sessionId);

      expect(session).toBeTruthy();
      expect(session?.toolType).toBe('sequential_thinking');
      expect(session?.thoughtHistory).toEqual([]);
      expect(session?.branches).toEqual({});
      expect(session?.createdAt).toBeInstanceOf(Date);
      expect(session?.lastAccessedAt).toBeInstanceOf(Date);
    });

    it('should create collaborative reasoning session', async () => {
      if (!redis) return;

      const sessionId = 'collab-unit-test';
      await sessionManager.createSession(sessionId, 'collaborative_reasoning');

      const session = await sessionManager.getCollaborativeReasoningSession(sessionId);

      expect(session).toBeTruthy();
      expect(session?.toolType).toBe('collaborative_reasoning');
      expect(session?.sessionData).toEqual({});
      expect(session?.contributionHistory).toEqual([]);
      expect(session?.stageProgress).toEqual({});
      expect(session?.createdAt).toBeInstanceOf(Date);
    });

    it('should create scientific method session', async () => {
      if (!redis) return;

      const sessionId = 'sci-unit-test';
      await sessionManager.createSession(sessionId, 'scientific_method');

      const session = await sessionManager.getScientificMethodSession(sessionId);

      expect(session).toBeTruthy();
      expect(session?.toolType).toBe('scientific_method');
      expect(session?.inquiryData).toEqual({});
      expect(session?.stageHistory).toEqual([]);
      expect(session?.hypothesesHistory).toEqual([]);
      expect(session?.createdAt).toBeInstanceOf(Date);
    });

    it('should create domain modeling session', async () => {
      if (!redis) return;

      const sessionId = 'domain-unit-test';
      await sessionManager.createSession(sessionId, 'domain_modeling');

      const session = await sessionManager.getDomainModelingSession(sessionId);

      expect(session).toBeTruthy();
      expect(session?.toolType).toBe('domain_modeling');
      expect(session?.modelData).toEqual({});
      expect(session?.iterationHistory).toEqual([]);
      expect(session?.validationResults).toEqual([]);
    });

    it('should throw error for unsupported tool type', async () => {
      if (!redis) return;

      await expect(
        sessionManager.createSession('invalid-test', 'unsupported_tool')
      ).rejects.toThrow('Unsupported tool type: unsupported_tool');
    });
  });

  describe('Session Retrieval and Type Safety', () => {
    it('should return null for non-existent session', async () => {
      if (!redis) return;

      const session = await sessionManager.getSequentialThinkingSession('non-existent');
      expect(session).toBeNull();
    });

    it('should return null when requesting wrong session type', async () => {
      if (!redis) return;

      // Create a collaborative reasoning session
      await sessionManager.createSession('type-test', 'collaborative_reasoning');

      // Try to get it as sequential thinking session
      const sequentialSession = await sessionManager.getSequentialThinkingSession('type-test');
      expect(sequentialSession).toBeNull();

      // But should work as collaborative reasoning session
      const collaborativeSession = await sessionManager.getCollaborativeReasoningSession('type-test');
      expect(collaborativeSession).toBeTruthy();
    });

    it('should get generic session regardless of type', async () => {
      if (!redis) return;

      await sessionManager.createSession('generic-test', 'scientific_method');

      const session = await sessionManager.getSession('generic-test');
      expect(session).toBeTruthy();
      expect(session?.toolType).toBe('scientific_method');
    });
  });

  describe('Session Updates', () => {
    it('should update sequential thinking session', async () => {
      if (!redis) return;

      const sessionId = 'update-seq-test';
      await sessionManager.createSession(sessionId, 'sequential_thinking');

      const thought = {
        thought: 'Test thought',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        sessionId: sessionId
      };

      await sessionManager.updateSequentialThinkingSession(sessionId, {
        thoughtHistory: [thought],
        currentThought: thought
      });

      const session = await sessionManager.getSequentialThinkingSession(sessionId);
      expect(session?.thoughtHistory).toHaveLength(1);
      expect(session?.currentThought?.thought).toBe('Test thought');
    });

    it('should update collaborative reasoning session', async () => {
      if (!redis) return;

      const sessionId = 'update-collab-test';
      await sessionManager.createSession(sessionId, 'collaborative_reasoning');

      const collaborationData = {
        topic: 'Test collaboration',
        sessionId: sessionId,
        stage: 'ideation' as const,
        activePersonaId: 'test-persona',
        iteration: 1,
        nextContributionNeeded: true,
        personas: [],
        contributions: []
      };

      await sessionManager.updateCollaborativeReasoningSession(sessionId, {
        sessionData: collaborationData,
        stageProgress: { ideation: true }
      });

      const session = await sessionManager.getCollaborativeReasoningSession(sessionId);
      expect(session?.sessionData.topic).toBe('Test collaboration');
      expect(session?.stageProgress.ideation).toBe(true);
    });

    it('should update scientific method session', async () => {
      if (!redis) return;

      const sessionId = 'update-sci-test';
      await sessionManager.createSession(sessionId, 'scientific_method');

      const inquiryData = {
        stage: 'observation' as const,
        observation: 'Test observation',
        inquiryId: sessionId,
        iteration: 1,
        nextStageNeeded: true
      };

      await sessionManager.updateScientificMethodSession(sessionId, {
        inquiryData: inquiryData,
        stageHistory: [{
          stage: 'observation',
          timestamp: new Date(),
          data: { observation: 'Test observation' }
        }]
      });

      const session = await sessionManager.getScientificMethodSession(sessionId);
      expect(session?.inquiryData.observation).toBe('Test observation');
      expect(session?.stageHistory).toHaveLength(1);
    });
  });

  describe('Legacy Sequential Thinking Methods', () => {
    it('should add thoughts using legacy method', async () => {
      if (!redis) return;

      const sessionId = 'legacy-seq-test';
      const thought = {
        thought: 'Legacy test thought',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      };

      await sessionManager.addThought(sessionId, thought);

      const history = await sessionManager.getThoughtHistory(sessionId);
      expect(history).toHaveLength(1);
      expect(history[0].thought).toBe('Legacy test thought');
    });

    it('should add branches using legacy method', async () => {
      if (!redis) return;

      const sessionId = 'legacy-branch-test';
      const mainThought = {
        thought: 'Main thought',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true
      };

      const branchThought = {
        thought: 'Branch thought',
        thoughtNumber: 2,
        totalThoughts: 2,
        nextThoughtNeeded: false
      };

      await sessionManager.addThought(sessionId, mainThought);
      await sessionManager.addBranch(sessionId, 'test-branch', branchThought);

      const branches = await sessionManager.getBranches(sessionId);
      expect(branches['test-branch']).toHaveLength(1);
      expect(branches['test-branch'][0].thought).toBe('Branch thought');
    });
  });

  describe('Session Metadata and Utilities', () => {
    it('should get session metadata', async () => {
      if (!redis) return;

      const sessionId = 'metadata-test';
      await sessionManager.createSession(sessionId, 'sequential_thinking');

      const metadata = await sessionManager.getSessionMetadata(sessionId);

      expect(metadata).toBeTruthy();
      expect(metadata?.toolType).toBe('sequential_thinking');
      expect(metadata?.createdAt).toBeInstanceOf(Date);
      expect(metadata?.lastAccessedAt).toBeInstanceOf(Date);
    });

    it('should return null metadata for non-existent session', async () => {
      if (!redis) return;

      const metadata = await sessionManager.getSessionMetadata('non-existent');
      expect(metadata).toBeNull();
    });

    it('should clear sessions', async () => {
      if (!redis) return;

      const sessionId = 'clear-test';
      await sessionManager.createSession(sessionId, 'sequential_thinking');

      // Verify session exists
      let session = await sessionManager.getSession(sessionId);
      expect(session).toBeTruthy();

      // Clear session
      await sessionManager.clearSession(sessionId);

      // Verify session is gone
      session = await sessionManager.getSession(sessionId);
      expect(session).toBeNull();
    });

    it('should refresh session timestamp on access', async () => {
      if (!redis) return;

      const sessionId = 'timestamp-test';
      await sessionManager.createSession(sessionId, 'sequential_thinking');

      const session1 = await sessionManager.getSession(sessionId);
      const firstAccess = session1?.lastAccessedAt?.getTime() || 0;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      const session2 = await sessionManager.getSession(sessionId);
      const secondAccess = session2?.lastAccessedAt?.getTime() || 0;

      expect(secondAccess).toBeGreaterThan(firstAccess);
    });
  });

  describe('Session TTL Behavior', () => {
    it('should set TTL on session creation', async () => {
      const sessionId = 'ttl-test';
      process.env.SESSION_TTL_SECONDS = '600';
      const managerWithCustomTTL = new SessionManager(storageAdapter);
      await managerWithCustomTTL.createSession(sessionId);
      const ttl = await redis.ttl(`session:${sessionId}`);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(600);
    });

    it('should refresh TTL on session access', async () => {
      const sessionId = 'ttl-refresh-test';
      process.env.SESSION_TTL_SECONDS = '2';
      const managerWithCustomTTL = new SessionManager(storageAdapter);
      await managerWithCustomTTL.createSession(sessionId);

      await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for over half the TTL

      const ttl1 = await redis.ttl(`session:${sessionId}`);
      expect(ttl1).toBeLessThanOrEqual(1); // TTL should have decreased

      await managerWithCustomTTL.getSession(sessionId);
      const ttl2 = await redis.ttl(`session:${sessionId}`);
      expect(ttl2).toBeGreaterThan(ttl1); // TTL should have been refreshed
    });

    it('should expire session after TTL', async () => {
      const sessionId = 'ttl-expiry-test';
      process.env.SESSION_TTL_SECONDS = '1';
      const managerWithCustomTTL = new SessionManager(storageAdapter);
      await managerWithCustomTTL.createSession(sessionId);

      await new Promise(resolve => setTimeout(resolve, 1100));
      const session = await managerWithCustomTTL.getSession(sessionId);
      expect(session).toBeNull();
    });
  });

  describe('Data Serialization and Deserialization', () => {
    it('should handle complex nested objects', async () => {
      if (!redis) return;

      const sessionId = 'complex-data-test';
      await sessionManager.createSession(sessionId, 'collaborative_reasoning');

      const complexData = {
        sessionData: {
          topic: 'Complex test',
          sessionId: sessionId,
          stage: 'integration' as const,
          activePersonaId: 'complex-persona',
          iteration: 5,
          nextContributionNeeded: false,
          personas: [
            {
              id: 'persona-1',
              name: 'Complex Thinker',
              expertise: ['complexity', 'systems'],
              background: 'Deep background info with unicode: 🧠',
              perspective: 'Holistic view',
              biases: ['Anchoring bias', 'Availability heuristic'],
              communication: {
                style: 'systems thinking',
                tone: 'contemplative'
              }
            }
          ],
          contributions: [
            {
              personaId: 'persona-1',
              content: 'Complex contribution with nested data',
              type: 'synthesis' as const,
              confidence: 0.85,
              referenceIds: ['ref-1', 'ref-2']
            }
          ],
          consensusPoints: ['Point 1', 'Point 2'],
          disagreements: [
            {
              topic: 'Approach methodology',
              positions: [
                {
                  personaId: 'persona-1',
                  position: 'Systems approach',
                  arguments: ['Holistic', 'Comprehensive']
                }
              ]
            }
          ]
        },
        contributionHistory: [
          {
            personaId: 'persona-1',
            content: 'Historical contribution',
            timestamp: new Date(),
            iteration: 1
          }
        ],
        stageProgress: {
          'problem-definition': true,
          'ideation': true,
          'critique': true,
          'integration': true
        }
      };

      await sessionManager.updateCollaborativeReasoningSession(sessionId, complexData);

      const retrievedSession = await sessionManager.getCollaborativeReasoningSession(sessionId);

      expect(retrievedSession?.sessionData.personas[0].background).toContain('🧠');
      expect(retrievedSession?.sessionData.disagreements?.[0].positions[0].arguments).toEqual(['Holistic', 'Comprehensive']);
      expect(retrievedSession?.stageProgress['integration']).toBe(true);
      expect(retrievedSession?.contributionHistory[0].timestamp).toBeInstanceOf(Date);
    });

    it('should handle date serialization correctly', async () => {
      if (!redis) return;

      const sessionId = 'date-test';
      await sessionManager.createSession(sessionId, 'scientific_method');

      const testDate = new Date('2024-01-15T10:30:00Z');
      const stageHistory = [
        {
          stage: 'observation',
          timestamp: testDate,
          data: { note: 'Test observation' }
        }
      ];

      await sessionManager.updateScientificMethodSession(sessionId, {
        stageHistory: stageHistory
      });

      const session = await sessionManager.getScientificMethodSession(sessionId);
      expect(session?.stageHistory[0].timestamp).toBeInstanceOf(Date);
      expect(session?.stageHistory[0].timestamp.toISOString()).toBe(testDate.toISOString());
    });
  });

  describe('Session Creation and Retrieval', () => {
    it('should create a new session with a unique ID', async () => {
      const sessionId = 'seq-unit-test';
      await sessionManager.createSession(sessionId, 'sequential_thinking');
      const retrievedSession = await sessionManager.getSession(sessionId);
      expect(retrievedSession).not.toBeNull();
      expect(retrievedSession?.toolType).toBe('sequential_thinking');
    });

    it('should use a custom namespace when provided', async () => {
      process.env.REDIS_NAMESPACE = 'custom_namespace';
      const customNamespaceManager = new SessionManager(storageAdapter);
      const sessionId = 'namespace-test';
      await customNamespaceManager.createSession(sessionId);
      const exists = await redis.exists('custom_namespace:namespace-test');
      expect(exists).toBe(1);
    });
  });
});
