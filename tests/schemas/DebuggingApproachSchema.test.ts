/**
 * Tests for DebuggingApproachSchema
 * Tests Zod validation, type inference, and edge cases
 */

import {
  DebuggingApproachSchema,
  type DebuggingApproachData
} from '../../src/schemas/DebuggingApproachSchema.js';

describe('DebuggingApproachSchema', () => {
  describe('valid input validation', () => {
    it('should validate minimal valid debugging approach data', () => {
      const validData = {
        approachName: "Binary Search Debugging",
        issue: "Application crashes intermittently"
      };

      const result = DebuggingApproachSchema.parse(validData);

      expect(result).toMatchObject({
        approachName: expect.any(String),
        issue: expect.any(String)
      });
      expect(result.approachName).toBe(validData.approachName);
      expect(result.issue).toBe(validData.issue);
      expect(result.steps).toBeUndefined();
      expect(result.findings).toBeUndefined();
      expect(result.resolution).toBeUndefined();
    });

    it('should validate debugging approach with all optional fields', () => {
      const validData = {
        approachName: "Root Cause Analysis",
        issue: "Database connection timeouts during peak hours",
        steps: [
          "Gather error logs and metrics",
          "Identify patterns in failure timing",
          "Analyze database connection pool configuration",
          "Review recent deployments and changes",
          "Test with increased connection limits",
          "Monitor system behavior under load"
        ],
        findings: "Connection pool exhaustion occurs when concurrent users exceed 200. The default pool size of 10 connections is insufficient for peak load.",
        resolution: "Increased connection pool size to 50 and implemented connection pooling best practices. Added monitoring alerts for connection pool utilization."
      };

      const result = DebuggingApproachSchema.parse(validData);

      expect(result).toMatchObject({
        approachName: expect.any(String),
        issue: expect.any(String),
        steps: expect.any(Array),
        findings: expect.any(String),
        resolution: expect.any(String)
      });
      expect(result.steps).toHaveLength(6);
      expect(result.findings).toContain("Connection pool exhaustion");
      expect(result.resolution).toContain("Increased connection pool size");
    });

    it('should handle empty optional arrays', () => {
      const validData = {
        approachName: "Empty Steps Approach",
        issue: "Testing empty steps array",
        steps: [],
        findings: "No specific findings yet",
        resolution: "Resolution pending"
      };

      const result = DebuggingApproachSchema.parse(validData);

      expect(result.steps).toEqual([]);
      expect(result.steps).toHaveLength(0);
    });

    it('should validate complex debugging scenarios', () => {
      const complexDebugging = {
        approachName: "Multi-Layer System Debugging",
        issue: "Microservices architecture experiencing cascading failures with inconsistent error patterns across different service boundaries",
        steps: [
          "Map service dependency graph",
          "Implement distributed tracing",
          "Analyze service mesh metrics",
          "Review circuit breaker configurations",
          "Examine load balancer health checks",
          "Investigate database connection patterns",
          "Check message queue processing rates",
          "Analyze container resource utilization",
          "Review service discovery mechanisms",
          "Test failure scenarios in staging"
        ],
        findings: "The cascading failures originate from a single service (user-auth) that becomes unresponsive under load due to inefficient database queries. This causes upstream services to timeout, triggering circuit breakers and creating a domino effect. The load balancer health checks were too aggressive, removing healthy instances prematurely.",
        resolution: "Optimized database queries in user-auth service, adjusted circuit breaker thresholds, configured more lenient health check intervals, and implemented graceful degradation patterns. Added comprehensive monitoring and alerting for early detection of similar issues."
      };

      const result = DebuggingApproachSchema.parse(complexDebugging);

      expect(result.steps).toHaveLength(10);
      expect(result.findings).toContain("user-auth");
      expect(result.resolution).toContain("graceful degradation");
    });
  });

  describe('invalid input rejection', () => {
    it('should reject missing required fields', () => {
      expect(() => DebuggingApproachSchema.parse({})).toThrow();
      
      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid Approach"
        // missing issue
      })).toThrow();

      expect(() => DebuggingApproachSchema.parse({
        issue: "Valid Issue"
        // missing approachName
      })).toThrow();
    });

    it('should reject empty strings for required fields', () => {
      expect(() => DebuggingApproachSchema.parse({
        approachName: "",
        issue: "Valid issue"
      })).toThrow();

      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid approach",
        issue: ""
      })).toThrow();

      expect(() => DebuggingApproachSchema.parse({
        approachName: "",
        issue: ""
      })).toThrow();
    });

    it('should reject invalid field types', () => {
      expect(() => DebuggingApproachSchema.parse({
        approachName: 123,
        issue: "Valid issue"
      })).toThrow();

      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid approach",
        issue: 456
      })).toThrow();

      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid approach",
        issue: "Valid issue",
        steps: "not an array"
      })).toThrow();

      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid approach",
        issue: "Valid issue",
        findings: 789
      })).toThrow();

      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid approach",
        issue: "Valid issue",
        resolution: true
      })).toThrow();
    });

    it('should reject null values', () => {
      expect(() => DebuggingApproachSchema.parse({
        approachName: null,
        issue: "Valid issue"
      })).toThrow();

      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid approach",
        issue: null
      })).toThrow();
    });

    it('should reject arrays with non-string elements in steps', () => {
      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid approach",
        issue: "Valid issue",
        steps: [123, "valid step", true]
      })).toThrow();

      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid approach",
        issue: "Valid issue",
        steps: ["valid step", null, "another valid step"]
      })).toThrow();
    });
  });

  describe('type inference', () => {
    it('should infer correct TypeScript types', () => {
      const validData: DebuggingApproachData = {
        approachName: "Type Test Approach",
        issue: "Testing TypeScript type inference"
      };

      // Type checking - these should compile without errors
      const approachName: string = validData.approachName;
      const issue: string = validData.issue;
      const steps: string[] | undefined = validData.steps;
      const findings: string | undefined = validData.findings;
      const resolution: string | undefined = validData.resolution;

      expect(approachName).toBe("Type Test Approach");
      expect(issue).toBe("Testing TypeScript type inference");
      expect(steps).toBeUndefined();
      expect(findings).toBeUndefined();
      expect(resolution).toBeUndefined();
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle very long strings', () => {
      const longApproachName = "x".repeat(1000);
      const longIssue = "y".repeat(2000);
      const longFindings = "z".repeat(5000);

      const data = {
        approachName: longApproachName,
        issue: longIssue,
        findings: longFindings
      };

      const result = DebuggingApproachSchema.parse(data);
      expect(result.approachName.length).toBe(1000);
      expect(result.issue.length).toBe(2000);
      expect(result.findings?.length).toBe(5000);
    });

    it('should handle Unicode and special characters', () => {
      const unicodeData = {
        approachName: "调试方法 🐛 with émojis and spëcial çharacters → ★",
        issue: "Problème avec des caractères spéciaux: αβγδε ∑∏∫ ♠♣♥♦",
        steps: [
          "Step with emoji 🔍",
          "Step with code: console.log('debug')",
          "Step with paths: /var/log/app.log"
        ],
        findings: "Findings with quotes: \"error\" and 'warning' and `info`",
        resolution: "Resolution with newlines:\nLine 1\nLine 2\tTabbed"
      };

      const result = DebuggingApproachSchema.parse(unicodeData);
      expect(result.approachName).toContain("调试方法");
      expect(result.issue).toContain("αβγδε");
      expect(result.steps?.[0]).toContain("🔍");
      expect(result.findings).toContain("\"error\"");
      expect(result.resolution).toContain("\n");
    });

    it('should handle large arrays of steps', () => {
      const manySteps = Array.from({ length: 50 }, (_, i) => `Debug step ${i + 1}: Detailed debugging action ${i + 1}`);

      const data = {
        approachName: "Comprehensive Debugging",
        issue: "Complex multi-faceted issue",
        steps: manySteps
      };

      const result = DebuggingApproachSchema.parse(data);
      expect(result.steps).toHaveLength(50);
      expect(result.steps?.[49]).toBe("Debug step 50: Detailed debugging action 50");
    });
  });

  describe('real-world debugging scenarios', () => {
    it('should validate common debugging approaches', () => {
      const commonApproaches = [
        {
          approachName: "Rubber Duck Debugging",
          issue: "Logic error in complex algorithm",
          steps: [
            "Explain code line by line to rubber duck",
            "Identify assumptions and edge cases",
            "Spot the logical flaw"
          ]
        },
        {
          approachName: "Binary Search Debugging",
          issue: "Regression introduced in recent commits",
          steps: [
            "Identify last known good commit",
            "Use git bisect to narrow down",
            "Test each commit systematically"
          ]
        },
        {
          approachName: "Logging and Monitoring",
          issue: "Intermittent production errors",
          steps: [
            "Add comprehensive logging",
            "Set up monitoring dashboards",
            "Analyze patterns over time"
          ]
        }
      ];

      commonApproaches.forEach(approach => {
        const result = DebuggingApproachSchema.parse(approach);
        expect(result.approachName).toBeTruthy();
        expect(result.issue).toBeTruthy();
        expect(result.steps?.length).toBeGreaterThan(0);
      });
    });

    it('should handle debugging in progress', () => {
      const inProgressDebugging = {
        approachName: "Active Investigation",
        issue: "Memory leak in production application",
        steps: [
          "Set up memory profiling",
          "Identify potential leak sources",
          "Currently analyzing heap dumps..."
        ],
        findings: "Initial analysis shows memory usage growing over time, investigating object retention patterns",
        // resolution intentionally omitted - still debugging
      };

      const result = DebuggingApproachSchema.parse(inProgressDebugging);
      expect(result.resolution).toBeUndefined();
      expect(result.findings).toContain("Initial analysis");
    });

    it('should handle failed debugging attempts', () => {
      const failedDebugging = {
        approachName: "Initial Hypothesis Testing",
        issue: "Sporadic API timeouts",
        steps: [
          "Suspected database connection issues",
          "Increased connection pool size",
          "Monitored for 24 hours"
        ],
        findings: "Connection pool changes had no effect on timeout frequency",
        resolution: "Approach unsuccessful - need to investigate network layer and external service dependencies"
      };

      const result = DebuggingApproachSchema.parse(failedDebugging);
      expect(result.resolution).toContain("unsuccessful");
      expect(result.findings).toContain("no effect");
    });
  });

  describe('performance testing', () => {
    it('should handle rapid successive validations', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        const data = {
          approachName: `Approach ${i}`,
          issue: `Issue ${i}`,
          steps: [`Step 1 for issue ${i}`, `Step 2 for issue ${i}`],
          findings: `Findings for issue ${i}`,
          resolution: `Resolution for issue ${i}`
        };

        const result = DebuggingApproachSchema.parse(data);
        expect(result.approachName).toBe(`Approach ${i}`);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
}); 