/**
 * UI Utilities for consistent formatting and display
 * Provides shared utilities for creating boxes, headers, and sections
 */

// ANSI color codes for console output
export const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
} as const;

/**
 * Box drawing characters for consistent borders
 */
export const BoxChars = {
  horizontal: '─',
  vertical: '│',
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  tee: '├',
  teeRight: '┤',
  cross: '┼',
} as const;

/**
 * Configuration for box formatting
 */
export interface BoxConfig {
  padding: number;
  minWidth: number;
  maxWidth: number;
  borderColor: string;
  headerColor: string;
  sectionColor: string;
}

export const DEFAULT_BOX_CONFIG: BoxConfig = {
  padding: 1,
  minWidth: 40,
  maxWidth: 100,
  borderColor: Colors.cyan,
  headerColor: Colors.bright + Colors.white,
  sectionColor: Colors.yellow,
};

/**
 * Calculate the display width of a string, accounting for ANSI escape sequences and emojis
 */
function getDisplayWidth(text: string): number {
  // Remove ANSI escape sequences
  const cleanText = text.replace(/\x1b\[[0-9;]*m/g, '');

  // Count emoji and other unicode characters as 2 width
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

/**
 * Pad a string to the specified width, accounting for display width
 */
function padToWidth(text: string, width: number, char: string = ' '): string {
  const displayWidth = getDisplayWidth(text);
  const padding = Math.max(0, width - displayWidth);
  return text + char.repeat(padding);
}

/**
 * Wrap text to fit within specified width
 */
function wrapText(text: string, width: number): string[] {
  if (getDisplayWidth(text) <= width) {
    return [text];
  }

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (getDisplayWidth(testLine) <= width) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        // Word is too long, break it
        lines.push(word.substring(0, width - 3) + '...');
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Format a header with optional emoji and consistent styling
 */
export function formatHeader(text: string, emoji?: string, config: Partial<BoxConfig> = {}): string {
  const fullConfig = { ...DEFAULT_BOX_CONFIG, ...config };
  const headerText = emoji ? `${emoji} ${text}` : text;

  return `${fullConfig.headerColor}${headerText}${Colors.reset}`;
}

/**
 * Format a section with title and content
 */
export function formatSection(
  title: string,
  content: string | string[],
  config: Partial<BoxConfig> = {}
): string {
  const fullConfig = { ...DEFAULT_BOX_CONFIG, ...config };
  const lines: string[] = [];

  // Add section title
  lines.push(`${fullConfig.sectionColor}${title}:${Colors.reset}`);

  // Process content
  const contentArray = Array.isArray(content) ? content : [content];

  for (const item of contentArray) {
    if (typeof item === 'string') {
      const wrappedLines = wrapText(item, fullConfig.maxWidth - fullConfig.padding * 2 - 2);
      for (const line of wrappedLines) {
        lines.push(`  ${line}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Create a formatted box with title and sections
 */
export function boxed(
  title: string,
  sections: Record<string, string | string[]>,
  config: Partial<BoxConfig> = {}
): string {
  const fullConfig = { ...DEFAULT_BOX_CONFIG, ...config };
  const lines: string[] = [];

  // Collect all content to calculate box width
  const allContent: string[] = [];
  allContent.push(title);

  // Process sections and collect content
  const sectionLines: string[] = [];
  for (const [sectionTitle, sectionContent] of Object.entries(sections)) {
    const formattedSection = formatSection(sectionTitle, sectionContent, config);
    const sectionTextLines = formattedSection.split('\n');
    sectionLines.push(...sectionTextLines);

    // Add to content for width calculation (without colors)
    for (const line of sectionTextLines) {
      allContent.push(line.replace(/\x1b\[[0-9;]*m/g, ''));
    }
  }

  // Calculate optimal box width
  const maxContentWidth = Math.max(...allContent.map(getDisplayWidth));
  const boxWidth = Math.min(
    Math.max(maxContentWidth + fullConfig.padding * 2, fullConfig.minWidth),
    fullConfig.maxWidth
  );

  const innerWidth = boxWidth - 2; // Subtract border characters

  // Build the box
  const borderColor = fullConfig.borderColor;
  const reset = Colors.reset;

  // Top border
  lines.push(`${borderColor}${BoxChars.topLeft}${BoxChars.horizontal.repeat(innerWidth)}${BoxChars.topRight}${reset}`);

  // Title line
  const paddedTitle = padToWidth(` ${formatHeader(title)} `, innerWidth);
  lines.push(`${borderColor}${BoxChars.vertical}${reset}${paddedTitle}${borderColor}${BoxChars.vertical}${reset}`);

  // Separator after title if there are sections
  if (Object.keys(sections).length > 0) {
    lines.push(`${borderColor}${BoxChars.tee}${BoxChars.horizontal.repeat(innerWidth)}${BoxChars.teeRight}${reset}`);
  }

  // Content sections
  for (const line of sectionLines) {
    const paddedLine = padToWidth(` ${line} `, innerWidth);
    lines.push(`${borderColor}${BoxChars.vertical}${reset}${paddedLine}${borderColor}${BoxChars.vertical}${reset}`);
  }

  // Add padding line if content exists
  if (sectionLines.length > 0) {
    const emptyLine = padToWidth(' ', innerWidth);
    lines.push(`${borderColor}${BoxChars.vertical}${reset}${emptyLine}${borderColor}${BoxChars.vertical}${reset}`);
  }

  // Bottom border
  lines.push(`${borderColor}${BoxChars.bottomLeft}${BoxChars.horizontal.repeat(innerWidth)}${BoxChars.bottomRight}${reset}`);

  return lines.join('\n');
}

/**
 * Create a simple border around text
 */
export function bordered(text: string, config: Partial<BoxConfig> = {}): string {
  const fullConfig = { ...DEFAULT_BOX_CONFIG, ...config };
  const lines = text.split('\n');
  const maxWidth = Math.max(...lines.map(getDisplayWidth));
  const boxWidth = Math.min(
    Math.max(maxWidth + fullConfig.padding * 2, fullConfig.minWidth),
    fullConfig.maxWidth
  );

  const result: string[] = [];
  const borderColor = fullConfig.borderColor;
  const reset = Colors.reset;
  const innerWidth = boxWidth - 2;

  // Top border
  result.push(`${borderColor}${BoxChars.topLeft}${BoxChars.horizontal.repeat(innerWidth)}${BoxChars.topRight}${reset}`);

  // Content lines
  for (const line of lines) {
    const paddedLine = padToWidth(` ${line} `, innerWidth);
    result.push(`${borderColor}${BoxChars.vertical}${reset}${paddedLine}${borderColor}${BoxChars.vertical}${reset}`);
  }

  // Bottom border
  result.push(`${borderColor}${BoxChars.bottomLeft}${BoxChars.horizontal.repeat(innerWidth)}${BoxChars.bottomRight}${reset}`);

  return result.join('\n');
}

/**
 * Create a simple divider line
 */
export function divider(width: number = 80, char: string = BoxChars.horizontal): string {
  return char.repeat(width);
}

/**
 * Color themes for different types of output
 */
export const Themes = {
  success: {
    borderColor: Colors.green,
    headerColor: Colors.bright + Colors.green,
    sectionColor: Colors.green,
  },
  error: {
    borderColor: Colors.red,
    headerColor: Colors.bright + Colors.red,
    sectionColor: Colors.red,
  },
  warning: {
    borderColor: Colors.yellow,
    headerColor: Colors.bright + Colors.yellow,
    sectionColor: Colors.yellow,
  },
  info: {
    borderColor: Colors.blue,
    headerColor: Colors.bright + Colors.blue,
    sectionColor: Colors.blue,
  },
  subtle: {
    borderColor: Colors.gray,
    headerColor: Colors.white,
    sectionColor: Colors.gray,
  },
} as const;

/**
 * Convenience functions for themed boxes
 */
export function successBox(title: string, sections: Record<string, string | string[]>): string {
  return boxed(title, sections, Themes.success);
}

export function errorBox(title: string, sections: Record<string, string | string[]>): string {
  return boxed(title, sections, Themes.error);
}

export function warningBox(title: string, sections: Record<string, string | string[]>): string {
  return boxed(title, sections, Themes.warning);
}

export function infoBox(title: string, sections: Record<string, string | string[]>): string {
  return boxed(title, sections, Themes.info);
}
