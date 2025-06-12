import { DebuggingApproachServer } from '../../src/servers/DebuggingApproachServer.js';

describe('DebuggingApproachServer', () => {
  let server: DebuggingApproachServer;

  beforeEach(() => {
    server = new DebuggingApproachServer();
  });

  describe('process', () => {
    it('should process valid debugging approach data correctly', () => {
      const input = {
        approachName: 'Root Cause Analysis',
        issue: 'Application crashes intermittently in production',
        steps: [
          'Collect crash logs and error messages',
          'Identify patterns in crash timing and conditions',
          'Reproduce the issue in a controlled environment',
          'Use debugging tools to trace execution path',
          'Analyze memory usage and resource constraints',
          'Implement and test potential fixes'
        ],
        findings: 'Memory leak in background service causing crashes under high load',
        resolution: 'Implemented proper resource disposal and added memory monitoring'
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.approachName).toBe('Root Cause Analysis');
      expect(result.issue).toBe('Application crashes intermittently in production');
      expect(result.steps).toHaveLength(6);
      expect(result.findings).toBe('Memory leak in background service causing crashes under high load');
      expect(result.resolution).toBe('Implemented proper resource disposal and added memory monitoring');
      expect(result.hasSteps).toBe(true);
      expect(result.hasFindings).toBe(true);
      expect(result.hasResolution).toBe(true);
      expect(result.stepCount).toBe(6);
      expect(result.timestamp).toBeDefined();
    });

    it('should handle minimal required data', () => {
      const input = {
        approachName: 'Binary Search Debugging',
        issue: 'Feature not working as expected'
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.approachName).toBe('Binary Search Debugging');
      expect(result.issue).toBe('Feature not working as expected');
      expect(result.hasSteps).toBe(false);
      expect(result.hasFindings).toBe(false);
      expect(result.hasResolution).toBe(false);
      expect(result.stepCount).toBe(0);
    });

    it('should handle systematic debugging approach', () => {
      const input = {
        approachName: 'Systematic Debugging',
        issue: 'API endpoints returning incorrect data',
        steps: [
          'Review recent code changes',
          'Check database queries',
          'Validate input parameters',
          'Test API endpoints individually',
          'Verify data transformation logic',
          'Check caching mechanisms'
        ],
        findings: 'Caching layer was returning stale data due to incorrect cache invalidation',
        resolution: 'Fixed cache invalidation logic and added cache versioning'
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.approachName).toBe('Systematic Debugging');
      expect(result.stepCount).toBe(6);
      expect(result.hasFindings).toBe(true);
      expect(result.hasResolution).toBe(true);
    });

    it('should handle debugging with steps only', () => {
      const input = {
        approachName: 'Divide and Conquer',
        issue: 'Performance degradation in search functionality',
        steps: [
          'Profile application performance',
          'Identify bottlenecks',
          'Optimize database queries',
          'Implement caching strategy'
        ]
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.hasSteps).toBe(true);
      expect(result.hasFindings).toBe(false);
      expect(result.hasResolution).toBe(false);
      expect(result.stepCount).toBe(4);
    });

    it('should handle debugging with findings only', () => {
      const input = {
        approachName: 'Code Review Debugging',
        issue: 'Security vulnerability reported',
        findings: 'SQL injection vulnerability in user input validation'
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.hasSteps).toBe(false);
      expect(result.hasFindings).toBe(true);
      expect(result.hasResolution).toBe(false);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null input', () => {
      const response = server.run(null);
      expect(response.isError).toBe(true);
    });

    it('should handle undefined input', () => {
      const response = server.run(undefined);
      expect(response.isError).toBe(true);
    });

    it('should handle empty object input', () => {
      const response = server.run({});
      expect(response.isError).toBe(true);
    });

    it('should handle missing required fields', () => {
      const incompleteInput = {
        approachName: 'Test Approach'
        // Missing issue field
      };

      const response = server.run(incompleteInput);
      expect(response.isError).toBe(true);
    });

    it('should handle invalid data types', () => {
      const invalidInput = {
        approachName: 123, // Should be string
        issue: true, // Should be string
        steps: 'not-an-array', // Should be array
        findings: [], // Should be string
        resolution: {} // Should be string
      };

      const response = server.run(invalidInput);
      expect(response.isError).toBe(true);
    });
  });

  describe('output formatting', () => {
    it('should return properly formatted JSON content', () => {
      const input = {
        approachName: 'Test Debugging',
        issue: 'Test issue',
        steps: ['Step 1', 'Step 2'],
        findings: 'Test findings',
        resolution: 'Test resolution'
      };

      const response = server.run(input);

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(() => JSON.parse(response.content[0].text)).not.toThrow();

      const parsedContent = JSON.parse(response.content[0].text);
      expect(parsedContent.status).toBe('success');
      expect(parsedContent.approachName).toBe('Test Debugging');
      expect(parsedContent.issue).toBe('Test issue');
      expect(parsedContent.stepCount).toBe(2);
      expect(parsedContent.hasSteps).toBe(true);
      expect(parsedContent.hasFindings).toBe(true);
      expect(parsedContent.hasResolution).toBe(true);
      expect(parsedContent.timestamp).toBeDefined();
    });
  });

  describe('real-world debugging scenarios', () => {
    it('should handle network debugging approach', () => {
      const input = {
        approachName: 'Network Debugging',
        issue: 'Intermittent connection timeouts',
        steps: [
          'Monitor network traffic',
          'Check DNS resolution',
          'Test connectivity at different network layers',
          'Analyze packet loss patterns',
          'Review firewall and proxy settings'
        ],
        findings: 'DNS server overloaded during peak hours causing resolution delays',
        resolution: 'Implemented DNS caching and added secondary DNS servers'
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.approachName).toBe('Network Debugging');
      expect(result.stepCount).toBe(5);
    });

    it('should handle concurrent debugging approach', () => {
      const input = {
        approachName: 'Concurrency Debugging',
        issue: 'Race conditions causing data corruption',
        steps: [
          'Identify shared resources',
          'Analyze thread safety mechanisms',
          'Use synchronization primitives',
          'Implement atomic operations',
          'Add proper locking mechanisms'
        ],
        findings: 'Multiple threads accessing shared cache without proper synchronization',
        resolution: 'Added thread-safe cache implementation with proper locking'
      };

      const result = server.process(input);

      expect(result.status).toBe('success');
      expect(result.approachName).toBe('Concurrency Debugging');
    });
  });
}); 