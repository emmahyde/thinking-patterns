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
        method: {
          name: "Root Cause Analysis",
          description: "AI processes extensive data to identify underlying causes",
          aiOptimized: true,
          complexity: "high",
          timeEstimate: "2-4 hours"
        },
        steps: [
          {
            stepNumber: 1,
            action: "Gather error logs and metrics",
            method: "Log Analysis",
            tools: ["ELK Stack", "Grafana"],
            duration: "30 minutes",
            outcome: "Identified pattern in error frequency"
          },
          {
            stepNumber: 2,
            action: "Analyze database connection pool configuration",
            method: "Static Analysis",
            tools: ["Database Profiler"],
            duration: "45 minutes",
            outcome: "Found pool size configuration issue"
          }
        ],
        findings: "Connection pool exhaustion occurs when concurrent users exceed 200. The default pool size of 10 connections is insufficient for peak load.",
        resolution: "Increased connection pool size to 50 and implemented connection pooling best practices. Added monitoring alerts for connection pool utilization.",
        aiAnalysis: {
          patternRecognition: {
            similarIssues: ["ISSUE-123", "ISSUE-456"],
            patterns: ["Peak hour correlation", "User count threshold"],
            anomalies: ["Sudden spike at 2PM daily"]
          },
          recommendations: [
            {
              action: "Implement connection pooling",
              confidence: 0.95,
              reasoning: "Historical data shows 95% success rate with similar issues"
            }
          ]
        }
      };

      const result = DebuggingApproachSchema.parse(validData);

      expect(result).toMatchObject({
        approachName: expect.any(String),
        issue: expect.any(String),
        method: expect.any(Object),
        steps: expect.any(Array),
        findings: expect.any(String),
        resolution: expect.any(String),
        aiAnalysis: expect.any(Object)
      });
      expect(result.steps).toHaveLength(2);
      expect(result.method?.aiOptimized).toBe(true);
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

    it('should validate AI-optimized debugging methods from GitHub PR', () => {
      const aiOptimizedMethods = [
        "Log Analysis",
        "Static Analysis", 
        "Root Cause Analysis",
        "Delta Debugging",
        "Fuzzing",
        "Incremental Testing"
      ];

      aiOptimizedMethods.forEach(methodName => {
        const data = {
          approachName: methodName,
          issue: `Testing ${methodName} method`,
          method: {
            name: methodName,
            aiOptimized: true,
            complexity: "medium"
          }
        };

        const result = DebuggingApproachSchema.parse(data);
        expect(result.method?.name).toBe(methodName);
        expect(result.method?.aiOptimized).toBe(true);
      });
    });

    it('should validate complex debugging scenarios', () => {
      const complexDebugging = {
        approachName: "Multi-Layer System Debugging",
        issue: "Microservices architecture experiencing cascading failures with inconsistent error patterns across different service boundaries",
        classification: {
          category: "reliability",
          severity: "critical",
          priority: "urgent",
          impact: "system-wide",
          frequency: "often",
          environment: ["production", "staging"]
        },
        method: {
          name: "Root Cause Analysis",
          aiOptimized: true,
          complexity: "expert",
          timeEstimate: "4-8 hours"
        },
        steps: [
          {
            stepNumber: 1,
            action: "Map service dependency graph",
            tools: ["Service Mesh Dashboard", "Jaeger"],
            duration: "1 hour",
            outcome: "Identified critical path dependencies"
          },
          {
            stepNumber: 2,
            action: "Implement distributed tracing",
            tools: ["OpenTelemetry", "Zipkin"],
            duration: "2 hours",
            outcome: "Traced request flow across services"
          }
        ],
        findings: "The cascading failures originate from a single service (user-auth) that becomes unresponsive under load due to inefficient database queries.",
        resolution: "Optimized database queries in user-auth service, adjusted circuit breaker thresholds, configured more lenient health check intervals.",
        effectiveness: {
          timeToResolution: "6 hours",
          accuracyOfInitialHypothesis: 0.8,
          methodEffectiveness: "very-effective",
          satisfactionScore: 4
        }
      };

      const result = DebuggingApproachSchema.parse(complexDebugging);

      expect(result.steps).toHaveLength(2);
      expect(result.classification?.severity).toBe("critical");
      expect(result.method?.aiOptimized).toBe(true);
      expect(result.findings).toContain("user-auth");
      expect(result.effectiveness?.methodEffectiveness).toBe("very-effective");
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

    it('should reject invalid debugging method names', () => {
      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid approach",
        issue: "Valid issue",
        method: {
          name: "Invalid Method Name",
          complexity: "medium"
        }
      })).toThrow();
    });

    it('should reject invalid step structures', () => {
      expect(() => DebuggingApproachSchema.parse({
        approachName: "Valid approach",
        issue: "Valid issue",
        steps: [
          {
            // missing stepNumber and action
            outcome: "Some outcome"
          }
        ]
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
      const findings: string | undefined = validData.findings;
      const resolution: string | undefined = validData.resolution;

      expect(approachName).toBe("Type Test Approach");
      expect(issue).toBe("Testing TypeScript type inference");
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
          {
            stepNumber: 1,
            action: "Step with emoji 🔍",
            outcome: "Found the issue"
          }
        ],
        findings: "Findings with quotes: \"error\" and 'warning' and `info`",
        resolution: "Resolution with newlines:\nLine 1\nLine 2\tTabbed"
      };

      const result = DebuggingApproachSchema.parse(unicodeData);
      expect(result.approachName).toContain("调试方法");
      expect(result.issue).toContain("αβγδε");
      const firstStep = result.steps?.[0];
      if (typeof firstStep === 'object' && firstStep !== null && 'action' in firstStep) {
        expect(firstStep.action).toContain("🔍");
      } else {
        expect(firstStep).toContain("🔍");
      }
      expect(result.findings).toContain("\"error\"");
      expect(result.resolution).toContain("\n");
    });

    it('should handle large arrays of steps', () => {
      const manySteps = Array.from({ length: 50 }, (_, i) => ({
        stepNumber: i + 1,
        action: `Debug step ${i + 1}: Detailed debugging action ${i + 1}`,
        outcome: `Outcome for step ${i + 1}`
      }));

      const data = {
        approachName: "Comprehensive Debugging",
        issue: "Complex multi-faceted issue",
        steps: manySteps
      };

      const result = DebuggingApproachSchema.parse(data);
      expect(result.steps).toHaveLength(50);
      const lastStep = result.steps?.[49];
      if (typeof lastStep === 'object' && lastStep !== null && 'action' in lastStep) {
        expect(lastStep.action).toBe("Debug step 50: Detailed debugging action 50");
      } else {
        expect(lastStep).toBe("Debug step 50: Detailed debugging action 50");
      }
    });
  });

  describe('real-world debugging scenarios', () => {
    it('should validate common debugging approaches', () => {
      const commonApproaches = [
        {
          approachName: "Rubber Duck Debugging",
          issue: "Logic error in complex algorithm",
          steps: [
            {
              stepNumber: 1,
              action: "Explain code line by line to rubber duck",
              outcome: "Identified logical inconsistency"
            },
            {
              stepNumber: 2,
              action: "Identify assumptions and edge cases",
              outcome: "Found unhandled edge case"
            }
          ]
        },
        {
          approachName: "Binary Search Debugging",
          issue: "Regression introduced in recent commits",
          steps: [
            {
              stepNumber: 1,
              action: "Identify last known good commit",
              tools: ["git log"],
              outcome: "Found baseline commit"
            },
            {
              stepNumber: 2,
              action: "Use git bisect to narrow down",
              tools: ["git bisect"],
              outcome: "Identified problematic commit"
            }
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
          {
            stepNumber: 1,
            action: "Set up memory profiling",
            tools: ["Memory Profiler"],
            outcome: "Profiling environment configured"
          },
          {
            stepNumber: 2,
            action: "Currently analyzing heap dumps...",
            outcome: "Analysis in progress"
          }
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
          {
            stepNumber: 1,
            action: "Suspected database connection issues",
            outcome: "Hypothesis formed"
          },
          {
            stepNumber: 2,
            action: "Increased connection pool size",
            outcome: "Configuration changed"
          },
          {
            stepNumber: 3,
            action: "Monitored for 24 hours",
            outcome: "No improvement observed"
          }
        ],
        findings: "Connection pool changes had no effect on timeout frequency",
        resolution: "Approach unsuccessful - need to investigate network layer and external service dependencies",
        effectiveness: {
          methodEffectiveness: "ineffective",
          satisfactionScore: 2
        }
      };

      const result = DebuggingApproachSchema.parse(failedDebugging);
      expect(result.resolution).toContain("unsuccessful");
      expect(result.findings).toContain("no effect");
      expect(result.effectiveness?.methodEffectiveness).toBe("ineffective");
    });
  });

  describe('performance testing', () => {
    it('should handle rapid successive validations', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        const data = {
          approachName: `Log Analysis`,
          issue: `Issue ${i}`,
          steps: [
            {
              stepNumber: 1,
              action: `Step 1 for issue ${i}`,
              outcome: `Outcome 1 for issue ${i}`
            }
          ],
          findings: `Findings for issue ${i}`,
          resolution: `Resolution for issue ${i}`
        };

        const result = DebuggingApproachSchema.parse(data);
        expect(result.approachName).toBe(`Log Analysis`);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
}); 