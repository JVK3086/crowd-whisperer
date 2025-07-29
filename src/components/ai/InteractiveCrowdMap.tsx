import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  AlertTriangle, 
  MapPin, 
  Activity,
  Zap,
  Camera,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { realTimeService } from '../../services/realTimeService';
import { emergencyManagementService } from '../../services/emergencyManagement';
import { cn } from '@/lib/utils';

interface Zone {
  id: string;
  name: string;
  capacity: number;
  current: number;
  status: 'low' | 'medium' | 'high' | 'critical';
  x: number;
  y: number;
  cameras: number;
  emergencyExits: number;
  lastUpdated: Date;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface GateStatus {
  id: string;
  name: string;
  status: 'open' | 'closed' | 'maintenance';
  throughput: number;
  location: { x: number; y: number };
}

export const InteractiveCrowdMap = () => {
  const [zones, setZones] = useState<Zone[]>([
    { id: 'entrance-main', name: 'Main Entrance', capacity: 500, current: 425, status: 'high', x: 20, y: 30, cameras: 3, emergencyExits: 2, lastUpdated: new Date(), trend: 'increasing' },
    { id: 'food-court', name: 'Food Court', capacity: 300, current: 135, status: 'medium', x: 60, y: 40, cameras: 2, emergencyExits: 1, lastUpdated: new Date(), trend: 'stable' },
    { id: 'exit-gate-a', name: 'Exit Gate A', capacity: 200, current: 184, status: 'critical', x: 80, y: 70, cameras: 4, emergencyExits: 3, lastUpdated: new Date(), trend: 'increasing' },
    { id: 'west-wing', name: 'West Wing', capacity: 400, current: 98, status: 'low', x: 15, y: 60, cameras: 2, emergencyExits: 1, lastUpdated: new Date(), trend: 'decreasing' },
    { id: 'central-hall', name: 'Central Hall', capacity: 600, current: 420, status: 'high', x: 50, y: 55, cameras: 5, emergencyExits: 4, lastUpdated: new Date(), trend: 'stable' },
    { id: 'north-corridor', name: 'North Corridor', capacity: 250, current: 45, status: 'low', x: 40, y: 20, cameras: 2, emergencyExits: 2, lastUpdated: new Date(), trend: 'decreasing' },
  ]);

  const [gates, setGates] = useState<GateStatus[]>([
    { id: 'gate-a', name: 'Gate A', status: 'open', throughput: 45, location: { x: 10, y: 35 } },
    { id: 'gate-b', name: 'Gate B', status: 'open', throughput: 32, location: { x: 85, y: 75 } },
    { id: 'gate-c', name: 'Gate C', status: 'closed', throughput: 0, location: { x: 60, y: 10 } },
  ]);

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Real-time data subscription
  useEffect(() => {
    const handleCrowdUpdate = (event: { data: { zones?: Array<{ id: string; currentDensity: number; riskLevel?: string }> } }) => {
      if (event.data.zones) {
        setZones(prevZones => 
          prevZones.map(zone => {
            const update = event.data.zones!.find((z) => z.id === zone.id);
            if (update) {
              const utilizationPercentage = (update.currentDensity / zone.capacity) * 100;
              let status: Zone['status'];
              if (utilizationPercentage < 40) status = 'low';
              else if (utilizationPercentage < 65) status = 'medium';
              else if (utilizationPercentage < 85) status = 'high';
              else status = 'critical';

              return {
                ...zone,
                current: update.currentDensity,
                status,
                trend: update.trend || zone.trend,
                lastUpdated: new Date()
              };
            }
            return zone;
          })
        );
        setLastUpdate(new Date());
      }
    };

    const handleGateStatus = (event: { data: { gates?: Array<{ id: string; status: string; throughput: number }> } }) => {
      if (event.data.gates) {
        setGates(prevGates =>
          prevGates.map(gate => {
            const update = event.data.gates!.find((g) => g.id === gate.id);
            return update ? { ...gate, ...update } : gate;
          })
        );
      }
    };

    realTimeService.subscribe('crowd_update', handleCrowdUpdate);
    realTimeService.subscribe('gate_status', handleGateStatus);

    // Check connection status
    const checkConnection = () => {
      setIsConnected(realTimeService.getConnectionStatus());
    };
    checkConnection();
    const connectionInterval = setInterval(checkConnection, 5000);

    return () => {
      realTimeService.unsubscribe('crowd_update', handleCrowdUpdate);
      realTimeService.unsubscribe('gate_status', handleGateStatus);
      clearInterval(connectionInterval);
    };
  }, []);

  const getZoneColor = (status: Zone['status']) => {
    switch (status) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getZoneTextColor = (status: Zone['status']) => {
    switch (status) {
      case 'low': return 'text-green-700';
      case 'medium': return 'text-yellow-700';
      case 'high': return 'text-orange-700';
      case 'critical': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  const getTrendIcon = (trend: Zone['trend']) => {
    switch (trend) {
      case 'increasing': return '↗️';
      case 'decreasing': return '↘️';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const handleGateControl = async (gateId: string, action: 'open' | 'close') => {
    realTimeService.sendGateControl(gateId, action);
    
    // Optimistically update UI
    setGates(prev => 
      prev.map(gate => 
        gate.id === gateId 
          ? { ...gate, status: action === 'open' ? 'open' : 'closed' }
          : gate
      )
    );
  };

  const handleEmergencyEvacuation = async (zoneId: string) => {
    try {
      await emergencyManagementService.activateEvacuationPlan('evac-plan-1', `Manual trigger for zone: ${zoneId}`);
      alert('Evacuation plan activated successfully');
    } catch (error) {
      alert('Failed to activate evacuation plan');
    }
  };

  const getUtilizationPercentage = (zone: Zone) => {
    return Math.round((zone.current / zone.capacity) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Interactive Crowd Map</h3>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500" : "bg-red-500"
          )} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
          <span className="text-xs text-muted-foreground">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Interactive Map */}
        <Card className="lg:col-span-2 p-6">
          <div className="relative bg-gray-50 rounded-lg h-96 overflow-hidden">
            {/* Zone markers */}
            {zones.map((zone) => (
              <div
                key={zone.id}
                className={cn(
                  "absolute w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110",
                  getZoneColor(zone.status),
                  selectedZone?.id === zone.id && "ring-4 ring-blue-300"
                )}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                onClick={() => setSelectedZone(zone)}
              >
                <Users className="w-4 h-4 text-white" />
                {zone.status === 'critical' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                )}
              </div>
            ))}

            {/* Gate markers */}
            {gates.map((gate) => (
              <div
                key={gate.id}
                className={cn(
                  "absolute w-6 h-6 rounded-sm flex items-center justify-center",
                  gate.status === 'open' ? "bg-green-600" : 
                  gate.status === 'closed' ? "bg-red-600" : "bg-yellow-600"
                )}
                style={{ left: `${gate.location.x}%`, top: `${gate.location.y}%` }}
                title={`${gate.name} - ${gate.status}`}
              >
                {gate.status === 'open' ? 
                  <Unlock className="w-3 h-3 text-white" /> : 
                  <Lock className="w-3 h-3 text-white" />
                }
              </div>
            ))}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg">
              <div className="text-xs font-semibold mb-2">Zone Status</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Low (&lt;40%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span>Medium (40-65%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full" />
                  <span>High (65-85%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span>Critical (&gt;85%)</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Zone Details & Controls */}
        <Card className="p-6">
          {selectedZone ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{selectedZone.name}</h4>
                <Badge className={getZoneTextColor(selectedZone.status)}>
                  {selectedZone.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Occupancy</span>
                    <span>{selectedZone.current} / {selectedZone.capacity}</span>
                  </div>
                  <Progress 
                    value={getUtilizationPercentage(selectedZone)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {getUtilizationPercentage(selectedZone)}% capacity
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Trend</div>
                    <div className="font-medium">
                      {getTrendIcon(selectedZone.trend)} {selectedZone.trend}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Cameras</div>
                    <div className="font-medium flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {selectedZone.cameras}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Emergency Controls</div>
                  <div className="space-y-2">
                    {selectedZone.status === 'critical' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => handleEmergencyEvacuation(selectedZone.id)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Trigger Evacuation
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        realTimeService.sendBroadcastMessage(
                          `High crowd density detected in ${selectedZone.name}. Please use alternate routes.`,
                          [selectedZone.id]
                        );
                      }}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Send Alert
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Last updated: {selectedZone.lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <p>Click on a zone to view details and controls</p>
            </div>
          )}
        </Card>
      </div>

      {/* Gate Controls */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Gate Controls</h4>
        <div className="grid md:grid-cols-3 gap-4">
          {gates.map((gate) => (
            <div key={gate.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{gate.name}</div>
                <div className="text-sm text-muted-foreground">
                  Throughput: {gate.throughput}/min
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={gate.status === 'open' ? 'default' : 'secondary'}
                  className={cn(
                    gate.status === 'open' && 'bg-green-100 text-green-800',
                    gate.status === 'closed' && 'bg-red-100 text-red-800',
                    gate.status === 'maintenance' && 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {gate.status}
                </Badge>
                {gate.status !== 'maintenance' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGateControl(gate.id, gate.status === 'open' ? 'close' : 'open')}
                  >
                    {gate.status === 'open' ? 'Close' : 'Open'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};