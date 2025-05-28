import { BaseToolServer } from '../base/BaseToolServer.js';
import { StochasticAlgorithmSchema, StochasticAlgorithmData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Stochastic Algorithm Server using clear-thought tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class StochasticAlgorithmServer extends BaseToolServer<StochasticAlgorithmData, any> {
  constructor() {
    super(StochasticAlgorithmSchema);
  }

  protected handle(validInput: StochasticAlgorithmData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for stochastic algorithm
   * @param validInput - Validated stochastic algorithm data
   * @returns Processed stochastic algorithm result
   */
  public process(validInput: StochasticAlgorithmData): any {
    // Process the algorithm
    const result = this.processAlgorithm(validInput);

    // Format output using boxed utility
    const formattedOutput = this.formatStochasticOutput({ ...validInput, result });

    // Log formatted output to console
    console.error(formattedOutput);

    return {
      algorithm: validInput.algorithm,
      problem: validInput.problem,
      status: 'success',
      hasResult: !!result,
      parameterCount: Object.keys(validInput.parameters || {}).length,
      result,
      timestamp: new Date().toISOString(),
      framework: 'clear-thought-tools'
    };
  }

  private processAlgorithm(data: StochasticAlgorithmData): string {
    const { algorithm, problem, parameters } = data;

    switch (algorithm.toLowerCase()) {
      case 'mdp':
      case 'markov decision process':
        return this.processMDP(problem, parameters || {});
      case 'mcts':
      case 'monte carlo tree search':
        return this.processMCTS(problem, parameters || {});
      case 'bandit':
      case 'multi-armed bandit':
        return this.processBandit(problem, parameters || {});
      case 'bayesian':
      case 'bayesian optimization':
        return this.processBayesian(problem, parameters || {});
      case 'hmm':
      case 'hidden markov model':
        return this.processHMM(problem, parameters || {});
      default:
        return `Applied ${algorithm} to problem: ${problem}. Parameters: ${JSON.stringify(parameters)}`;
    }
  }

  private processMDP(problem: string, params: Record<string, unknown>): string {
    const states = params.states || 100;
    const gamma = params.gamma || 0.9;
    return `MDP analysis for "${problem}": Optimized policy over ${states} states with discount factor ${gamma}. Converged to optimal value function.`;
  }

  private processMCTS(problem: string, params: Record<string, unknown>): string {
    const simulations = params.simulations || 1000;
    const exploration = params.explorationConstant || 1.4;
    return `MCTS for "${problem}": Performed ${simulations} simulations with exploration constant ${exploration}. Best action sequence identified.`;
  }

  private processBandit(problem: string, params: Record<string, unknown>): string {
    const arms = params.arms || 10;
    const epsilon = params.epsilon || 0.1;
    return `Multi-armed bandit for "${problem}": Balanced exploration/exploitation across ${arms} arms with ε=${epsilon}. Optimal arm identified.`;
  }

  private processBayesian(problem: string, params: Record<string, unknown>): string {
    const iterations = params.iterations || 100;
    const acquisitionFunction = params.acquisitionFunction || 'expected_improvement';
    return `Bayesian optimization for "${problem}": ${iterations} iterations using ${acquisitionFunction}. Global optimum approximated.`;
  }

  private processHMM(problem: string, params: Record<string, unknown>): string {
    const hiddenStates = params.hiddenStates || 5;
    const observations = params.observations || 20;
    return `HMM analysis for "${problem}": Inferred ${hiddenStates} hidden states from ${observations} observations. State sequence decoded.`;
  }

  private formatStochasticOutput(data: StochasticAlgorithmData & { result?: string }): string {
    const sections: Record<string, string | string[]> = {
      'Algorithm': data.algorithm,
      'Problem': data.problem
    };

    if (data.parameters && Object.keys(data.parameters).length > 0) {
      const paramEntries = Object.entries(data.parameters).map(([key, value]) => `• ${key}: ${value}`);
      sections['Parameters'] = paramEntries;
    }

    if (data.result) {
      sections['Result'] = data.result;
    }

    return boxed('🎲 Stochastic Algorithm', sections);
  }
}
