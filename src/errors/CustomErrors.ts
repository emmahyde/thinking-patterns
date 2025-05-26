export class ValidationError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any>;

  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.details = details;
  }
}

export class StateError extends Error {
  public readonly code: string;
  public readonly sessionId?: string;

  constructor(message: string, sessionId?: string) {
    super(message);
    this.name = 'StateError';
    this.code = 'STATE_ERROR';
    this.sessionId = sessionId;
  }
}

export class SecurityError extends Error {
  public readonly code: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';

  constructor(message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    super(message);
    this.name = 'SecurityError';
    this.code = 'SECURITY_ERROR';
    this.severity = severity;
  }
}

export class ProcessingError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = 'ProcessingError';
    this.code = 'PROCESSING_ERROR';
    this.context = context;
  }
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}
