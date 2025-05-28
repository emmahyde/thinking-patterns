import { ScientificMethodServer } from '../../src/servers/ScientificMethodServer.js';

describe('ScientificMethodServer', () => {
  let server: ScientificMethodServer;

  beforeEach(() => {
    server = new ScientificMethodServer();
  });

  describe('processScientificMethod', () => {
    it('should process observation stage correctly', () => {
      const input = {
        stage: 'observation',
        observation: 'Plants in the greenhouse are growing faster than expected',
        inquiryId: 'test-inquiry-001',
        iteration: 1,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);

      expect(result.isError).toBeFalsy();
      expect(result.data).toBeDefined();
      expect(result.data?.stage).toBe('observation');
      expect(result.data?.observation).toBe('Plants in the greenhouse are growing faster than expected');
      expect(result.data?.inquiryId).toBe('test-inquiry-001');
      expect(result.data?.iteration).toBe(1);
      expect(result.data?.nextStageNeeded).toBe(true);
    });

    it('should process question stage correctly', () => {
      const input = {
        stage: 'question',
        question: 'What factors are contributing to the accelerated plant growth?',
        inquiryId: 'test-inquiry-002',
        iteration: 1,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);

      expect(result.isError).toBeFalsy();
      expect(result.data).toBeDefined();
      expect(result.data?.stage).toBe('question');
      expect(result.data?.question).toBe('What factors are contributing to the accelerated plant growth?');
    });

    it('should process hypothesis stage with complete data', () => {
      const input = {
        stage: 'hypothesis',
        hypothesis: {
          statement: 'Increased CO2 concentration leads to faster plant growth',
          variables: [
            {
              name: 'CO2 concentration',
              type: 'independent',
              operationalization: 'Measured in ppm using CO2 sensor'
            },
            {
              name: 'Plant growth rate',
              type: 'dependent',
              operationalization: 'Height increase per week in cm'
            }
          ],
          assumptions: [
            'All other environmental factors remain constant',
            'Plants are healthy and disease-free'
          ],
          hypothesisId: 'hyp-001',
          confidence: 0.8,
          domain: 'botany',
          iteration: 1,
          status: 'proposed'
        },
        inquiryId: 'test-inquiry-003',
        iteration: 1,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);

      expect(result.isError).toBeFalsy();
      expect(result.data).toBeDefined();
      expect(result.data?.stage).toBe('hypothesis');
      expect(result.data?.hypothesis).toBeDefined();
      expect(result.data?.hypothesis?.statement).toBe('Increased CO2 concentration leads to faster plant growth');
      expect(result.data?.hypothesis?.variables).toHaveLength(2);
      expect(result.data?.hypothesis?.assumptions).toHaveLength(2);
      expect(result.data?.hypothesis?.confidence).toBe(0.8);
      expect(result.data?.hypothesis?.status).toBe('proposed');
    });

    it('should process experiment stage with predictions and controls', () => {
      const input = {
        stage: 'experiment',
        experiment: {
          design: 'Controlled experiment with treatment and control groups',
          methodology: 'Randomized controlled trial with 20 plants per group',
          predictions: [
            {
              if: 'CO2 concentration is increased to 800ppm',
              then: 'Plant growth rate will increase by 25%',
              else: 'Growth rate remains at baseline'
            }
          ],
          experimentId: 'exp-001',
          hypothesisId: 'hyp-001',
          controlMeasures: [
            'Temperature maintained at 22°C',
            'Light exposure 12 hours daily',
            'Watering schedule consistent'
          ],
          results: 'Treatment group showed 28% increase in growth rate',
          outcomeMatched: true,
          unexpectedObservations: [
            'Leaves in treatment group were darker green'
          ],
          limitations: [
            'Small sample size',
            'Short observation period'
          ],
          nextSteps: [
            'Replicate with larger sample',
            'Extend observation period to 8 weeks'
          ]
        },
        inquiryId: 'test-inquiry-004',
        iteration: 1,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);

      expect(result.isError).toBeFalsy();
      expect(result.data).toBeDefined();
      expect(result.data?.stage).toBe('experiment');
      expect(result.data?.experiment).toBeDefined();
      expect(result.data?.experiment?.design).toBe('Controlled experiment with treatment and control groups');
      expect(result.data?.experiment?.predictions).toHaveLength(1);
      expect(result.data?.experiment?.controlMeasures).toHaveLength(3);
      expect(result.data?.experiment?.outcomeMatched).toBe(true);
      expect(result.data?.experiment?.unexpectedObservations).toHaveLength(1);
      expect(result.data?.experiment?.limitations).toHaveLength(2);
      expect(result.data?.experiment?.nextSteps).toHaveLength(2);
    });

    it('should process analysis stage correctly', () => {
      const input = {
        stage: 'analysis',
        analysis: 'Statistical analysis shows significant correlation (p < 0.05) between CO2 levels and growth rate',
        inquiryId: 'test-inquiry-005',
        iteration: 1,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);

      expect(result.isError).toBeFalsy();
      expect(result.data).toBeDefined();
      expect(result.data?.stage).toBe('analysis');
      expect(result.data?.analysis).toBe('Statistical analysis shows significant correlation (p < 0.05) between CO2 levels and growth rate');
    });

    it('should process conclusion stage correctly', () => {
      const input = {
        stage: 'conclusion',
        conclusion: 'The hypothesis is supported. Increased CO2 concentration does lead to faster plant growth.',
        inquiryId: 'test-inquiry-006',
        iteration: 1,
        nextStageNeeded: false
      };

      const result = server.processScientificMethod(input);

      expect(result.isError).toBeFalsy();
      expect(result.data).toBeDefined();
      expect(result.data?.stage).toBe('conclusion');
      expect(result.data?.conclusion).toBe('The hypothesis is supported. Increased CO2 concentration does lead to faster plant growth.');
      expect(result.data?.nextStageNeeded).toBe(false);
    });

    it('should process iteration stage correctly', () => {
      const input = {
        stage: 'iteration',
        inquiryId: 'test-inquiry-007',
        iteration: 2,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);

      expect(result.isError).toBeFalsy();
      expect(result.data).toBeDefined();
      expect(result.data?.stage).toBe('iteration');
      expect(result.data?.iteration).toBe(2);
    });

    it('should handle validation errors gracefully', () => {
      const invalidInput = {
        stage: 'invalid-stage',
        inquiryId: 'test-inquiry-008',
        iteration: 1,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(invalidInput);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation failed');
    });

    it('should handle missing required fields', () => {
      const incompleteInput = {
        stage: 'observation'
        // Missing inquiryId, iteration, nextStageNeeded
      };

      const result = server.processScientificMethod(incompleteInput);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Validation failed');
    });

    it('should handle hypothesis with alternative hypotheses', () => {
      const input = {
        stage: 'hypothesis',
        hypothesis: {
          statement: 'Light intensity is the primary factor affecting plant growth',
          variables: [
            {
              name: 'Light intensity',
              type: 'independent',
              operationalization: 'Measured in lux'
            }
          ],
          assumptions: ['Temperature remains constant'],
          hypothesisId: 'hyp-002',
          confidence: 0.7,
          domain: 'botany',
          iteration: 1,
          alternativeTo: ['hyp-001'],
          status: 'proposed'
        },
        inquiryId: 'test-inquiry-009',
        iteration: 1,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);

      expect(result.isError).toBeFalsy();
      expect(result.data?.hypothesis?.alternativeTo).toEqual(['hyp-001']);
    });

    it('should handle hypothesis refinement', () => {
      const input = {
        stage: 'hypothesis',
        hypothesis: {
          statement: 'Increased CO2 concentration between 600-1000ppm leads to optimal plant growth',
          variables: [
            {
              name: 'CO2 concentration',
              type: 'independent',
              operationalization: 'Measured in ppm, range 600-1000'
            }
          ],
          assumptions: ['Optimal temperature and light conditions'],
          hypothesisId: 'hyp-001-refined',
          confidence: 0.85,
          domain: 'botany',
          iteration: 2,
          refinementOf: 'hyp-001',
          status: 'refined'
        },
        inquiryId: 'test-inquiry-010',
        iteration: 2,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);

      expect(result.isError).toBeFalsy();
      expect(result.data?.hypothesis?.refinementOf).toBe('hyp-001');
      expect(result.data?.hypothesis?.status).toBe('refined');
    });

    it('should handle experiments with multiple predictions', () => {
      const input = {
        stage: 'experiment',
        experiment: {
          design: 'Multi-factor experiment',
          methodology: 'Factorial design testing CO2 and light combinations',
          predictions: [
            {
              if: 'High CO2 and high light',
              then: 'Maximum growth rate',
              else: 'Suboptimal growth'
            },
            {
              if: 'High CO2 and low light',
              then: 'Moderate growth rate',
              else: 'Poor growth'
            },
            {
              if: 'Low CO2 and high light',
              then: 'Limited growth rate',
              else: 'Very poor growth'
            }
          ],
          experimentId: 'exp-002',
          hypothesisId: 'hyp-001-refined',
          controlMeasures: [
            'Temperature controlled',
            'Humidity controlled',
            'Soil composition standardized'
          ]
        },
        inquiryId: 'test-inquiry-011',
        iteration: 2,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);

      expect(result.isError).toBeFalsy();
      expect(result.data?.experiment?.predictions).toHaveLength(3);
      expect(result.data?.experiment?.predictions[0].if).toBe('High CO2 and high light');
      expect(result.data?.experiment?.predictions[0].then).toBe('Maximum growth rate');
      expect(result.data?.experiment?.predictions[0].else).toBe('Suboptimal growth');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null input', () => {
      const result = server.processScientificMethod(null);
      expect(result.isError).toBe(true);
    });

    it('should handle undefined input', () => {
      const result = server.processScientificMethod(undefined);
      expect(result.isError).toBe(true);
    });

    it('should handle empty object input', () => {
      const result = server.processScientificMethod({});
      expect(result.isError).toBe(true);
    });

    it('should handle wrong data types', () => {
      const input = {
        stage: 123, // Should be string
        inquiryId: true, // Should be string
        iteration: 'not-a-number', // Should be number
        nextStageNeeded: 'yes' // Should be boolean
      };

      const result = server.processScientificMethod(input);
      expect(result.isError).toBe(true);
    });
  });

  describe('output formatting', () => {
    it('should return properly formatted JSON content', () => {
      const input = {
        stage: 'observation',
        observation: 'Test observation',
        inquiryId: 'test-inquiry-format',
        iteration: 1,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(() => JSON.parse(result.content[0].text)).not.toThrow();
    });

    it('should include all input data in the response', () => {
      const input = {
        stage: 'hypothesis',
        hypothesis: {
          statement: 'Test hypothesis',
          variables: [],
          assumptions: [],
          hypothesisId: 'test-hyp',
          confidence: 0.5,
          domain: 'test',
          iteration: 1,
          status: 'proposed'
        },
        inquiryId: 'test-inquiry-complete',
        iteration: 1,
        nextStageNeeded: true
      };

      const result = server.processScientificMethod(input);
      const parsedContent = JSON.parse(result.content[0].text);

      expect(parsedContent.stage).toBe('hypothesis');
      expect(parsedContent.inquiryId).toBe('test-inquiry-complete');
      expect(parsedContent.iteration).toBe(1);
      expect(parsedContent.nextStageNeeded).toBe(true);
      expect(parsedContent.hasHypothesis).toBe(true);
      expect(parsedContent.status).toBe('success');
      expect(parsedContent.framework).toBe('clear-thought-tools');

      // Check that the input data is available in the data field
      expect(result.data?.hypothesis?.statement).toBe('Test hypothesis');
    });
  });
});
