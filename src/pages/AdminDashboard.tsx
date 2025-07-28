import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIAnalysis, useAlertManager } from '../hooks/useAIAnalysis';
import { CrowdHeatmap } from '../components/ai/CrowdHeatmap';
import { PredictiveAlerts } from '../components/ai/PredictiveAlerts';
import { AIInsights } from '../components/ai/AIInsights';
import { InteractiveCrowdMap } from '../components/ai/InteractiveCrowdMap';
import { realTimeService } from '../services/realTimeService';
import { emergencyManagementService } from '../services/emergencyManagement';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Camera, 
  TrendingUp,
  MapPin,
  Bell,
  Settings,
  Power,
  Activity,
  BarChart3,
  Eye,
  Lock,
  Unlock,
  Megaphone,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for real-time monitoring
const venueZones = [
  { id: 1, name: "Main Entrance", capacity: 500, current: 425, status: "high", x: 20, y: 30, cameras: 3 },
  { id: 2, name: "Food Court", capacity: 300, current: 135, status: "medium", x: 60, y: 40, cameras: 2 },
  { id: 3, name: "Exit Gate A", capacity: 200, current: 184, status: "critical", x: 80, y: 70, cameras: 4 },
  { id: 4, name: "West Wing", capacity: 400, current: 98, status: "low", x: 15, y: 60, cameras: 2 },
  { id: 5, name: "Central Hall", capacity: 600, current: 420, status: "high", x: 50, y: 55, cameras: 5 },
  { id: 6, name: "North Corridor", capacity: 250, current: 45, status: "low", x: 40, y: 20, cameras: 2 },
];

const alerts = [
  { id: 1, type: "critical", zone: "Exit Gate A", message: "Crowd density exceeding 90% capacity", time: "1 min ago", active: true },
  { id: 2, type: "warning", zone: "Main Entrance", message: "High foot traffic detected, monitor closely", time: "3 min ago", active: true },
  { id: 3, type: "info", zone: "Central Hall", message: "Event starting, expected crowd increase", time: "5 min ago", active: false },
  { id: 4, type: "emergency", zone: "Food Court", message: "Panic button activated - Location: Section B", time: "12 min ago", active: false },
];

const gates = [
  { id: 1, name: "Gate A", status: "open", throughput: 45 },
  { id: 2, name: "Gate B", status: "closed", throughput: 0 },
  { id: 3, name: "Gate C", status: "open", throughput: 32 },
  { id: 4, name: "Emergency Exit 1", status: "closed", throughput: 0 },
];

const AdminDashboard = () => {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  
  // AI Analysis hooks
  const { data: aiAnalysis, loading: aiLoading, refresh: refreshAI } = useAIAnalysis();
  const { 
    getActiveAlerts, 
    acknowledgeAlert, 
    dismissAlert, 
    getCriticalAlerts 
  } = useAlertManager();

  const getDensityLevel = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    return Math.round(percentage);
  };

  const getDensityColor = (current: number, capacity: number) => {
    const percentage = getDensityLevel(current, capacity);
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusVariant = (type: string) => {
    switch (type) {
      case 'critical': case 'emergency': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'default';
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const toggleGate = (gateId: number) => {
    // Simulate gate control
    console.log(`Toggling gate ${gateId}`);
  };

  const broadcastAlert = () => {
    // Simulate broadcast
    alert('Emergency broadcast sent to all zones!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">SCFMS Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Smart Crowd Flow Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button
              onClick={() => setEmergencyMode(!emergencyMode)}
              variant={emergencyMode ? "destructive" : "outline"}
              size="sm"
            >
              <Power className="h-4 w-4 mr-2" />
              {emergencyMode ? "Exit Emergency" : "Emergency Mode"}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {emergencyMode && (
        <Alert className="mx-6 mt-4 border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-semibold text-destructive">
            EMERGENCY MODE ACTIVE - All systems in high alert status
          </AlertDescription>
        </Alert>
      )}

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="interactive">Interactive Map</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="alerts">Alert Management</TabsTrigger>
            <TabsTrigger value="controls">System Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* AI Analysis Section */}
            {aiAnalysis && (
              <AIInsights 
                analysis={aiAnalysis} 
                loading={aiLoading}
                onRefresh={refreshAI}
              />
            )}

            {/* Critical Alerts */}
            {aiAnalysis && getCriticalAlerts().length > 0 && (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{getCriticalAlerts().length} critical alert(s) require immediate attention!</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* AI-Powered Live Crowd Heatmap */}
            {aiAnalysis && (
              <CrowdHeatmap 
                crowdData={aiAnalysis.crowdDensity}
                selectedZone={selectedZone?.toString()}
                onZoneSelect={(zoneId) => setSelectedZone(parseInt(zoneId))}
              />
            )}

            {/* Predictive Alerts */}
            {aiAnalysis && (
              <PredictiveAlerts 
                alerts={aiAnalysis.predictiveAlerts}
                onAcknowledge={acknowledgeAlert}
                onDismiss={dismissAlert}
              />
            )}
          </TabsContent>

          <TabsContent value="interactive" className="space-y-6">
            <InteractiveCrowdMap />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Zone Status */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Zone Status</h3>
                <div className="space-y-3">
                  {venueZones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", getDensityColor(zone.current, zone.capacity))} />
                        <span className="font-medium">{zone.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{zone.current}/{zone.capacity}</span>
                        <Badge variant={zone.status === 'critical' ? 'destructive' : zone.status === 'high' ? 'secondary' : 'outline'}>
                          {getDensityLevel(zone.current, zone.capacity)}%
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* CCTV Feeds */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">CCTV Monitoring</h3>
                <div className="grid grid-cols-2 gap-3">
                  {venueZones.slice(0, 4).map((zone) => (
                    <div key={zone.id} className="aspect-video bg-muted rounded border flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <div className="text-sm font-medium">{zone.name}</div>
                        <div className="text-xs text-muted-foreground">Camera {zone.id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Alerts */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Active Alerts</h3>
                <div className="space-y-3">
                  {alerts.filter(alert => alert.active).map((alert) => (
                    <Alert key={alert.id} className={cn(alert.type === 'critical' && 'border-destructive')}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">{alert.zone}</div>
                            <div className="text-sm">{alert.message}</div>
                            <div className="text-xs text-muted-foreground mt-1">{alert.time}</div>
                          </div>
                          <Badge variant={getStatusVariant(alert.type)}>
                            {alert.type}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </Card>

              {/* Alert History */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={cn(
                      "p-3 rounded border",
                      !alert.active && "opacity-60"
                    )}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusVariant(alert.type)} className="text-xs">
                            {alert.type}
                          </Badge>
                          <span className="text-sm font-medium">{alert.zone}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                      <div className="text-sm mt-1">{alert.message}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="controls" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gate Controls */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Gate Management</h3>
                <div className="space-y-3">
                  {gates.map((gate) => (
                    <div key={gate.id} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        {gate.status === 'open' ? (
                          <Unlock className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{gate.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Throughput: {gate.throughput} people/min
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => toggleGate(gate.id)}
                        variant={gate.status === 'open' ? 'destructive' : 'default'}
                        size="sm"
                      >
                        {gate.status === 'open' ? 'Close' : 'Open'}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Emergency Controls */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Emergency Controls</h3>
                <div className="space-y-4">
                  <Button onClick={broadcastAlert} className="w-full" variant="destructive">
                    <Megaphone className="h-4 w-4 mr-2" />
                    Emergency Broadcast
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Send Zone Alert
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Activate Evacuation Routes
                  </Button>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;