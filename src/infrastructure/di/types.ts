// src/infrastructure/di/types.ts

const TYPES = {
  // Core Services
  ApiClient: Symbol.for('ApiClient'),
  MLClient: Symbol.for('MLClient'),
  AuthService: Symbol.for('AuthService'),
  StorageService: Symbol.for('StorageService'),

  // Add other service identifiers as needed
};

export { TYPES };
