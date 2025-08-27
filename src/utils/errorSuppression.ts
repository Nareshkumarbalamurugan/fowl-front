/**
 * Firebase Error Suppression Utility
 * Reduces noise from common Firebase network errors that don't affect functionality
 */

export function setupFirebaseErrorSuppression() {
  // Only suppress in development mode
  if (import.meta.env.DEV) {
    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Firebase error patterns to suppress
    const suppressPatterns = [
      'WebChannelConnection RPC',
      'transport errored',
      'ERR_BLOCKED_BY_CLIENT',
      'ERR_NETWORK_IO_SUSPENDED', 
      'ERR_CONNECTION_RESET',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NETWORK_CHANGED',
      'ERR_QUIC_PROTOCOL_ERROR',
      'Failed to load resource',
      'net::ERR_'
    ];

    // Override console.error
    console.error = (...args) => {
      const message = args.join(' ');
      const shouldSuppress = suppressPatterns.some(pattern => 
        message.includes(pattern)
      );

      if (!shouldSuppress) {
        originalError.apply(console, args);
      }
    };

    // Override console.warn  
    console.warn = (...args) => {
      const message = args.join(' ');
      const shouldSuppress = suppressPatterns.some(pattern => 
        message.includes(pattern)
      );

      if (!shouldSuppress) {
        originalWarn.apply(console, args);
      }
    };

    console.log('🔇 Firebase network error suppression enabled for development');
  }
}

// Auto-setup when imported
setupFirebaseErrorSuppression();
