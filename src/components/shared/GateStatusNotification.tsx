import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { realTimeService } from '../../services/realTimeService';
import { 
  DoorOpen, 
  DoorClosed, 
  AlertTriangle, 
  X,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GateStatusChange {
  id: string;
  gateId: string;
  gateName: string;
  previousStatus: string;
  newStatus: string;
  timestamp: Date;
  adminInitiated: boolean;
}

interface GateStatusNotificationProps {
  maxNotifications?: number;
  autoHideDelay?: number;
  showTimestamp?: boolean;
  className?: string;
}

export const GateStatusNotification = ({ 
  maxNotifications = 3,
  autoHideDelay = 8000,
  showTimestamp = true,
  className 
}: GateStatusNotificationProps) => {
  const [notifications, setNotifications] = useState<GateStatusChange[]>([]);

  useEffect(() => {
    const handleGateStatusUpdate = (event: any) => {
      if (event.data && event.data.gates) {
        event.data.gates.forEach((gate: any) => {
          // Create a notification for the gate status change
          const notification: GateStatusChange = {
            id: `notification-${Date.now()}-${gate.id}`,
            gateId: gate.id,
            gateName: getGateName(gate.id),
            previousStatus: getPreviousStatus(gate.id),
            newStatus: gate.status,
            timestamp: new Date(),
            adminInitiated: gate.adminControlled || false
          };

          setNotifications(prev => {
            // Only add if status actually changed
            const lastNotification = prev.find(n => n.gateId === gate.id);
            if (lastNotification && lastNotification.newStatus === gate.status) {
              return prev;
            }

            // Add new notification and limit to maxNotifications
            const updated = [notification, ...prev].slice(0, maxNotifications);
            return updated;
          });

          // Auto-hide after delay
          if (autoHideDelay > 0) {
            setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }, autoHideDelay);
          }
        });
      }
    };

    realTimeService.subscribe('gate_status', handleGateStatusUpdate);

    return () => {
      realTimeService.unsubscribe('gate_status', handleGateStatusUpdate);
    };
  }, [maxNotifications, autoHideDelay]);

  const getGateName = (gateId: string): string => {
    const gateNames: Record<string, string> = {
      'main-entrance': 'Main Entrance',
      'south-entrance': 'South Entrance',
      'exit-gate-a': 'Exit Gate A',
      'exit-gate-b': 'Exit Gate B',
      'emergency-exit-1': 'Emergency Exit 1',
      'emergency-exit-2': 'Emergency Exit 2'
    };
    return gateNames[gateId] || gateId;
  };

  const getPreviousStatus = (gateId: string): string => {
    // In a real app, this would track previous state
    return 'unknown';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <DoorOpen className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <DoorClosed className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusMessage = (notification: GateStatusChange): string => {
    const action = notification.newStatus === 'open' ? 'opened' : 'closed';
    const initiator = notification.adminInitiated ? 'Administrator' : 'System';
    return `${notification.gateName} has been ${action} by ${initiator}`;
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className={cn("fixed top-20 right-4 z-50 space-y-2 w-80", className)}>
      {notifications.map((notification) => (
        <Alert 
          key={notification.id}
          className={cn(
            "border shadow-lg bg-card animate-in slide-in-from-right-5",
            notification.newStatus === 'open' 
              ? "border-green-200 bg-green-50 dark:bg-green-950" 
              : "border-red-200 bg-red-50 dark:bg-red-950"
          )}
        >
          <div className="flex items-start gap-3">
            {getStatusIcon(notification.newStatus)}
            <div className="flex-1">
              <AlertDescription>
                <div className="font-medium text-sm">
                  {getStatusMessage(notification)}
                </div>
                {showTimestamp && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={notification.newStatus === 'open' ? 'default' as const : 'destructive' as const} 
                    className="text-xs"
                  >
                    {notification.newStatus.toUpperCase()}
                  </Badge>
                  {notification.adminInitiated && (
                    <Badge variant="outline" className="text-xs">
                      Admin Control
                    </Badge>
                  )}
                </div>
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissNotification(notification.id)}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default GateStatusNotification;