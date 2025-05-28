export class ValidationError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any> | null;

  constructor(message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.details = details === null ? null : (details ? { ...details } : undefined); // Preserve null vs undefined
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      code: this.code,
      details: this.details
    };
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

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      code: this.code,
      sessionId: this.sessionId
    };
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

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      code: this.code,
      severity: this.severity
    };
  }
}

export class ProcessingError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any> | null;

  constructor(message: string, context?: Record<string, any>) {
    super(message);
    this.name = 'ProcessingError';
    this.code = 'PROCESSING_ERROR';
    this.context = context === null ? null : (context ? { ...context } : undefined); // Preserve null vs undefined
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      code: this.code,
      context: this.context
    };
  }
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any> | null;
  timestamp: string;
  requestId?: string;
}
