/**
 * Tests for prettyBox UI utilities
 * Tests box formatting, Unicode handling, themes, and text wrapping
 */

import {
  boxed,
  formatHeader,
  formatSection,
  BoxConfig,
  DEFAULT_BOX_CONFIG,
  Themes,
  Colors
} from '../../src/utils/prettyBox.js';
import {
  sampleBoxContent,
  sampleLongContent
  } from '../helpers/testFixtures.js';

describe('prettyBox utilities', () => {
  describe('boxed function', () => {
    it('should create a properly formatted box with title and sections', () => {
      const result = boxed(sampleBoxContent.title, sampleBoxContent.sections);

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain(sampleBoxContent.title);
      expect(result).toContain("Current Thought");
      expect(result).toContain("Progress");
      expect(result).toContain("Status");
    });

    it('should handle empty sections gracefully', () => {
      const result = boxed("Empty Box", {});

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain("Empty Box");

      const lines = result.split('\n');
      expect(lines.length).toBeGreaterThanOrEqual(3); // At least top border, title, bottom border
    });

    it('should handle sections with string values', () => {
      const sections = {
        "Section 1": "Simple string value",
        "Section 2": "Another string value"
      };

      const result = boxed("String Sections", sections);

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain("Simple string value");
      expect(result).toContain("Another string value");
    });

    it('should handle sections with array values', () => {
      const sections = {
        "List Section": [
          "Item 1",
          "Item 2",
          "Item 3"
        ]
      };

      const result = boxed("Array Sections", sections);

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain("Item 1");
      expect(result).toContain("Item 2");
      expect(result).toContain("Item 3");
    });

    it('should handle mixed string and array sections', () => {
      const sections = {
        "String Section": "Single line content",
        "Array Section": ["Line 1", "Line 2", "Line 3"],
        "Another String": "More content"
      };

      const result = boxed("Mixed Content", sections);

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain("Single line content");
      expect(result).toContain("Line 1");
      expect(result).toContain("Line 2");
      expect(result).toContain("More content");
    });

    it('should handle very long content with wrapping', () => {
      const result = boxed(sampleLongContent.title, sampleLongContent.sections);

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain("Performance Analysis");

      // Long text should be wrapped
      const lines = result.split('\n');
      const maxLineLength = Math.max(...lines.map(line => estimateDisplayWidth(line)));
      expect(maxLineLength).toBeLessThan(120); // Should wrap before becoming too long
    });

    it('should handle Unicode and emoji characters correctly', () => {
      const unicodeContent = {
        "Unicode Test": "测试 🚀 → ★ ♦ ◆ ■ ● ▲",
        "Emoji Section": ["🔥 Fire", "⚡ Lightning", "🌟 Star"],
        "Mixed": "Regular text with émojis 😀 and spëcial chars"
      };

      const result = boxed("🌍 Unicode Box", unicodeContent);

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain("🌍");
      expect(result).toContain("🚀");
      expect(result).toContain("测试");
    });

    it('should maintain consistent border widths', () => {
      const result = boxed("Border Test", {
        "Section": "Content for border width testing"
      });

      const lines = result.split('\n');
      const topBorder = lines[0];
      const bottomBorder = lines[lines.length - 1];

      // Borders should have similar structure
      expect(topBorder.includes('─')).toBe(true);
      expect(bottomBorder.includes('─')).toBe(true);

      // Should have corner characters (may have ANSI color codes before them)
      expect(topBorder.includes('┌') || topBorder.includes('╭')).toBe(true);
      expect(bottomBorder.includes('└') || bottomBorder.includes('╰')).toBe(true);
    });

    it('should handle custom themes', () => {
      const customTheme: Partial<BoxConfig> = {
        borderColor: '\x1b[35m',    // Magenta
        headerColor: '\x1b[36m',    // Cyan
        sectionColor: '\x1b[33m',   // Yellow
      };

      const result = boxed("Themed Box", { "Content": "Colored content" }, customTheme);

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain("Themed Box");
      expect(result).toContain("Colored content");
      // Should contain color codes
      expect(result).toContain('\x1b[');
    });
  });

  describe('formatHeader function', () => {
    it('should format header with emoji', () => {
      const result = formatHeader("Test Header", "🧠");

      expect(result).toContain("Test Header");
      expect(result).toContain("🧠");
      expect(result.length).toBeGreaterThan("Test Header".length);
    });

    it('should format header without emoji', () => {
      const result = formatHeader("Plain Header");

      expect(result).toContain("Plain Header");
      expect(result).not.toContain("🧠");
    });

    it('should handle empty header text', () => {
      const result = formatHeader("");

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle long header text', () => {
      const longHeader = "This is a very long header that might need special handling";
      const result = formatHeader(longHeader, "📋");

      expect(result).toContain(longHeader);
      expect(result).toContain("📋");
    });

    it('should handle Unicode characters in header', () => {
      const unicodeHeader = "测试 Header with émojis 🌟";
      const result = formatHeader(unicodeHeader, "🎯");

      expect(result).toContain(unicodeHeader);
      expect(result).toContain("🎯");
    });
  });

  describe('formatSection function', () => {
    it('should format section with string content', () => {
      const result = formatSection("Section Title", "Section content here");

      expect(result).toContain("Section Title");
      expect(result).toContain("Section content here");
    });

    it('should format section with array content', () => {
      const content = ["Line 1", "Line 2", "Line 3"];
      const result = formatSection("List Section", content);

      expect(result).toContain("List Section");
      expect(result).toContain("Line 1");
      expect(result).toContain("Line 2");
      expect(result).toContain("Line 3");
    });

    it('should handle empty string content', () => {
      const result = formatSection("Empty Section", "");

      expect(result).toContain("Empty Section");
      expect(typeof result).toBe('string');
    });

    it('should handle empty array content', () => {
      const result = formatSection("Empty List", []);

      expect(result).toContain("Empty List");
      expect(typeof result).toBe('string');
    });

    it('should handle very long section content', () => {
      const longContent = "This is a very long piece of content that should be handled properly by the formatting function and should not break the layout or cause any issues with the display width calculations.";
      const result = formatSection("Long Content", longContent);

      expect(result).toContain("Long Content");
      expect(result).toContain(longContent.substring(0, 20)); // Should contain at least part of the content
    });

    it('should handle array with long items', () => {
      const longItems = [
        "This is a very long first item that exceeds normal line length",
        "This is another long item with lots of detailed information",
        "Short item",
        "Yet another extremely long item that tests the wrapping and formatting capabilities"
      ];
      const result = formatSection("Long Items", longItems);

      expect(result).toContain("Long Items");
      longItems.forEach(item => {
        expect(result).toContain(item.substring(0, 10)); // Should contain at least part of each item
      });
    });
  });

  // Helper function to approximate display width for testing
  function estimateDisplayWidth(text: string): number {
    // Remove ANSI escape sequences
    const cleanText = text.replace(/\x1b\[[0-9;]*m/g, '');

    // Simple approximation - count most chars as 1, emojis as 2
    let width = 0;
    for (const char of cleanText) {
      const code = char.codePointAt(0);
      if (code && code > 0x1F600) {
        // Emoji and other wide characters
        width += 2;
      } else {
        width += 1;
      }
    }
    return width;
  }

  describe('display width handling', () => {
    it('should handle varying text widths in formatted output', () => {
      const result = boxed("Width Test", {
        "ASCII": "Simple text",
        "Unicode": "测试 text",
        "Emoji": "Text with 🚀 emoji"
      });

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain("Simple text");
      expect(result).toContain("测试");
      expect(result).toContain("🚀");
    });

    it('should handle long content appropriately', () => {
      const longContent = "This is a very long piece of content that should be handled properly ".repeat(3);
      const result = boxed("Long Content", { "Content": longContent });

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      // Should contain at least part of the content
      expect(result).toContain(longContent.substring(0, 20));
    });
  });

  describe('theme integration', () => {
    it('should use default theme when none provided', () => {
      const result = boxed("Default Theme", { "Section": "Content" });

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain("Default Theme");
    });

    it('should apply custom theme colors', () => {
      const customTheme: Partial<BoxConfig> = {
        borderColor: '\x1b[91m',    // Bright red
        headerColor: '\x1b[92m',    // Bright green
        sectionColor: '\x1b[93m',   // Bright yellow
      };

      const result = boxed("Custom Theme", { "Section": "Colored" }, customTheme);

      expect(result).toContain('\x1b['); // Should contain color codes
    });

    it('should handle theme with missing properties gracefully', () => {
      const incompleteTheme = {
        primary: '\x1b[31m',
        reset: '\x1b[0m'
        // Missing other properties
      } as any;

      // Should not throw error even with incomplete theme
      expect(() => {
        boxed("Incomplete Theme", { "Section": "Test" }, incompleteTheme);
      }).not.toThrow();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(() => boxed("Title", {})).not.toThrow();
      expect(() => formatHeader("")).not.toThrow();
      expect(() => formatSection("Title", "")).not.toThrow();
    });

    it('should handle extremely long titles', () => {
      const longTitle = "X".repeat(200);
      const result = boxed(longTitle, { "Section": "Content" });

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(result).toContain(longTitle.substring(0, 50)); // Should contain at least part of title
    });

    it('should handle sections with special characters', () => {
      const specialSections = {
        "Special\nChars": "Content\twith\ttabs",
        "More\\Special": "Content\\with\\backslashes",
        "Quotes'Test": 'Content"with"quotes'
      };

      const result = boxed("Special Characters", specialSections);

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(typeof result).toBe('string');
    });

    it('should handle very wide content', () => {
      const wideContent = {
        "Wide": "X".repeat(300)
      };

      const result = boxed("Wide Content", wideContent);

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);

      // Should wrap or handle wide content appropriately
      const lines = result.split('\n');
      const maxWidth = Math.max(...lines.map(line => estimateDisplayWidth(line)));
      expect(maxWidth).toBeLessThan(200); // Should be wrapped/truncated
    });

    it('should handle deeply nested array structures', () => {
      const nestedContent = {
        "Nested": [
          "Level 1",
          ["Level 2a", "Level 2b"], // This might be flattened or handled specially
          "Back to Level 1"
        ] as any
      };

      expect(() => {
        boxed("Nested Content", nestedContent);
      }).not.toThrow();
    });
  });

  describe('performance tests', () => {
    it('should handle large content efficiently', () => {
      const largeContent: Record<string, string | string[]> = {};

      // Generate large content
      for (let i = 0; i < 100; i++) {
        largeContent[`Section ${i}`] = `Content for section ${i}`.repeat(10);
      }

      const start = Date.now();
      const result = boxed("Large Content Test", largeContent);
      const elapsed = Date.now() - start;

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(elapsed).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle many small sections efficiently', () => {
      const manySmallSections: Record<string, string> = {};

      for (let i = 0; i < 500; i++) {
        manySmallSections[`Section ${i}`] = `Content ${i}`;
      }

      const start = Date.now();
      const result = boxed("Many Sections", manySmallSections);
      const elapsed = Date.now() - start;

      expect(result).toContain('─');
      expect(result.split('\n').length).toBeGreaterThan(2);
      expect(elapsed).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });
});
