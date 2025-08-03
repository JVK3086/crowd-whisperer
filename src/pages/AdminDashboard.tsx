import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIAnalysis, useAlertManager } from '../hooks/useAIAnalysis';
import { useVenueConfig } from '../hooks/useVenueConfig';
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
import { useFloorPlan } from '../hooks/useFloorPlan';
import { Link } from 'react-router-dom';
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
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamic alerts based on floor plan zones and gates
const generateDynamicAlerts = (floorPlan: any, venueZones: any[]) => {
  const alerts = [];
  
  // Zone-based alerts
  venueZones.forEach(zone => {
    const density = (zone.current / zone.capacity) * 100;
    if (density >= 90) {
      alerts.push({
        id: `zone-${zone.id}`,
        type: "critical",
        zone: zone.name,
        message: `Crowd density exceeding 90% capacity (${Math.round(density)}%)`,
        time: "1 min ago",
        active: true
      });
    } else if (density >= 75) {
      alerts.push({
        id: `zone-${zone.id}`,
        type: "warning", 
        zone: zone.name,
        message: `High foot traffic detected, monitor closely (${Math.round(density)}%)`,
        time: "3 min ago",
        active: true
      });
    }
  });

  // Gate-based alerts from floor plan
  if (floorPlan?.gates) {
    floorPlan.gates.forEach(gate => {
      if (gate.type === 'emergency_exit' && !gate.isActive) {
        alerts.push({
          id: `gate-${gate.id}`,
          type: "warning",
          zone: gate.name,
          message: "Emergency exit is currently inactive",
          time: "5 min ago",
          active: true
        });
      }
    });
  }

  return alerts;
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const { floorPlan } = useFloorPlan();
  const { config: venueConfig } = useVenueConfig();
  
  // Function to get venue zones from settings and venue config
  const getVenueZones = () => {
    const settingsData = settingsService.getSettings();
    
    // If venue is configured, use its zones
    if (venueConfig?.zones) {
      return venueConfig.zones.map((zone, index) => ({
        id: index + 1,
        name: zone.name,
        capacity: zone.capacity,
        current: Math.floor(Math.random() * zone.capacity), // Simulated current count
        status: settingsService.getZoneThresholdStatus(
          Math.floor(Math.random() * zone.capacity), 
          zone.capacity
        ),
        x: 20 + (index * 15), // Dynamic positioning
        y: 30 + (index * 10),
        cameras: 2,
        isActive: true,
        alertsEnabled: true,
        type: zone.type
      }));
    }
    
    // Fallback to settings-based zones
    const zoneSettings = settingsData.zoneSettings;
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
  
  // Generate dynamic alerts based on floor plan and zones
  const alerts = generateDynamicAlerts(floorPlan, venueZones);
  
  // Get gates from floor plan or use empty array
  const gates = floorPlan?.gates || [];
  
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
    // Send gate control command via real-time service and update floor plan
    const gate = gates.find(g => g.id === gateId);
    if (gate) {
      const newAction = gate.isActive ? 'close' : 'open';
      
      // Update the gate status in floor plan
      const updatedGates = gates.map(g => 
        g.id === gateId ? { ...g, isActive: !g.isActive } : g
      );
      
      if (floorPlan) {
        import('../hooks/useFloorPlan').then(({ floorPlanService }) => {
          floorPlanService.updateGates(updatedGates);
        });
      }
      
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
              <h1 className="text-2xl font-bold">
                {venueConfig?.name ? `${venueConfig.name} Control Center` : t('admin.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {venueConfig?.description || t('admin.subtitle')}
              </p>
              {venueConfig && (
                <Badge variant="outline" className="mt-1">
                  {venueConfig.type.replace('_', ' ')} • {venueConfig.category}
                </Badge>
              )}
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
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/help">
                <BookOpen className="h-4 w-4 mr-2" />
                User Guide
              </Link>
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
              {/* Gate Controls - From Floor Plan */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Gate Management</h3>
                {!floorPlan ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>No floor plan uploaded</p>
                    <p className="text-sm">Upload a floor plan in the Interactive Map tab to manage gates</p>
                  </div>
                ) : gates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>No gates configured</p>
                    <p className="text-sm">Add gates to your floor plan in the Interactive Map tab</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {gates.map((gate) => (
                      <div key={gate.id} className="flex items-center justify-between p-3 rounded border">
                        <div className="flex items-center gap-3">
                          {gate.isActive ? (
                            <Unlock className="h-4 w-4 text-green-500" />
                          ) : (
                            <Lock className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">{gate.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Position: ({gate.x}, {gate.y}) • {gate.type.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={gate.type === 'emergency_exit' ? 'destructive' : 'outline'} className="text-xs">
                            {gate.type.replace('_', ' ')}
                          </Badge>
                          <Button
                            onClick={() => toggleGate(gate.id)}
                            variant={gate.isActive ? 'destructive' : 'default'}
                            size="sm"
                          >
                            {gate.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Emergency Controls - Based on Floor Plan Routes */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Emergency Controls</h3>
                <div className="space-y-4">
                  <Button
                    onClick={broadcastAlert}
                    variant="destructive"
                    className="w-full"
                  >
                    <Megaphone className="h-4 w-4 mr-2" />
                    Broadcast Emergency Alert
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (floorPlan?.emergencyRoutes) {
                          console.log('Activating emergency routes:', floorPlan.emergencyRoutes);
                          // Activate all emergency routes
                          const updatedRoutes = floorPlan.emergencyRoutes.map(route => ({
                            ...route,
                            isActive: true
                          }));
                          import('../hooks/useFloorPlan').then(({ floorPlanService }) => {
                            floorPlanService.updateEmergencyRoutes(updatedRoutes);
                          });
                        }
                      }}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Activate Evacuation
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Bell className="h-4 w-4 mr-2" />
                      Sound Alarm
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground p-3 rounded border bg-muted/30">
                    <div className="font-semibold mb-2">Emergency Protocol Status:</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Emergency Routes:</span>
                        <Badge variant="outline">
                          {floorPlan?.emergencyRoutes?.length || 0} Configured
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Emergency Exits:</span>
                        <Badge variant="outline">
                          {gates.filter(g => g.type === 'emergency_exit').length} Configured
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Gates:</span>
                        <Badge variant="outline">
                          {gates.filter(g => g.isActive).length} Active
                        </Badge>
                      </div>
                    </div>
                  </div>
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