import { BaseToolServer } from '../base/BaseToolServer.js';
import { TemporalThinkingSchema, TemporalThinkingData, SequenceDiagramData, ActorData, SequenceStepData } from '../schemas/index.js';
import { boxed } from '../utils/index.js';

/**
 * Temporal Thinking Server using thinking-patterns tools approach
 * Extends BaseToolServer for standardized validation and error handling
 */
export class TemporalThinkingServer extends BaseToolServer<TemporalThinkingData, any> {
  constructor() {
    super(TemporalThinkingSchema);
  }

  protected handle(validInput: TemporalThinkingData): any {
    return this.process(validInput);
  }

  /**
   * Standardized process method for temporal thinking
   * @param validInput - Validated temporal thinking data
   * @returns Processed temporal thinking result
   */
  public process(validInput: TemporalThinkingData): any {
    // Generate sequence diagram if requested or not explicitly disabled
    const shouldGenerateSequence = validInput.generateSequenceDiagram !== false;
    let sequenceDiagram: SequenceDiagramData | undefined;

    if (shouldGenerateSequence) {
      sequenceDiagram = this.generateSequenceDiagram(validInput);
    }

    const result = {
      ...validInput,
      sequenceDiagram,
      status: 'success',
      stateCount: validInput.states.length,
      eventCount: validInput.events.length,
      transitionCount: validInput.transitions.length,
      timestamp: new Date().toISOString(),
    };

    const formattedOutput = this.formatOutput(result);

    // Log formatted output to console (suppress during tests)
    if (process.env.NODE_ENV !== 'test' && process.env.JEST_WORKER_ID === undefined) {
      console.error(formattedOutput);
    }

    return result;
  }

  /**
   * Generate a sequence diagram from the temporal model
   * @param data - Temporal thinking data
   * @returns Generated sequence diagram
   */
  private generateSequenceDiagram(data: TemporalThinkingData): SequenceDiagramData {
    // Extract unique actors from states and events
    const actorSet = new Set<string>();

    // Add states as potential actors
    data.states.forEach(state => {
      if (state.name !== data.initialState && !data.finalStates?.includes(state.name)) {
        actorSet.add(state.name);
      }
    });

    // Add system as default actor
    actorSet.add('System');
    if (data.domain?.toLowerCase().includes('user') || data.context.toLowerCase().includes('user')) {
      actorSet.add('User');
    }

    const actors: ActorData[] = Array.from(actorSet).map(name => ({
      name,
      type: name === 'User' ? 'user' as const : 'system' as const,
      description: `${name} actor in the ${data.domain || 'system'}`
    }));

    // Generate sequence steps from transitions
    const steps: SequenceStepData[] = [];
    let stepCounter = 1;

    // Add initial state activation
    steps.push({
      id: `step_${stepCounter++}`,
      from: 'System',
      to: data.initialState,
      message: 'Initialize',
      type: 'create'
    });

    // Convert transitions to sequence steps
    data.transitions.forEach((transition, index) => {
      const stepId = `step_${stepCounter++}`;

      steps.push({
        id: stepId,
        from: transition.from,
        to: transition.to,
        message: transition.event,
        type: transition.properties?.probability && transition.properties.probability < 1 ? 'async' : 'sync',
        condition: transition.guard,
        duration: transition.properties?.duration
      });

      // Add action as separate step if present
      if (transition.action) {
        steps.push({
          id: `step_${stepCounter++}`,
          from: transition.to,
          to: transition.to,
          message: transition.action,
          type: 'note'
        });
      }
    });

    // Generate Mermaid syntax
    const mermaidSyntax = this.generateMermaidSequence(actors, steps, data);

    return {
      title: `${data.domain || 'System'} Sequence Diagram`,
      description: `Sequence diagram showing temporal interactions for: ${data.context}`,
      actors,
      steps,
      mermaidSyntax,
      notes: [
        'Generated from temporal state machine model',
        'States are represented as actors/participants',
        'Events are represented as messages between actors'
      ]
    };
  }

  /**
   * Generate Mermaid sequence diagram syntax
   * @param actors - List of actors
   * @param steps - List of sequence steps
   * @param data - Original temporal data
   * @returns Mermaid syntax string
   */
  private generateMermaidSequence(actors: ActorData[], steps: SequenceStepData[], data: TemporalThinkingData): string {
    let mermaid = 'sequenceDiagram\n';

    // Add title
    mermaid += `    title ${data.domain || 'System'} Temporal Flow\n\n`;

    // Add participants/actors
    actors.forEach(actor => {
      const keyword = actor.type === 'user' ? 'actor' : 'participant';
      mermaid += `    ${keyword} ${actor.name}\n`;
    });

    mermaid += '\n';

    // Add sequence steps
    steps.forEach(step => {
      const arrow = step.type === 'async' ? '->>+' : '->>';
      const message = step.condition ? `${step.message} [${step.condition}]` : step.message;

      if (step.type === 'note') {
        mermaid += `    Note over ${step.from}: ${step.message}\n`;
      } else if (step.type === 'create') {
        mermaid += `    ${step.from}${arrow}${step.to}: ${message}\n`;
      } else {
        mermaid += `    ${step.from}${arrow}${step.to}: ${message}\n`;
        if (step.duration) {
          mermaid += `    Note right of ${step.to}: Duration: ${step.duration}\n`;
        }
      }
    });

    return mermaid;
  }

  private formatOutput(data: TemporalThinkingData & { sequenceDiagram?: SequenceDiagramData }): string {
    const sections: Record<string, string | string[]> = {
      'Context': data.context,
      'Initial State': data.initialState,
    };

    sections['States'] = data.states.map(s => `• ${s.name}${s.description ? `: ${s.description}` : ''}`);
    sections['Events'] = data.events.map(e => `• ${e.name}${e.description ? `: ${e.description}` : ''}`);

    const transitionLines = data.transitions.map(t => {
      let line = `• (${t.from}) --[${t.event}]--> (${t.to})`;
      const details = [];
      if (t.guard) details.push(`if: ${t.guard}`);
      if (t.action) details.push(`do: ${t.action}`);
      if (details.length > 0) {
        line += ` { ${details.join(', ')} }`;
      }
      return line;
    });
    sections['Transitions'] = transitionLines;

    if (data.finalStates && data.finalStates.length > 0) {
      sections['Final States'] = data.finalStates.join(', ');
    }

    // Add sequence diagram information
    if (data.sequenceDiagram) {
      sections['Sequence Diagram'] = [
        `📊 ${data.sequenceDiagram.title}`,
        `Actors: ${data.sequenceDiagram.actors.map(a => a.name).join(', ')}`,
        `Steps: ${data.sequenceDiagram.steps.length} interactions`,
        '',
        '🎭 Mermaid Syntax:',
        '```mermaid',
        data.sequenceDiagram.mermaidSyntax || 'No syntax generated',
        '```'
      ];
    }

    return boxed('⏳ Temporal Thinking: State Machine + Sequence Diagram', sections);
  }
}
