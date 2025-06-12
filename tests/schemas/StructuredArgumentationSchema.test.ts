/**
 * Tests for StructuredArgumentationSchema
 * Tests Zod validation, type inference, and edge cases
 */

import {
  StructuredArgumentationSchema,
  type StructuredArgumentationData
} from '../../src/schemas/StructuredArgumentationSchema.js';

describe('StructuredArgumentationSchema', () => {
  describe('valid input validation', () => {
    it('should validate minimal valid argumentation data', () => {
      const validData = {
        claim: "Remote work increases productivity",
        premises: ["Employees have fewer distractions", "Commute time is eliminated"],
        conclusion: "Companies should adopt remote work policies",
        argumentType: "thesis",
        confidence: 0.8,
        nextArgumentNeeded: true
      };

      const result = StructuredArgumentationSchema.parse(validData);

      expect(result).toMatchObject({
        claim: expect.any(String),
        premises: expect.any(Array),
        conclusion: expect.any(String),
        argumentType: expect.any(String),
        confidence: expect.any(Number),
        nextArgumentNeeded: expect.any(Boolean)
      });
      expect(result.claim).toBe("Remote work increases productivity");
      expect(result.premises).toHaveLength(2);
      expect(result.argumentType).toBe("thesis");
      expect(result.confidence).toBe(0.8);
    });

    it('should validate all argument types', () => {
      const argumentTypes = ["thesis", "antithesis", "synthesis", "objection", "rebuttal"];
      
      argumentTypes.forEach(type => {
        const validData = {
          claim: `This is a ${type} argument`,
          premises: [`Premise supporting ${type}`],
          conclusion: `Conclusion for ${type}`,
          argumentType: type as any,
          confidence: 0.7,
          nextArgumentNeeded: false
        };

        const result = StructuredArgumentationSchema.parse(validData);
        expect(result.argumentType).toBe(type);
      });
    });

    it('should validate argumentation with all optional fields', () => {
      const validData = {
        claim: "Artificial intelligence will transform healthcare",
        premises: [
          "AI can analyze medical data faster than humans",
          "Machine learning improves diagnostic accuracy",
          "AI can identify patterns in large datasets"
        ],
        conclusion: "Healthcare systems should invest in AI technology",
        argumentId: "arg-healthcare-ai-001",
        argumentType: "thesis",
        confidence: 0.85,
        respondsTo: "arg-healthcare-human-002",
        supports: ["arg-tech-advancement-003", "arg-efficiency-004"],
        contradicts: ["arg-human-touch-005"],
        strengths: [
          "Supported by multiple peer-reviewed studies",
          "Clear logical progression from premises to conclusion",
          "Addresses practical implementation concerns"
        ],
        weaknesses: [
          "May underestimate implementation challenges",
          "Limited consideration of ethical implications"
        ],
        nextArgumentNeeded: true,
        suggestedNextTypes: ["antithesis", "objection"]
      };

      const result = StructuredArgumentationSchema.parse(validData);

      expect(result.argumentId).toBe("arg-healthcare-ai-001");
      expect(result.respondsTo).toBe("arg-healthcare-human-002");
      expect(result.supports).toHaveLength(2);
      expect(result.contradicts).toHaveLength(1);
      expect(result.strengths).toHaveLength(3);
      expect(result.weaknesses).toHaveLength(2);
      expect(result.suggestedNextTypes).toEqual(["antithesis", "objection"]);
    });

    it('should validate thesis argument', () => {
      const thesisData = {
        claim: "Open source software is more secure than proprietary software",
        premises: [
          "More eyes reviewing code leads to fewer bugs",
          "Security vulnerabilities are discovered and fixed faster",
          "No hidden backdoors or malicious code"
        ],
        conclusion: "Organizations should prioritize open source solutions",
        argumentType: "thesis",
        confidence: 0.75,
        nextArgumentNeeded: true
      };

      const result = StructuredArgumentationSchema.parse(thesisData);
      expect(result.argumentType).toBe("thesis");
      expect(result.premises).toHaveLength(3);
    });

    it('should validate antithesis argument', () => {
      const antithesisData = {
        claim: "Proprietary software provides better security than open source",
        premises: [
          "Professional security teams dedicated to the product",
          "Attackers cannot easily study the source code",
          "Vendor provides guaranteed security updates"
        ],
        conclusion: "Critical systems should use proprietary solutions",
        argumentType: "antithesis",
        confidence: 0.7,
        respondsTo: "thesis-open-source-security",
        nextArgumentNeeded: true
      };

      const result = StructuredArgumentationSchema.parse(antithesisData);
      expect(result.argumentType).toBe("antithesis");
      expect(result.respondsTo).toBe("thesis-open-source-security");
    });

    it('should validate synthesis argument', () => {
      const synthesisData = {
        claim: "Software security depends on implementation quality, not source model",
        premises: [
          "Both open source and proprietary software can be secure",
          "Security depends on development practices and maintenance",
          "Hybrid approaches can combine benefits of both models"
        ],
        conclusion: "Choose software based on specific security requirements and vendor capabilities",
        argumentType: "synthesis",
        confidence: 0.9,
        supports: ["balanced-approach-001"],
        nextArgumentNeeded: false
      };

      const result = StructuredArgumentationSchema.parse(synthesisData);
      expect(result.argumentType).toBe("synthesis");
      expect(result.confidence).toBe(0.9);
      expect(result.nextArgumentNeeded).toBe(false);
    });

    it('should validate objection argument', () => {
      const objectionData = {
        claim: "The premise about faster vulnerability discovery is questionable",
        premises: [
          "Many open source projects have limited contributors",
          "Complex codebases may not receive thorough security review",
          "Disclosure timelines can be inconsistent"
        ],
        conclusion: "The security argument for open source needs more nuanced analysis",
        argumentType: "objection",
        confidence: 0.65,
        respondsTo: "thesis-open-source-security",
        contradicts: ["premise-faster-discovery"],
        nextArgumentNeeded: true
      };

      const result = StructuredArgumentationSchema.parse(objectionData);
      expect(result.argumentType).toBe("objection");
      expect(result.contradicts).toContain("premise-faster-discovery");
    });

    it('should validate rebuttal argument', () => {
      const rebuttalData = {
        claim: "The objection overlooks established security research",
        premises: [
          "Studies by NIST and academic institutions support open source security",
          "Major open source projects have dedicated security teams",
          "Bug bounty programs attract skilled security researchers"
        ],
        conclusion: "Open source security advantages remain valid despite implementation variations",
        argumentType: "rebuttal",
        confidence: 0.8,
        respondsTo: "objection-vulnerability-discovery",
        supports: ["thesis-open-source-security"],
        nextArgumentNeeded: false
      };

      const result = StructuredArgumentationSchema.parse(rebuttalData);
      expect(result.argumentType).toBe("rebuttal");
      expect(result.supports).toContain("thesis-open-source-security");
    });

    it('should handle empty optional arrays', () => {
      const validData = {
        claim: "Simple claim",
        premises: ["Single premise"],
        conclusion: "Simple conclusion",
        argumentType: "thesis",
        confidence: 0.5,
        supports: [],
        contradicts: [],
        strengths: [],
        weaknesses: [],
        suggestedNextTypes: [],
        nextArgumentNeeded: false
      };

      const result = StructuredArgumentationSchema.parse(validData);

      expect(result.supports).toEqual([]);
      expect(result.contradicts).toEqual([]);
      expect(result.strengths).toEqual([]);
      expect(result.weaknesses).toEqual([]);
      expect(result.suggestedNextTypes).toEqual([]);
    });
  });

  describe('confidence validation', () => {
    it('should validate confidence boundaries', () => {
      const minConfidence = {
        claim: "Low confidence claim",
        premises: ["Uncertain premise"],
        conclusion: "Tentative conclusion",
        argumentType: "thesis",
        confidence: 0.0, // minimum valid
        nextArgumentNeeded: true
      };

      const result = StructuredArgumentationSchema.parse(minConfidence);
      expect(result.confidence).toBe(0.0);

      const maxConfidence = {
        claim: "High confidence claim",
        premises: ["Well-established premise"],
        conclusion: "Strong conclusion",
        argumentType: "thesis",
        confidence: 1.0, // maximum valid
        nextArgumentNeeded: false
      };

      const maxResult = StructuredArgumentationSchema.parse(maxConfidence);
      expect(maxResult.confidence).toBe(1.0);
    });

    it('should reject invalid confidence values', () => {
      expect(() => StructuredArgumentationSchema.parse({
        claim: "Test claim",
        premises: ["Test premise"],
        conclusion: "Test conclusion",
        argumentType: "thesis",
        confidence: -0.1, // below minimum
        nextArgumentNeeded: false
      })).toThrow();

      expect(() => StructuredArgumentationSchema.parse({
        claim: "Test claim",
        premises: ["Test premise"],
        conclusion: "Test conclusion",
        argumentType: "thesis",
        confidence: 1.1, // above maximum
        nextArgumentNeeded: false
      })).toThrow();
    });
  });

  describe('invalid input rejection', () => {
    it('should reject missing required fields', () => {
      expect(() => StructuredArgumentationSchema.parse({})).toThrow();
      
      expect(() => StructuredArgumentationSchema.parse({
        claim: "Valid claim"
        // missing other required fields
      })).toThrow();

      expect(() => StructuredArgumentationSchema.parse({
        claim: "Valid claim",
        premises: ["Valid premise"]
        // missing other required fields
      })).toThrow();
    });

    it('should allow empty strings for string fields', () => {
      // The schema currently allows empty strings, so these should not throw
      expect(() => StructuredArgumentationSchema.parse({
        claim: "",
        premises: ["Valid premise"],
        conclusion: "Valid conclusion",
        argumentType: "thesis",
        confidence: 0.5,
        nextArgumentNeeded: false
      })).not.toThrow();

      expect(() => StructuredArgumentationSchema.parse({
        claim: "Valid claim",
        premises: ["Valid premise"],
        conclusion: "",
        argumentType: "thesis",
        confidence: 0.5,
        nextArgumentNeeded: false
      })).not.toThrow();
    });

    it('should reject invalid argument types', () => {
      expect(() => StructuredArgumentationSchema.parse({
        claim: "Valid claim",
        premises: ["Valid premise"],
        conclusion: "Valid conclusion",
        argumentType: "invalid-type",
        confidence: 0.5,
        nextArgumentNeeded: false
      })).toThrow();
    });

    it('should reject invalid field types', () => {
      expect(() => StructuredArgumentationSchema.parse({
        claim: 123, // invalid type
        premises: ["Valid premise"],
        conclusion: "Valid conclusion",
        argumentType: "thesis",
        confidence: 0.5,
        nextArgumentNeeded: false
      })).toThrow();

      expect(() => StructuredArgumentationSchema.parse({
        claim: "Valid claim",
        premises: "not an array", // invalid type
        conclusion: "Valid conclusion",
        argumentType: "thesis",
        confidence: 0.5,
        nextArgumentNeeded: false
      })).toThrow();

      expect(() => StructuredArgumentationSchema.parse({
        claim: "Valid claim",
        premises: ["Valid premise"],
        conclusion: "Valid conclusion",
        argumentType: "thesis",
        confidence: "not a number", // invalid type
        nextArgumentNeeded: false
      })).toThrow();
    });

    it('should reject arrays with non-string elements', () => {
      expect(() => StructuredArgumentationSchema.parse({
        claim: "Valid claim",
        premises: [123, "valid premise", true], // invalid elements
        conclusion: "Valid conclusion",
        argumentType: "thesis",
        confidence: 0.5,
        nextArgumentNeeded: false
      })).toThrow();

      expect(() => StructuredArgumentationSchema.parse({
        claim: "Valid claim",
        premises: ["Valid premise"],
        conclusion: "Valid conclusion",
        argumentType: "thesis",
        confidence: 0.5,
        supports: ["valid-id", 456], // invalid element
        nextArgumentNeeded: false
      })).toThrow();
    });

    it('should reject invalid suggested next types', () => {
      expect(() => StructuredArgumentationSchema.parse({
        claim: "Valid claim",
        premises: ["Valid premise"],
        conclusion: "Valid conclusion",
        argumentType: "thesis",
        confidence: 0.5,
        suggestedNextTypes: ["thesis", "invalid-type"], // invalid type
        nextArgumentNeeded: false
      })).toThrow();
    });

    it('should provide detailed error messages', () => {
      try {
        StructuredArgumentationSchema.parse({
          claim: 123,
          premises: "not-array",
          conclusion: null,
          argumentType: "invalid-type",
          confidence: 1.5
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.errors).toBeDefined();
        expect(error.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('type inference', () => {
    it('should properly infer StructuredArgumentationData type', () => {
      const data: StructuredArgumentationData = {
        claim: "Type inference test",
        premises: ["TypeScript provides type safety"],
        conclusion: "Use TypeScript for better code quality",
        argumentType: "thesis",
        confidence: 0.9,
        nextArgumentNeeded: true
      };

      // Should compile without errors
      expect(data.claim).toBe("Type inference test");
      expect(data.premises[0]).toBe("TypeScript provides type safety");
      expect(data.argumentType).toBe("thesis");
      expect(data.confidence).toBe(0.9);
    });
  });

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longString = "x".repeat(10000);
      
      const validData = {
        claim: longString,
        premises: [longString],
        conclusion: "Long string test",
        argumentType: "thesis",
        confidence: 0.5,
        nextArgumentNeeded: false
      };

      const result = StructuredArgumentationSchema.parse(validData);
      expect(result.claim).toHaveLength(10000);
      expect(result.premises[0]).toHaveLength(10000);
    });

    it('should handle large arrays', () => {
      const manyPremises = Array.from({ length: 100 }, (_, i) => `Premise ${i + 1}`);
      
      const validData = {
        claim: "Claim with many premises",
        premises: manyPremises,
        conclusion: "Conclusion from many premises",
        argumentType: "thesis",
        confidence: 0.6,
        nextArgumentNeeded: false
      };

      const result = StructuredArgumentationSchema.parse(validData);
      expect(result.premises).toHaveLength(100);
      expect(result.premises[99]).toBe("Premise 100");
    });

    it('should handle complex philosophical arguments', () => {
      const philosophicalArgument = {
        claim: "Free will is compatible with determinism",
        premises: [
          "Determinism means every event is the result of prior causes",
          "Free will requires the ability to choose between alternatives",
          "Compatibilist free will focuses on the source of action rather than alternative possibilities",
          "Actions are free when they flow from our own desires and rational deliberation",
          "Determinism doesn't negate the reality of choice-making processes"
        ],
        conclusion: "Free will and determinism can coexist under a compatibilist interpretation",
        argumentId: "compatibilism-argument-001",
        argumentType: "thesis",
        confidence: 0.75,
        strengths: [
          "Addresses the apparent paradox between free will and causation",
          "Provides a framework that preserves moral responsibility",
          "Supported by prominent philosophers like Hume and Mill"
        ],
        weaknesses: [
          "May not satisfy libertarian intuitions about ultimate responsibility",
          "Relies on specific definitions of 'free' that some find inadequate",
          "Doesn't fully address the consequence argument"
        ],
        nextArgumentNeeded: true,
        suggestedNextTypes: ["antithesis", "objection"]
      };

      const result = StructuredArgumentationSchema.parse(philosophicalArgument);
      expect(result.premises).toHaveLength(5);
      expect(result.strengths).toHaveLength(3);
      expect(result.weaknesses).toHaveLength(3);
      expect(result.claim).toContain("Free will");
    });

    it('should handle scientific argumentation', () => {
      const scientificArgument = {
        claim: "Climate change is primarily caused by human activities",
        premises: [
          "Atmospheric CO2 levels have increased by 40% since pre-industrial times",
          "The isotopic signature of atmospheric CO2 matches fossil fuel sources",
          "Global temperatures correlate strongly with greenhouse gas concentrations",
          "Natural climate drivers cannot account for observed warming patterns",
          "Climate models accurately predict warming when human factors are included"
        ],
        conclusion: "Immediate action is needed to reduce greenhouse gas emissions",
        argumentType: "thesis",
        confidence: 0.95,
        strengths: [
          "Supported by multiple lines of evidence",
          "Consensus among climate scientists (97%+)",
          "Predictions have been consistently validated"
        ],
        nextArgumentNeeded: false
      };

      const result = StructuredArgumentationSchema.parse(scientificArgument);
      expect(result.confidence).toBe(0.95);
      expect(result.premises).toHaveLength(5);
      expect(result.nextArgumentNeeded).toBe(false);
    });
  });

  describe('dialectical reasoning patterns', () => {
    it('should support thesis-antithesis-synthesis pattern', () => {
      // This would typically be a sequence of related arguments
      const thesis = {
        claim: "Technology improves human productivity",
        premises: ["Automation reduces manual labor", "Digital tools enhance capabilities"],
        conclusion: "Society should embrace technological advancement",
        argumentId: "tech-thesis",
        argumentType: "thesis",
        confidence: 0.8,
        nextArgumentNeeded: true
      };

      const antithesis = {
        claim: "Technology reduces human agency and skills",
        premises: ["Automation displaces workers", "Digital dependence weakens cognitive abilities"],
        conclusion: "Society should be cautious about technological adoption",
        argumentId: "tech-antithesis",
        argumentType: "antithesis",
        respondsTo: "tech-thesis",
        confidence: 0.7,
        nextArgumentNeeded: true
      };

      const synthesis = {
        claim: "Technology's impact depends on how it's implemented and used",
        premises: [
          "Technology can both enhance and diminish human capabilities",
          "The key is thoughtful integration that preserves human agency",
          "Education and adaptation can maximize benefits while minimizing harms"
        ],
        conclusion: "Society should pursue balanced technological integration",
        argumentId: "tech-synthesis",
        argumentType: "synthesis",
        supports: ["tech-thesis", "tech-antithesis"],
        confidence: 0.85,
        nextArgumentNeeded: false
      };

      const thesisResult = StructuredArgumentationSchema.parse(thesis);
      const antithesisResult = StructuredArgumentationSchema.parse(antithesis);
      const synthesisResult = StructuredArgumentationSchema.parse(synthesis);

      expect(thesisResult.argumentType).toBe("thesis");
      expect(antithesisResult.argumentType).toBe("antithesis");
      expect(antithesisResult.respondsTo).toBe("tech-thesis");
      expect(synthesisResult.argumentType).toBe("synthesis");
      expect(synthesisResult.supports).toContain("tech-thesis");
      expect(synthesisResult.supports).toContain("tech-antithesis");
    });
  });
}); 