// Base SNS Error class
export class SnsError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'SnsError';
    this.code = code;
    this.details = details;
  }
}

// Record Not Initialized Error
export class SnsRecordNotInitializedError extends SnsError {
  constructor(domain) {
    super(
      'This SNS domain is not initialized for website/IPFS content. Please use the SNS dashboard to add a record first, or contact support.',
      'RECORD_NOT_INITIALIZED',
      { domain }
    );
    this.name = 'SnsRecordNotInitializedError';
  }
}

// Ownership Error
export class SnsOwnershipError extends SnsError {
  constructor(domain, wallet) {
    super(
      'Domain is not owned by the provided wallet',
      'OWNERSHIP_ERROR',
      { domain, wallet }
    );
    this.name = 'SnsOwnershipError';
  }
}

// Simulation Error
export class SnsSimulationError extends SnsError {
  constructor(error, logs) {
    super(
      'Update transaction simulation failed',
      'SIMULATION_ERROR',
      { error, logs }
    );
    this.name = 'SnsSimulationError';
  }
} 