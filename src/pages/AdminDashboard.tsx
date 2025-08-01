import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { SettingsPanel } from '../components/admin/SettingsPanel';
import { DroneManager } from '../components/admin/DroneManager';
import { GateStatusNotification } from '../components/shared/GateStatusNotification';
import { LanguageSwitcher } from '../components/shared/LanguageSwitcher';
import { realTimeService } from '../services/realTimeService';
import { emergencyManagementService } from '../services/emergencyManagement';
import { settingsService } from '../services/settingsService';
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

// Mock data - will be replaced by dynamic zones in component

const alerts = [
  { id: 1, type: "critical", zone: "Exit Gate A", message: "Crowd density exceeding 90% capacity", time: "1 min ago", active: true },
  { id: 2, type: "warning", zone: "Main Entrance", message: "High foot traffic detected, monitor closely", time: "3 min ago", active: true },
  { id: 3, type: "info", zone: "Central Hall", message: "Event starting, expected crowd increase", time: "5 min ago", active: false },
  { id: 4, type: "emergency", zone: "Food Court", message: "Panic button activated - Location: Section B", time: "12 min ago", active: false },
];

const gates = [
  { id: "main-entrance", name: "Main Entrance", type: "entrance", status: "open", throughput: 45, location: "North Side" },
  { id: "south-entrance", name: "South Entrance", type: "entrance", status: "open", throughput: 32, location: "South Side" },
  { id: "exit-gate-a", name: "Exit Gate A", type: "exit", status: "open", throughput: 38, location: "East Side" },
  { id: "exit-gate-b", name: "Exit Gate B", type: "exit", status: "closed", throughput: 0, location: "West Side" },
  { id: "emergency-exit-1", name: "Emergency Exit 1", type: "emergency_exit", status: "closed", throughput: 0, location: "North Wing" },
  { id: "emergency-exit-2", name: "Emergency Exit 2", type: "emergency_exit", status: "closed", throughput: 0, location: "South Wing" },
];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  
  // Function to get venue zones from settings
  const getVenueZones = () => {
    const settingsData = settingsService.getSettings();
    const zoneSettings = settingsData.zoneSettings;
    
    // Create zones based on admin configuration
    return Object.entries(zoneSettings).map(([zoneId, config], index) => ({
      id: index + 1,
      name: t(`zones.${zoneId}`) || config.name,
      capacity: config.capacity,
      current: Math.floor(Math.random() * config.capacity), // Simulated current count
      status: settingsService.getZoneThresholdStatus(
        Math.floor(Math.random() * config.capacity), 
        config.capacity
      ),
      x: 20 + (index * 15), // Dynamic positioning
      y: 30 + (index * 10),
      cameras: config.emergencyExitsCount || 2,
      isActive: config.isActive,
      alertsEnabled: config.alertsEnabled
    })).filter(zone => zone.isActive);
  };

  const [venueZones, setVenueZones] = useState(() => getVenueZones());
  
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
    // Refresh zones based on latest configuration
    setVenueZones(getVenueZones());
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Update zones when settings change
  useEffect(() => {
    const interval = setInterval(() => {
      setVenueZones(getVenueZones());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [t]);

  const toggleGate = (gateId: string) => {
    // Send gate control command via real-time service
    const gate = gates.find(g => g.id === gateId);
    if (gate) {
      const newAction = gate.status === 'open' ? 'close' : 'open';
      realTimeService.sendGateControl(gateId, newAction);
      console.log(`Toggling gate ${gateId} to ${newAction}`);
    }
  };

  const broadcastAlert = () => {
    // Simulate broadcast
    alert('Emergency broadcast sent to all zones!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Gate Status Notifications */}
      <GateStatusNotification 
        maxNotifications={3}
        autoHideDelay={5000}
      />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('admin.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
              <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
              {t('common.refresh')}
            </Button>
            <Button
              onClick={() => setEmergencyMode(!emergencyMode)}
              variant={emergencyMode ? "destructive" : "outline"}
              size="sm"
            >
              <Power className="h-4 w-4 mr-2" />
              {emergencyMode ? t('emergency.exitMode', 'Exit Emergency') : t('emergency.mode', 'Emergency Mode')}
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
            {t('emergency.modeActive', 'EMERGENCY MODE ACTIVE - All systems in high alert status')}
          </AlertDescription>
        </Alert>
      )}

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
            <TabsTrigger value="interactive">{t('admin.crowdHeatmap')}</TabsTrigger>
            <TabsTrigger value="monitoring">{t('dashboard.zones')}</TabsTrigger>
            <TabsTrigger value="drones">{t('admin.drones', 'Drone Control')}</TabsTrigger>
            <TabsTrigger value="alerts">{t('admin.alerts')}</TabsTrigger>
            <TabsTrigger value="controls">{t('admin.controls', 'System Controls')}</TabsTrigger>
            <TabsTrigger value="settings">{t('admin.settings')}</TabsTrigger>
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
                <h3 className="text-lg font-semibold mb-4">{t('zones.status')}</h3>
                <div className="space-y-3">
                  {venueZones.filter(zone => zone.isActive).map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full", getDensityColor(zone.current, zone.capacity))} />
                        <span className="font-medium">{zone.name}</span>
                        {!zone.alertsEnabled && (
                          <Badge variant="outline" className="text-xs">
                            {t('alerts.disabled', 'Alerts Off')}
                          </Badge>
                        )}
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
                  {venueZones.filter(zone => zone.isActive).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      {t('zones.noActiveZones', 'No active zones configured')}
                    </div>
                  )}
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

          <TabsContent value="drones" className="space-y-6">
            <DroneManager />
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
                            {gate.location} • {gate.type.replace('_', ' ')} • Throughput: {gate.throughput} people/min
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={gate.type === 'emergency_exit' ? 'destructive' : 'outline'} className="text-xs">
                          {gate.type.replace('_', ' ')}
                        </Badge>
                        <Button
                          onClick={() => toggleGate(gate.id)}
                          variant={gate.status === 'open' ? 'destructive' : 'default'}
                          size="sm"
                        >
                          {gate.status === 'open' ? 'Close' : 'Open'}
                        </Button>
                      </div>
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
                  <Button 
                    onClick={() => emergencyManagementService.activateEmergencyGateProtocol('critical')}
                    className="w-full" 
                    variant="destructive"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Gate Protocol
                  </Button>
                  <Button 
                    onClick={() => emergencyManagementService.deactivateEmergencyGateProtocol()}
                    className="w-full" 
                    variant="outline"
                  >
                    <Unlock className="h-4 w-4 mr-2" />
                    Restore Normal Gates
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

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;