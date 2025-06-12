/**
 * Tests for StochasticAlgorithmSchema
 * Tests Zod validation, type inference, and edge cases
 */

import {
  StochasticAlgorithmSchema,
  type StochasticAlgorithmData
} from '../../src/schemas/StochasticAlgorithmSchema.js';

describe('StochasticAlgorithmSchema', () => {
  describe('valid input validation', () => {
    it('should validate minimal valid stochastic algorithm data', () => {
      const validData = {
        algorithm: "Monte Carlo Simulation",
        problem: "Portfolio risk assessment"
      };

      const result = StochasticAlgorithmSchema.parse(validData);

      expect(result).toMatchObject({
        algorithm: expect.any(String),
        problem: expect.any(String)
      });
      expect(result.algorithm).toBe("Monte Carlo Simulation");
      expect(result.problem).toBe("Portfolio risk assessment");
      expect(result.parameters).toBeUndefined();
      expect(result.result).toBeUndefined();
    });

    it('should validate algorithm with parameters', () => {
      const validData = {
        algorithm: "Genetic Algorithm",
        problem: "Optimization of neural network architecture",
        parameters: {
          populationSize: 100,
          mutationRate: 0.1,
          crossoverRate: 0.8,
          generations: 1000,
          elitism: true
        }
      };

      const result = StochasticAlgorithmSchema.parse(validData);

      expect(result.parameters).toBeDefined();
      expect(result.parameters?.populationSize).toBe(100);
      expect(result.parameters?.mutationRate).toBe(0.1);
      expect(result.parameters?.elitism).toBe(true);
    });

    it('should validate algorithm with result', () => {
      const validData = {
        algorithm: "Simulated Annealing",
        problem: "Traveling Salesman Problem",
        result: "Found optimal tour with distance 2,847 km after 50,000 iterations"
      };

      const result = StochasticAlgorithmSchema.parse(validData);

      expect(result.result).toBe("Found optimal tour with distance 2,847 km after 50,000 iterations");
    });

    it('should validate algorithm with all fields', () => {
      const validData = {
        algorithm: "Particle Swarm Optimization",
        problem: "Multi-objective function optimization",
        parameters: {
          swarmSize: 30,
          inertiaWeight: 0.9,
          cognitiveWeight: 2.0,
          socialWeight: 2.0,
          maxIterations: 1000,
          targetFitness: 0.001
        },
        result: "Converged to global optimum with fitness 0.0008 in 847 iterations"
      };

      const result = StochasticAlgorithmSchema.parse(validData);

      expect(result.algorithm).toBe("Particle Swarm Optimization");
      expect(result.problem).toContain("Multi-objective");
      expect(result.parameters?.swarmSize).toBe(30);
      expect(result.result).toContain("Converged");
    });

    it('should handle complex parameter objects', () => {
      const validData = {
        algorithm: "Markov Chain Monte Carlo",
        problem: "Bayesian parameter estimation",
        parameters: {
          burnIn: 1000,
          samples: 10000,
          chains: 4,
          priors: {
            mu: { distribution: "normal", mean: 0, variance: 1 },
            sigma: { distribution: "gamma", shape: 1, rate: 1 }
          },
          proposal: {
            type: "adaptive",
            targetAcceptance: 0.44
          }
        }
      };

      const result = StochasticAlgorithmSchema.parse(validData);

      expect(result.parameters?.burnIn).toBe(1000);
      expect(result.parameters?.priors).toBeDefined();
      expect(result.parameters?.proposal).toBeDefined();
    });

    it('should handle array parameters', () => {
      const validData = {
        algorithm: "Random Forest",
        problem: "Classification of customer behavior",
        parameters: {
          nTrees: 100,
          maxDepth: 10,
          features: ["age", "income", "purchase_history", "location"],
          splitCriteria: "gini",
          bootstrapSamples: true
        }
      };

      const result = StochasticAlgorithmSchema.parse(validData);

      expect(result.parameters?.features).toHaveLength(4);
      expect(result.parameters?.features).toContain("age");
    });
  });

  describe('invalid input rejection', () => {
    it('should reject missing required fields', () => {
      expect(() => StochasticAlgorithmSchema.parse({})).toThrow();
      
      expect(() => StochasticAlgorithmSchema.parse({
        algorithm: "Valid Algorithm"
        // missing problem
      })).toThrow();

      expect(() => StochasticAlgorithmSchema.parse({
        problem: "Valid Problem"
        // missing algorithm
      })).toThrow();
    });

    it('should reject empty strings for required fields', () => {
      expect(() => StochasticAlgorithmSchema.parse({
        algorithm: "",
        problem: "Valid problem"
      })).toThrow();

      expect(() => StochasticAlgorithmSchema.parse({
        algorithm: "Valid algorithm",
        problem: ""
      })).toThrow();

      expect(() => StochasticAlgorithmSchema.parse({
        algorithm: "",
        problem: ""
      })).toThrow();
    });

    it('should reject invalid field types', () => {
      expect(() => StochasticAlgorithmSchema.parse({
        algorithm: 123,
        problem: "Valid problem"
      })).toThrow();

      expect(() => StochasticAlgorithmSchema.parse({
        algorithm: "Valid algorithm",
        problem: 456
      })).toThrow();

      expect(() => StochasticAlgorithmSchema.parse({
        algorithm: "Valid algorithm",
        problem: "Valid problem",
        result: 789
      })).toThrow();
    });

    it('should reject null values', () => {
      expect(() => StochasticAlgorithmSchema.parse({
        algorithm: null,
        problem: "Valid problem"
      })).toThrow();

      expect(() => StochasticAlgorithmSchema.parse({
        algorithm: "Valid algorithm",
        problem: null
      })).toThrow();

      expect(() => StochasticAlgorithmSchema.parse({
        algorithm: "Valid algorithm",
        problem: "Valid problem",
        result: null
      })).toThrow();
    });

    it('should provide detailed error messages', () => {
      try {
        StochasticAlgorithmSchema.parse({
          algorithm: 123,
          problem: "",
          parameters: "not an object",
          result: null
        });
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('type inference', () => {
    it('should properly infer StochasticAlgorithmData type', () => {
      const data: StochasticAlgorithmData = {
        algorithm: "Type inference test",
        problem: "Testing TypeScript type inference",
        parameters: {
          testParam: "test value",
          numericParam: 42
        },
        result: "Type inference successful"
      };

      // Should compile without errors
      expect(data.algorithm).toBe("Type inference test");
      expect(data.problem).toBe("Testing TypeScript type inference");
      expect(data.parameters?.testParam).toBe("test value");
      expect(data.result).toBe("Type inference successful");
    });
  });

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longString = "x".repeat(10000);
      
      const validData = {
        algorithm: longString,
        problem: "Testing very long algorithm name",
        result: longString
      };

      const result = StochasticAlgorithmSchema.parse(validData);
      expect(result.algorithm).toHaveLength(10000);
      expect(result.result).toHaveLength(10000);
    });

    it('should handle complex nested parameters', () => {
      const complexParameters = {
        level1: {
          level2: {
            level3: {
              value: "deeply nested",
              array: [1, 2, 3, { nested: "object" }]
            }
          }
        },
        configurations: {
          model: {
            type: "neural_network",
            layers: [
              { type: "input", size: 784 },
              { type: "hidden", size: 128, activation: "relu" },
              { type: "output", size: 10, activation: "softmax" }
            ]
          },
          training: {
            batchSize: 32,
            epochs: 100,
            learningRate: 0.001,
            optimizer: "adam"
          }
        }
      };

      const validData = {
        algorithm: "Deep Learning with Stochastic Gradient Descent",
        problem: "Image classification with MNIST dataset",
        parameters: complexParameters
      };

      const result = StochasticAlgorithmSchema.parse(validData);
      expect(result.parameters?.level1?.level2?.level3?.value).toBe("deeply nested");
      expect(result.parameters?.configurations?.model?.type).toBe("neural_network");
    });

    it('should handle empty parameters object', () => {
      const validData = {
        algorithm: "Simple Random Walk",
        problem: "Stock price modeling",
        parameters: {}
      };

      const result = StochasticAlgorithmSchema.parse(validData);
      expect(result.parameters).toEqual({});
    });

    it('should handle various data types in parameters', () => {
      const validData = {
        algorithm: "Multi-type Parameter Test",
        problem: "Testing various parameter types",
        parameters: {
          stringParam: "test string",
          numberParam: 42,
          booleanParam: true,
          arrayParam: [1, "two", true, null],
          objectParam: { nested: "value" },
          nullParam: null,
          undefinedParam: undefined
        }
      };

      const result = StochasticAlgorithmSchema.parse(validData);
      expect(result.parameters?.stringParam).toBe("test string");
      expect(result.parameters?.numberParam).toBe(42);
      expect(result.parameters?.booleanParam).toBe(true);
      expect(result.parameters?.arrayParam).toHaveLength(4);
      expect(result.parameters?.objectParam).toEqual({ nested: "value" });
      expect(result.parameters?.nullParam).toBeNull();
    });
  });

  describe('real-world algorithm examples', () => {
    it('should validate Monte Carlo simulation', () => {
      const monteCarloData = {
        algorithm: "Monte Carlo Simulation",
        problem: "Estimating π using random sampling",
        parameters: {
          samples: 1000000,
          method: "circle_inscribed_in_square",
          randomSeed: 42
        },
        result: "Estimated π = 3.141826 (error: 0.000233)"
      };

      const result = StochasticAlgorithmSchema.parse(monteCarloData);
      expect(result.algorithm).toContain("Monte Carlo");
      expect(result.parameters?.samples).toBe(1000000);
    });

    it('should validate genetic algorithm', () => {
      const geneticAlgorithmData = {
        algorithm: "Genetic Algorithm",
        problem: "Knapsack problem optimization",
        parameters: {
          populationSize: 50,
          generations: 200,
          mutationRate: 0.05,
          crossoverRate: 0.9,
          selectionMethod: "tournament",
          tournamentSize: 3,
          elitismCount: 2
        },
        result: "Best solution found: value=152, weight=49/50, items=[1,3,4,6,7]"
      };

      const result = StochasticAlgorithmSchema.parse(geneticAlgorithmData);
      expect(result.algorithm).toBe("Genetic Algorithm");
      expect(result.parameters?.populationSize).toBe(50);
      expect(result.result).toContain("Best solution");
    });

    it('should validate reinforcement learning', () => {
      const rlData = {
        algorithm: "Q-Learning",
        problem: "CartPole balancing task",
        parameters: {
          episodes: 1000,
          alpha: 0.1,
          gamma: 0.99,
          epsilon: 0.1,
          epsilonDecay: 0.995,
          minEpsilon: 0.01,
          stateDiscretization: {
            cartPosition: 20,
            cartVelocity: 20,
            poleAngle: 20,
            poleVelocity: 20
          }
        },
        result: "Solved after 847 episodes, average reward over last 100 episodes: 195.3"
      };

      const result = StochasticAlgorithmSchema.parse(rlData);
      expect(result.algorithm).toBe("Q-Learning");
      expect(result.parameters?.episodes).toBe(1000);
      expect(result.parameters?.stateDiscretization?.cartPosition).toBe(20);
    });

    it('should validate MCMC sampling', () => {
      const mcmcData = {
        algorithm: "Metropolis-Hastings MCMC",
        problem: "Bayesian inference for linear regression",
        parameters: {
          iterations: 50000,
          burnIn: 10000,
          thinning: 5,
          proposalVariance: 0.1,
          priors: {
            beta: { type: "normal", mean: 0, variance: 100 },
            sigma: { type: "inverse_gamma", alpha: 1, beta: 1 }
          }
        },
        result: "Posterior means: β₀=2.14±0.08, β₁=0.73±0.05, σ=1.21±0.03"
      };

      const result = StochasticAlgorithmSchema.parse(mcmcData);
      expect(result.algorithm).toContain("Metropolis-Hastings");
      expect(result.parameters?.iterations).toBe(50000);
      expect(result.parameters?.priors?.beta?.type).toBe("normal");
    });
  });
}); 