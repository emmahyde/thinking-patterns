import { DecisionFrameworkServer } from './DecisionFrameworkServer.js';
import { DomainModelingServer } from './DomainModelingServer.js';
import { MetacognitiveMonitoringServer } from './MetacognitiveMonitoringServer.js';
import { StructuredArgumentationServer } from './StructuredArgumentationServer.js';
import { VisualReasoningServer } from './VisualReasoningServer.js';
import { ProblemDecompositionServer } from './ProblemDecompositionServer.js';
import { CriticalThinkingServer } from './CriticalThinkingServer.js';
import { RecursiveThinkingServer } from './RecursiveThinkingServer.js';
import { TemporalThinkingServer } from './TemporalThinkingServer.js';
import { SequentialThinkingServer } from './SequentialThinkingServer.js';
import { StochasticAlgorithmServer } from './StochasticAlgorithmServer.js';
import { MentalModelServer } from './MentalModelServer.js';
import { CollaborativeReasoningServer } from './CollaborativeReasoningServer.js';
import { DebuggingApproachServer } from './DebuggingApproachServer.js';
import { ScientificMethodServer } from './ScientificMethodServer.js';

const serverImplementations = [
  DecisionFrameworkServer,
  DomainModelingServer,
  MetacognitiveMonitoringServer,
  StructuredArgumentationServer,
  VisualReasoningServer,
  ProblemDecompositionServer,
  CriticalThinkingServer,
  RecursiveThinkingServer,
  TemporalThinkingServer,
  MentalModelServer,
  SequentialThinkingServer,
  StochasticAlgorithmServer,
  CollaborativeReasoningServer,
  DebuggingApproachServer,
  ScientificMethodServer,
];

const serverInstances = serverImplementations.map(ServerClass => new ServerClass());

export default serverInstances;