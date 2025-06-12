import { StochasticAlgorithmServer } from '../../src/servers/StochasticAlgorithmServer.js';

describe('StochasticAlgorithmServer', () => {
  let server: StochasticAlgorithmServer;

  beforeEach(() => {
    server = new StochasticAlgorithmServer();
  });

  describe('process', () => {
    it('should process valid stochastic algorithm data correctly', () => {
      const input = {
        algorithm: 'Monte Carlo Tree Search',
        problem: 'Optimal game strategy for chess endgame'
      };

      const result = server.process(input);

      expect(result.algorithm).toBe('Monte Carlo Tree Search');
      expect(result.problem).toBe('Optimal game strategy for chess endgame');
      expect(result.status).toBe('success');
      expect(result.hasParameters).toBe(false);
      expect(result.hasResult).toBe(true);
      expect(result.parameterCount).toBe(0);
      expect(result.timestamp).toBeDefined();
      expect(result.result).toContain('MCTS');
    });

    it('should process MDP algorithm with parameters', () => {
      const input = {
        algorithm: 'MDP',
        problem: 'Robot navigation in uncertain environment',
        parameters: {
          states: 500,
          gamma: 0.95,
          epsilon: 0.01
        }
      };

      const result = server.process(input);

      expect(result.algorithm).toBe('MDP');
      expect(result.hasParameters).toBe(true);
      expect(result.parameterCount).toBe(3);
      expect(result.parameters).toEqual({
        states: 500,
        gamma: 0.95,
        epsilon: 0.01
      });
      expect(result.result).toContain('MDP analysis');
      expect(result.result).toContain('500 states');
      expect(result.result).toContain('discount factor 0.95');
    });

    it('should process Markov Decision Process with full name', () => {
      const input = {
        algorithm: 'Markov Decision Process',
        problem: 'Inventory management optimization',
        parameters: {
          states: 1000,
          gamma: 0.9
        }
      };

      const result = server.process(input);

      expect(result.result).toContain('MDP analysis');
      expect(result.result).toContain('1000 states');
      expect(result.result).toContain('discount factor 0.9');
    });

    it('should process MCTS algorithm with custom parameters', () => {
      const input = {
        algorithm: 'MCTS',
        problem: 'Game AI strategy optimization',
        parameters: {
          simulations: 5000,
          explorationConstant: 2.0
        }
      };

      const result = server.process(input);

      expect(result.algorithm).toBe('MCTS');
      expect(result.result).toContain('MCTS');
      expect(result.result).toContain('5000 simulations');
      expect(result.result).toContain('exploration constant 2');
    });

    it('should process multi-armed bandit algorithm', () => {
      const input = {
        algorithm: 'bandit',
        problem: 'A/B testing optimization',
        parameters: {
          arms: 5,
          epsilon: 0.05
        }
      };

      const result = server.process(input);

      expect(result.result).toContain('Multi-armed bandit');
      expect(result.result).toContain('5 arms');
      expect(result.result).toContain('ε=0.05');
    });

    it('should process multi-armed bandit with full name', () => {
      const input = {
        algorithm: 'multi-armed bandit',
        problem: 'Online advertising campaign optimization',
        parameters: {
          arms: 10,
          epsilon: 0.1
        }
      };

      const result = server.process(input);

      expect(result.result).toContain('Multi-armed bandit');
      expect(result.result).toContain('10 arms');
      expect(result.result).toContain('ε=0.1');
    });

    it('should process Bayesian optimization algorithm', () => {
      const input = {
        algorithm: 'bayesian',
        problem: 'Hyperparameter tuning for neural network',
        parameters: {
          iterations: 200,
          acquisitionFunction: 'upper_confidence_bound'
        }
      };

      const result = server.process(input);

      expect(result.result).toContain('Bayesian optimization');
      expect(result.result).toContain('200 iterations');
      expect(result.result).toContain('upper_confidence_bound');
    });

    it('should process Bayesian optimization with full name', () => {
      const input = {
        algorithm: 'Bayesian Optimization',
        problem: 'Drug discovery parameter optimization',
        parameters: {
          iterations: 150,
          acquisitionFunction: 'expected_improvement'
        }
      };

      const result = server.process(input);

      expect(result.result).toContain('Bayesian optimization');
      expect(result.result).toContain('150 iterations');
      expect(result.result).toContain('expected_improvement');
    });

    it('should process Hidden Markov Model algorithm', () => {
      const input = {
        algorithm: 'hmm',
        problem: 'Speech recognition pattern analysis',
        parameters: {
          hiddenStates: 8,
          observations: 50
        }
      };

      const result = server.process(input);

      expect(result.result).toContain('HMM analysis');
      expect(result.result).toContain('8 hidden states');
      expect(result.result).toContain('50 observations');
    });

    it('should process Hidden Markov Model with full name', () => {
      const input = {
        algorithm: 'Hidden Markov Model',
        problem: 'DNA sequence analysis',
        parameters: {
          hiddenStates: 4,
          observations: 100
        }
      };

      const result = server.process(input);

      expect(result.result).toContain('HMM analysis');
      expect(result.result).toContain('4 hidden states');
      expect(result.result).toContain('100 observations');
    });

    it('should handle unknown algorithm with fallback behavior', () => {
      const input = {
        algorithm: 'Quantum Monte Carlo',
        problem: 'Molecular simulation',
        parameters: {
          samples: 10000,
          temperature: 300
        }
      };

      const result = server.process(input);

      expect(result.algorithm).toBe('Quantum Monte Carlo');
      expect(result.result).toContain('Applied Quantum Monte Carlo');
      expect(result.result).toContain('Molecular simulation');
      expect(result.result).toContain('{"samples":10000,"temperature":300}');
    });

    it('should handle algorithm without parameters', () => {
      const input = {
        algorithm: 'Genetic Algorithm',
        problem: 'Function optimization'
      };

      const result = server.process(input);

      expect(result.hasParameters).toBe(false);
      expect(result.parameterCount).toBe(0);
      expect(result.parameters).toBeUndefined();
      expect(result.result).toContain('Applied Genetic Algorithm');
    });

    it('should handle MDP with default parameters', () => {
      const input = {
        algorithm: 'MDP',
        problem: 'Simple decision making'
      };

      const result = server.process(input);

      expect(result.result).toContain('100 states');
      expect(result.result).toContain('discount factor 0.9');
    });

    it('should handle MCTS with default parameters', () => {
      const input = {
        algorithm: 'MCTS',
        problem: 'Game tree search'
      };

      const result = server.process(input);

      expect(result.result).toContain('1000 simulations');
      expect(result.result).toContain('exploration constant 1.4');
    });

    it('should handle bandit with default parameters', () => {
      const input = {
        algorithm: 'bandit',
        problem: 'Multi-option selection'
      };

      const result = server.process(input);

      expect(result.result).toContain('10 arms');
      expect(result.result).toContain('ε=0.1');
    });

    it('should handle Bayesian with default parameters', () => {
      const input = {
        algorithm: 'bayesian',
        problem: 'Parameter optimization'
      };

      const result = server.process(input);

      expect(result.result).toContain('100 iterations');
      expect(result.result).toContain('expected_improvement');
    });

    it('should handle HMM with default parameters', () => {
      const input = {
        algorithm: 'hmm',
        problem: 'Sequence modeling'
      };

      const result = server.process(input);

      expect(result.result).toContain('5 hidden states');
      expect(result.result).toContain('20 observations');
    });

    it('should handle empty parameters object', () => {
      const input = {
        algorithm: 'MDP',
        problem: 'Decision making with empty params',
        parameters: {}
      };

      const result = server.process(input);

      expect(result.hasParameters).toBe(false);
      expect(result.parameterCount).toBe(0);
      expect(result.result).toContain('100 states'); // Default values used
    });

    it('should handle complex MDP scenario', () => {
      const input = {
        algorithm: 'Markov Decision Process',
        problem: 'Autonomous vehicle navigation in urban environment',
        parameters: {
          states: 50000,
          gamma: 0.99,
          actions: 8,
          horizon: 100
        }
      };

      const result = server.process(input);

      expect(result.hasParameters).toBe(true);
      expect(result.parameterCount).toBe(4);
      expect(result.result).toContain('50000 states');
      expect(result.result).toContain('discount factor 0.99');
    });

    it('should handle complex MCTS scenario', () => {
      const input = {
        algorithm: 'Monte Carlo Tree Search',
        problem: 'Real-time strategy game AI',
        parameters: {
          simulations: 100000,
          explorationConstant: 1.41,
          maxDepth: 50,
          timeLimit: 5000
        }
      };

      const result = server.process(input);

      expect(result.parameterCount).toBe(4);
      expect(result.result).toContain('100000 simulations');
      expect(result.result).toContain('exploration constant 1.41');
    });

    it('should handle bandit with complex parameters', () => {
      const input = {
        algorithm: 'multi-armed bandit',
        problem: 'Dynamic pricing optimization',
        parameters: {
          arms: 25,
          epsilon: 0.02,
          decay: 0.999,
          initialValue: 1.0
        }
      };

      const result = server.process(input);

      expect(result.parameterCount).toBe(4);
      expect(result.result).toContain('25 arms');
      expect(result.result).toContain('ε=0.02');
    });

    it('should handle Bayesian optimization with complex parameters', () => {
      const input = {
        algorithm: 'Bayesian Optimization',
        problem: 'Deep learning architecture search',
        parameters: {
          iterations: 500,
          acquisitionFunction: 'probability_of_improvement',
          kernel: 'rbf',
          noiseLevel: 0.01
        }
      };

      const result = server.process(input);

      expect(result.parameterCount).toBe(4);
      expect(result.result).toContain('500 iterations');
      expect(result.result).toContain('probability_of_improvement');
    });

    it('should handle HMM with complex parameters', () => {
      const input = {
        algorithm: 'Hidden Markov Model',
        problem: 'Financial market regime detection',
        parameters: {
          hiddenStates: 12,
          observations: 1000,
          algorithm: 'viterbi',
          convergenceThreshold: 0.001
        }
      };

      const result = server.process(input);

      expect(result.parameterCount).toBe(4);
      expect(result.result).toContain('12 hidden states');
      expect(result.result).toContain('1000 observations');
    });

    it('should handle case-insensitive algorithm names', () => {
      const algorithms = ['MDP', 'mcts', 'BANDIT', 'Bayesian', 'HMM'];
      
      algorithms.forEach(algorithm => {
        const input = {
          algorithm: algorithm,
          problem: `Test problem for ${algorithm}`
        };

        const result = server.process(input);
        expect(result.hasResult).toBe(true);
        expect(result.status).toBe('success');
      });
    });

    it('should handle numeric parameters', () => {
      const input = {
        algorithm: 'MCTS',
        problem: 'Parameter testing',
        parameters: {
          simulations: 2500,
          explorationConstant: 1.414,
          temperature: 0.5,
          depth: 10
        }
      };

      const result = server.process(input);

      expect(result.parameters?.simulations).toBe(2500);
      expect(result.parameters?.explorationConstant).toBe(1.414);
      expect(result.parameters?.temperature).toBe(0.5);
      expect(result.parameters?.depth).toBe(10);
    });

    it('should handle string parameters', () => {
      const input = {
        algorithm: 'Bayesian Optimization',
        problem: 'Parameter type testing',
        parameters: {
          acquisitionFunction: 'expected_improvement',
          kernel: 'matern52',
          optimizer: 'lbfgs'
        }
      };

      const result = server.process(input);

      expect(result.parameters?.acquisitionFunction).toBe('expected_improvement');
      expect(result.parameters?.kernel).toBe('matern52');
      expect(result.parameters?.optimizer).toBe('lbfgs');
    });

    it('should handle mixed parameter types', () => {
      const input = {
        algorithm: 'Custom Algorithm',
        problem: 'Mixed parameter testing',
        parameters: {
          iterations: 100,
          learningRate: 0.01,
          adaptive: true,
          method: 'gradient_descent',
          layers: [64, 32, 16]
        }
      };

      const result = server.process(input);

      expect(result.parameterCount).toBe(5);
      expect(result.parameters?.iterations).toBe(100);
      expect(result.parameters?.learningRate).toBe(0.01);
      expect(result.parameters?.adaptive).toBe(true);
      expect(result.parameters?.method).toBe('gradient_descent');
      expect(result.parameters?.layers).toEqual([64, 32, 16]);
    });

    it('should handle very large parameter values', () => {
      const input = {
        algorithm: 'MDP',
        problem: 'Large scale optimization',
        parameters: {
          states: 1000000,
          actions: 1000,
          episodes: 50000
        }
      };

      const result = server.process(input);

      expect(result.result).toContain('1000000 states');
      expect(result.parameterCount).toBe(3);
    });

    it('should handle very small parameter values', () => {
      const input = {
        algorithm: 'bandit',
        problem: 'High precision optimization',
        parameters: {
          epsilon: 0.001,
          tolerance: 0.0001,
          stepSize: 0.00001
        }
      };

      const result = server.process(input);

      expect(result.result).toContain('ε=0.001');
      expect(result.parameterCount).toBe(3);
    });

    it('should preserve original problem statement', () => {
      const complexProblem = 'Multi-objective optimization of supply chain logistics with stochastic demand, capacity constraints, and environmental impact minimization';
      
      const input = {
        algorithm: 'Genetic Algorithm',
        problem: complexProblem
      };

      const result = server.process(input);

      expect(result.problem).toBe(complexProblem);
      expect(result.result).toContain(complexProblem);
    });
  });
}); 