import { FirebaseError } from 'firebase/app';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

/**
 * Enhanced Firebase operation wrapper with retry logic and error handling
 */
export class FirebaseOperationManager {
  private static defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2
  };

  /**
   * Execute a Firebase operation with automatic retry on network errors
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: Error;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        // Don't retry on non-network errors
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === opts.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          opts.baseDelay * Math.pow(opts.backoffFactor, attempt),
          opts.maxDelay
        );

        console.warn(
          `🔄 Firebase operation failed (attempt ${attempt + 1}/${opts.maxRetries + 1}). ` +
          `Retrying in ${delay}ms...`,
          error.code || error.message
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // If we get here, all retries failed
    console.error('❌ Firebase operation failed after all retries:', lastError);
    throw lastError;
  }

  /**
   * Check if an error is retryable (network-related)
   */
  private static isRetryableError(error: any): boolean {
    if (error instanceof FirebaseError) {
      const retryableCodes = [
        'unavailable',
        'deadline-exceeded',
        'internal',
        'resource-exhausted',
        'cancelled'
      ];
      return retryableCodes.includes(error.code);
    }

    // Check for network-related error messages
    const errorMessage = error.message?.toLowerCase() || '';
    const networkErrorPatterns = [
      'network',
      'connection',
      'timeout',
      'offline',
      'err_blocked_by_client',
      'err_network_io_suspended',
      'err_connection_reset',
      'err_internet_disconnected'
    ];

    return networkErrorPatterns.some(pattern => errorMessage.includes(pattern));
  }

  /**
   * Wrapper for Firestore real-time listeners with error handling
   */
  static wrapRealtimeListener<T>(
    subscribeFunction: (callback: (data: T) => void) => () => void,
    onData: (data: T) => void,
    onError?: (error: Error) => void
  ): () => void {
    let unsubscribe: (() => void) | null = null;
    let retryTimeoutId: NodeJS.Timeout | null = null;

    const setupListener = () => {
      try {
        unsubscribe = subscribeFunction((data: T) => {
          // Clear any pending retry on successful data
          if (retryTimeoutId) {
            clearTimeout(retryTimeoutId);
            retryTimeoutId = null;
          }
          onData(data);
        });
      } catch (error: any) {
        console.warn('🔄 Realtime listener setup failed, retrying...', error);
        
        if (onError) onError(error);
        
        // Retry after delay
        retryTimeoutId = setTimeout(() => {
          setupListener();
        }, 3000);
      }
    };

    setupListener();

    // Return cleanup function
    return () => {
      if (unsubscribe) unsubscribe();
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
    };
  }
}

// Convenience function for common Firebase operations
export const withFirebaseRetry = FirebaseOperationManager.executeWithRetry;
