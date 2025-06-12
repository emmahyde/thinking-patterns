import { DecisionFrameworkServer } from './DecisionFrameworkServer.js';
import { DomainModelingServer } from './DomainModelingServer.js';
import { MetacognitiveMonitoringServer } from './MetacognitiveMonitoringServer.js';
import { StructuredArgumentationServer } from './StructuredArgumentationServer.js';
import { VisualReasoningServer } from './VisualReasoningServer.js';
import { ProblemDecompositionServer } from './ProblemDecompositionServer.js';
import { CriticalThinkingServer } from './CriticalThinkingServer.js';
import { RecursiveThinkingServer } from './RecursiveThinkingServer.js';
import { TemporalThinkingServer } from './TemporalThinkingServer.js';

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
];

const serverInstances = serverImplementations.map(ServerClass => {
  // ... existing code ...
}); 