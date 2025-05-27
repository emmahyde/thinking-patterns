/**
 * Utils barrel export
 * Provides centralized access to all utility functions
 */

// Export all formatting utilities
export {
  // Core formatting functions
  boxed,
  formatHeader,
  formatSection,
  bordered,
  divider,

  // Themed convenience functions
  successBox,
  errorBox,
  warningBox,
  infoBox,

  // Configuration and constants
  Colors,
  BoxChars,
  Themes,
  DEFAULT_BOX_CONFIG,

  // Types
  type BoxConfig,
} from './prettyBox';
