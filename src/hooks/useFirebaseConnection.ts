import { useState, useEffect } from 'react';
import { db, FirebaseConnectionManager } from '@/lib/firebase';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

interface ConnectionState {
  isOnline: boolean;
  isConnected: boolean;
  lastError: string | null;
  retryCount: number;
}

export function useFirebaseConnection() {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: navigator.onLine,
    isConnected: true,
    lastError: null,
    retryCount: 0
  });

  useEffect(() => {
    const handleOnline = () => {
      setConnectionState(prev => ({
        ...prev,
        isOnline: true,
        lastError: null
      }));
    };

    const handleOffline = () => {
      setConnectionState(prev => ({
        ...prev,
        isOnline: false,
        lastError: 'Device is offline'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const forceReconnect = async () => {
    try {
      setConnectionState(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1
      }));

      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await enableNetwork(db);

      setConnectionState(prev => ({
        ...prev,
        isConnected: true,
        lastError: null
      }));
    } catch (error: any) {
      setConnectionState(prev => ({
        ...prev,
        isConnected: false,
        lastError: error.message
      }));
    }
  };

  return {
    ...connectionState,
    forceReconnect
  };
}
