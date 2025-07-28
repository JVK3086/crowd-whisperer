import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { realTimeService } from '../../services/realTimeService';
import { 
  DoorOpen, 
  DoorClosed, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Navigation,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GateStatus {
  id: string;
  name: string;
  type: 'entrance' | 'exit' | 'emergency_exit';
  status: 'open' | 'closed' | 'maintenance' | 'restricted';
  throughput: number;
  lastUpdated: Date;
  location?: string;
  capacity?: number;
  adminControlled: boolean;
}

interface EntranceExitStatusProps {
  refreshInterval?: number;
  showThroughput?: boolean;
  showEmergencyExits?: boolean;
}

export const EntranceExitStatus = ({ 
  refreshInterval = 5000,
  showThroughput = true,
  showEmergencyExits = true 
}: EntranceExitStatusProps) => {
  const [gates, setGates] = useState<GateStatus[]>([
    {
      id: 'main-entrance',
      name: 'Main Entrance',
      type: 'entrance',
      status: 'open',
      throughput: 45,
      lastUpdated: new Date(),
      location: 'North Side',
      capacity: 100,
      adminControlled: true
    },
    {
      id: 'south-entrance',
      name: 'South Entrance',
      type: 'entrance',
      status: 'open',
      throughput: 32,
      lastUpdated: new Date(),
      location: 'South Side',
      capacity: 80,
      adminControlled: true
    },
    {
      id: 'exit-gate-a',
      name: 'Exit Gate A',
      type: 'exit',
      status: 'open',
      throughput: 38,
      lastUpdated: new Date(),
      location: 'East Side',
      capacity: 90,
      adminControlled: true
    },
    {
      id: 'exit-gate-b',
      name: 'Exit Gate B',
      type: 'exit',
      status: 'closed',
      throughput: 0,
      lastUpdated: new Date(),
      location: 'West Side',
      capacity: 75,
      adminControlled: true
    },
    {
      id: 'emergency-exit-1',
      name: 'Emergency Exit 1',
      type: 'emergency_exit',
      status: 'closed',
      throughput: 0,
      lastUpdated: new Date(),
      location: 'North Wing',
      capacity: 60,
      adminControlled: true
    },
    {
      id: 'emergency-exit-2',
      name: 'Emergency Exit 2',
      type: 'emergency_exit',
      status: 'closed',
      throughput: 0,
      lastUpdated: new Date(),
      location: 'South Wing',
      capacity: 60,
      adminControlled: true
    }
  ]);

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Subscribe to real-time gate status updates
    const handleGateStatusUpdate = (event: any) => {
      if (event.data && event.data.gates) {
        setGates(prevGates => {
          const updatedGates = [...prevGates];
          event.data.gates.forEach((serverGate: any) => {
            const gateIndex = updatedGates.findIndex(g => g.id === serverGate.id);
            if (gateIndex !== -1) {
              updatedGates[gateIndex] = {
                ...updatedGates[gateIndex],
                status: serverGate.status,
                throughput: serverGate.throughput || 0,
                lastUpdated: new Date()
              };
            }
          });
          return updatedGates;
        });
        setLastUpdate(new Date());
      }
    };

    // Subscribe to emergency alerts for gate protocol changes
    const handleEmergencyAlert = (event: any) => {
      if (event.data && event.data.type === 'emergency_gate_protocol') {
        // Update gate statuses based on emergency protocol
        if (event.data.openExits) {
          setGates(prevGates => {
            const updatedGates = [...prevGates];
            event.data.openExits.forEach((exitId: string) => {
              const gateIndex = updatedGates.findIndex(g => g.id === exitId);
              if (gateIndex !== -1) {
                updatedGates[gateIndex] = {
                  ...updatedGates[gateIndex],
                  status: 'open',
                  lastUpdated: new Date()
                };
              }
            });
            return updatedGates;
          });
        }
        setLastUpdate(new Date());
      }
    };

    const handleConnectionStatus = () => {
      setIsConnected(realTimeService.getConnectionStatus());
    };

    // Subscribe to real-time updates
    realTimeService.subscribe('gate_status', handleGateStatusUpdate);
    realTimeService.subscribe('emergency_alert', handleEmergencyAlert);
    
    // Check connection status periodically
    const connectionInterval = setInterval(handleConnectionStatus, 2000);
    handleConnectionStatus(); // Initial check

    return () => {
      realTimeService.unsubscribe('gate_status', handleGateStatusUpdate);
      realTimeService.unsubscribe('emergency_alert', handleEmergencyAlert);
      clearInterval(connectionInterval);
    };
  }, []);

  const getStatusIcon = (status: GateStatus['status']) => {
    switch (status) {
      case 'open':
        return <DoorOpen className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <DoorClosed className="w-4 h-4 text-red-500" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'restricted':
        return <XCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: GateStatus['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-orange-500';
      case 'restricted':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeVariant = (status: GateStatus['status']) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'closed':
        return 'destructive';
      case 'maintenance':
        return 'secondary';
      case 'restricted':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: GateStatus['type']) => {
    switch (type) {
      case 'entrance':
        return <Navigation className="w-4 h-4 text-blue-500" />;
      case 'exit':
        return <MapPin className="w-4 h-4 text-purple-500" />;
      case 'emergency_exit':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const entrances = gates.filter(gate => gate.type === 'entrance');
  const exits = gates.filter(gate => gate.type === 'exit');
  const emergencyExits = gates.filter(gate => gate.type === 'emergency_exit');

  const openEntrances = entrances.filter(gate => gate.status === 'open').length;
  const openExits = exits.filter(gate => gate.status === 'open').length;
  const openEmergencyExits = emergencyExits.filter(gate => gate.status === 'open').length;

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-400" : "bg-red-400"
          )} />
          <span className="text-muted-foreground">
            {isConnected ? 'Live Updates' : 'Offline'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          Updated {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Entrances</span>
            </div>
            <Badge variant={openEntrances > 0 ? 'default' : 'destructive'} className="text-xs">
              {openEntrances}/{entrances.length} Open
            </Badge>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Exits</span>
            </div>
            <Badge variant={openExits > 0 ? 'default' : 'destructive'} className="text-xs">
              {openExits}/{exits.length} Open
            </Badge>
          </div>
        </Card>
      </div>

      {/* Emergency Exits Alert */}
      {showEmergencyExits && openEmergencyExits > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Emergency Protocol Active:</strong> {openEmergencyExits} emergency exit(s) are currently open.
          </AlertDescription>
        </Alert>
      )}

      {/* Entrance Status */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-500" />
          Entrance Status
        </h3>
        <div className="space-y-3">
          {entrances.map((gate) => (
            <div key={gate.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                {getStatusIcon(gate.status)}
                <div>
                  <div className="font-medium text-sm">{gate.name}</div>
                  <div className="text-xs text-muted-foreground">{gate.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showThroughput && gate.status === 'open' && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {gate.throughput}/min
                  </div>
                )}
                <Badge variant={getStatusBadgeVariant(gate.status)} className="text-xs capitalize">
                  {gate.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Exit Status */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-500" />
          Exit Status
        </h3>
        <div className="space-y-3">
          {exits.map((gate) => (
            <div key={gate.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                {getStatusIcon(gate.status)}
                <div>
                  <div className="font-medium text-sm">{gate.name}</div>
                  <div className="text-xs text-muted-foreground">{gate.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showThroughput && gate.status === 'open' && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {gate.throughput}/min
                  </div>
                )}
                <Badge variant={getStatusBadgeVariant(gate.status)} className="text-xs capitalize">
                  {gate.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency Exits */}
      {showEmergencyExits && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Emergency Exits
          </h3>
          <div className="space-y-3">
            {emergencyExits.map((gate) => (
              <div key={gate.id} className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                gate.status === 'open' ? "bg-red-50 border-red-200" : "bg-muted/30"
              )}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(gate.status)}
                  <div>
                    <div className="font-medium text-sm">{gate.name}</div>
                    <div className="text-xs text-muted-foreground">{gate.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {gate.adminControlled && (
                    <Badge variant="outline" className="text-xs">
                      Admin Controlled
                    </Badge>
                  )}
                  <Badge variant={getStatusBadgeVariant(gate.status)} className="text-xs capitalize">
                    {gate.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Status Legend */}
      <Card className="p-3">
        <div className="text-xs text-muted-foreground space-y-2">
          <div className="font-medium">Status Legend:</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-3 h-3 text-green-500" />
              <span>Open & Active</span>
            </div>
            <div className="flex items-center gap-2">
              <DoorClosed className="w-3 h-3 text-red-500" />
              <span>Closed</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-orange-500" />
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-3 h-3 text-yellow-500" />
              <span>Restricted</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EntranceExitStatus;