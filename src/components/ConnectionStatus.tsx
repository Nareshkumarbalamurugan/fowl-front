import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useFirebaseConnection } from '@/hooks/useFirebaseConnection';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
  showWhenOnline?: boolean;
}

export function ConnectionStatus({ className = '', showWhenOnline = false }: ConnectionStatusProps) {
  const { isOnline, isConnected, lastError, retryCount, forceReconnect } = useFirebaseConnection();

  // Don't show anything if online and showWhenOnline is false
  if (isOnline && isConnected && !showWhenOnline) {
    return null;
  }

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        variant: 'destructive' as const,
        icon: <WifiOff className="h-4 w-4" />,
        title: 'You are offline',
        description: 'Some features may not work until you reconnect to the internet.'
      };
    }

    if (!isConnected) {
      return {
        variant: 'destructive' as const,
        icon: <WifiOff className="h-4 w-4" />,
        title: 'Connection issues',
        description: lastError || 'Unable to connect to the server. Retrying...'
      };
    }

    return {
      variant: 'default' as const,
      icon: <Wifi className="h-4 w-4" />,
      title: 'Connected',
      description: 'All systems operational'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Alert variant={statusInfo.variant} className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {statusInfo.icon}
          <div>
            <div className="font-medium">{statusInfo.title}</div>
            <AlertDescription className="text-sm">
              {statusInfo.description}
              {retryCount > 0 && ` (Attempt ${retryCount})`}
            </AlertDescription>
          </div>
        </div>
        
        {(!isOnline || !isConnected) && (
          <Button
            variant="outline"
            size="sm"
            onClick={forceReconnect}
            className="ml-4"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );
}
