import { SessionManager } from '../../src/services/SessionManager.js';
import { RedisStorageAdapter } from '../../src/services/RedisStorageAdapter.js';
import MockRedis from 'ioredis-mock';

describe('SessionManager with Redis', () => {
  let sessionManager: SessionManager;
  let redis: MockRedis;

  beforeEach(() => {
    redis = new MockRedis();
    const storageAdapter = new RedisStorageAdapter(redis);
    sessionManager = new SessionManager(storageAdapter);
  });

  afterEach(async () => {
    await redis.flushall();
  });

  it('should create a new session', async () => {
    const sessionId = 'test-session';
    await sessionManager.createSession(sessionId);
    const session = await sessionManager.getSession(sessionId);
    expect(session).not.toBeNull();
    expect(session?.thoughtHistory).toEqual([]);
  });

  it('should get an existing session', async () => {
    const sessionId = 'test-session';
    await sessionManager.createSession(sessionId);
    const session = await sessionManager.getSession(sessionId);
    expect(session).not.toBeNull();
  });

  it('should return null for a non-existent session', async () => {
    const session = await sessionManager.getSession('non-existent-session');
    expect(session).toBeNull();
  });

  it('should clear a session', async () => {
    const sessionId = 'test-session';
    await sessionManager.createSession(sessionId);
    await sessionManager.clearSession(sessionId);
    const session = await sessionManager.getSession(sessionId);
    expect(session).toBeNull();
  });

  it('should add a thought to a session', async () => {
    const sessionId = 'test-session';
    const thought = { thought: 'test thought', thoughtNumber: 1, totalThoughts: 1, nextThoughtNeeded: false };
    await sessionManager.addThought(sessionId, thought as any);
    const thoughtHistory = await sessionManager.getThoughtHistory(sessionId);
    expect(thoughtHistory).toHaveLength(1);
    expect(thoughtHistory[0].thought).toBe('test thought');
  });

  it('should add a branch to a session', async () => {
    const sessionId = 'test-session';
    const branchId = 'test-branch';
    const thought = { thought: 'test branch thought', thoughtNumber: 1, totalThoughts: 1, nextThoughtNeeded: false };
    await sessionManager.addBranch(sessionId, branchId, thought as any);
    const branches = await sessionManager.getBranches(sessionId);
    expect(branches[branchId]).toBeDefined();
    expect(branches[branchId][0].thought).toBe('test branch thought');
  });
});
