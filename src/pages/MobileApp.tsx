import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { useMobileSettings } from '../hooks/useSettings';
import { PanicButton } from '../components/mobile/PanicButton';
import { SafeNavigation } from '../components/mobile/SafeNavigation';
import { EntranceExitStatus } from '../components/mobile/EntranceExitStatus';
import { GateStatusNotification } from '../components/shared/GateStatusNotification';
import { realTimeService } from '../services/realTimeService';
import { 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Shield, 
  Users, 
  Route,
  Bell,
  Languages,
  Wifi,
  WifiOff,
  Map,
  Clock,
  Activity,
  Phone,
  Download,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for crowd density zones
const crowdZones = [
  { id: 1, name: "Main Entrance", density: 85, status: "high", x: 20, y: 30 },
  { id: 2, name: "Food Court", density: 45, status: "medium", x: 60, y: 40 },
  { id: 3, name: "Exit Gate A", density: 92, status: "critical", x: 80, y: 70 },
  { id: 4, name: "West Wing", density: 25, status: "low", x: 15, y: 60 },
  { id: 5, name: "Central Hall", density: 70, status: "high", x: 50, y: 55 },
];

const mockNotifications = [
  { id: 1, type: "warning", message: "High crowd density at Main Entrance. Use Exit Gate B instead.", time: "2 min ago" },
  { id: 2, type: "info", message: "New safe route available to Food Court via West Wing.", time: "5 min ago" },
];

const MobileApp = () => {
  const [currentLocation, setCurrentLocation] = useState({ x: 25, y: 35 });
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [notifications, setNotifications] = useState(mockNotifications);
  
  // Get mobile settings from admin configuration
  const {
    mobileSettings,
    emergencySettings,
    alertThresholds,
    activeAnnouncements,
    loading: settingsLoading,
    error: settingsError,
    isFeatureEnabled,
    mapRefreshInterval,
    defaultLanguage,
    supportedLanguages,
    isPanicButtonEnabled,
    isLocationTrackingEnabled
  } = useMobileSettings();

  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage || 'en');
  const [isOfflineMode, setIsOfflineMode] = useState(!mobileSettings?.offlineModeEnabled);
  
  // AI Analysis for real-time crowd data - use admin-configured refresh interval
  const { data: aiAnalysis, loading: aiLoading } = useAIAnalysis(mapRefreshInterval || 15000);

  // Sync language with admin settings
  useEffect(() => {
    if (defaultLanguage && selectedLanguage !== defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [defaultLanguage, selectedLanguage]);

  // Real-time connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = realTimeService.getConnectionStatus();
      setIsOnline(connected);
      
      // If offline and offline mode is disabled by admin, show warning
      if (!connected && !mobileSettings?.offlineModeEnabled) {
        setIsOfflineMode(true);
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    
    return () => clearInterval(interval);
  }, [mobileSettings?.offlineModeEnabled]);

  const getDensityColor = (density: number) => {
    if (density >= 80) return 'bg-destructive';
    if (density >= 60) return 'bg-yellow-500';
    if (density >= 40) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      default: return 'default';
    }
  };

  // Show loading state while settings are loading
  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading system configuration...</p>
        </div>
      </div>
    );
  }

  // Show error if settings failed to load
  if (settingsError) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Alert className="border-destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            Failed to load system settings: {settingsError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Gate Status Notifications */}
      <GateStatusNotification 
        maxNotifications={2}
        autoHideDelay={6000}
        className="top-16"
      />

      {/* Admin Announcements */}
      {activeAnnouncements.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          {activeAnnouncements.slice(0, 1).map(announcement => (
            <Alert key={announcement.id} className="border-blue-200 bg-transparent p-2">
              <Bell className="w-4 h-4" />
              <AlertDescription className="text-blue-800">
                <strong>{announcement.title}:</strong> {announcement.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">SCFMS Mobile</h1>
            {isOfflineMode && (
              <Badge variant="secondary" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            {!isFeatureEnabled('realTimeUpdatesEnabled') && (
              <Badge variant="destructive" className="text-xs">
                Updates Disabled
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full", 
              isOnline ? "bg-green-400" : "bg-red-400"
            )} />
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            {supportedLanguages && supportedLanguages.length > 1 && (
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-background border rounded px-2 py-1 text-xs"
              >
                {supportedLanguages.includes('en') && <option value="en">EN</option>}
                {supportedLanguages.includes('hi') && <option value="hi">हि</option>}
                {supportedLanguages.includes('te') && <option value="te">తె</option>}
                {supportedLanguages.includes('ta') && <option value="ta">த</option>}
              </select>
            )}
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
              {(notifications.length + activeAnnouncements.length) > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length + activeAnnouncements.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="map" className="flex items-center gap-1">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
            <TabsTrigger value="gates" className="flex items-center gap-1">
              <Navigation className="w-4 h-4" />
              <span className="hidden sm:inline">Gates</span>
            </TabsTrigger>
            <TabsTrigger value="navigate" className="flex items-center gap-1">
              <Route className="w-4 h-4" />
              <span className="hidden sm:inline">Navigate</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Emergency</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-6 space-y-4">
            {/* Quick Gate Status */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Gate Status</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>2 Entrances Open</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>1 Exit Open</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setActiveTab('gates')}
                    className="text-xs h-6 px-2"
                  >
                    View All
                  </Button>
                </div>
              </div>
            </Card>

            <LiveCrowdMap 
              crowdZones={crowdZones}
              currentLocation={currentLocation}
              aiAnalysis={aiAnalysis}
              aiLoading={aiLoading}
              getDensityColor={getDensityColor}
              getStatusColor={getStatusColor}
              alertThresholds={alertThresholds}
              isFeatureEnabled={isFeatureEnabled}
            />
          </TabsContent>

          <TabsContent value="gates" className="mt-6">
            <EntranceExitStatus 
              refreshInterval={mapRefreshInterval}
              showThroughput={isFeatureEnabled('realTimeUpdatesEnabled')}
              showEmergencyExits={emergencySettings?.emergencyExitsVisible !== false}
            />
          </TabsContent>

          <TabsContent value="navigate" className="mt-6">
            {isFeatureEnabled('routeOptimizationEnabled') ? (
              <SafeNavigation />
            ) : (
              <Card className="p-6">
                <Alert>
                  <Navigation className="w-4 h-4" />
                  <AlertDescription>
                    Route optimization has been disabled by system administrator.
                  </AlertDescription>
                </Alert>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="emergency" className="mt-6">
            <div className="space-y-6">
              {isPanicButtonEnabled ? (
                <PanicButton />
              ) : (
                <Card className="p-6">
                  <Alert>
                    <Shield className="w-4 h-4" />
                    <AlertDescription>
                      Emergency panic button has been disabled by system administrator.
                    </AlertDescription>
                  </Alert>
                </Card>
              )}
              
              {emergencySettings?.emergencyContactsVisible ? (
                <EmergencyContacts />
              ) : (
                <Card className="p-6">
                  <Alert>
                    <Phone className="w-4 h-4" />
                    <AlertDescription>
                      Emergency contacts are currently not available.
                    </AlertDescription>
                  </Alert>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <NotificationCenter 
              notifications={notifications}
              aiAnalysis={aiAnalysis}
              activeAnnouncements={activeAnnouncements}
              isFeatureEnabled={isFeatureEnabled}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Live Crowd Map Component
const LiveCrowdMap = ({ crowdZones, currentLocation, aiAnalysis, aiLoading, getDensityColor, getStatusColor, alertThresholds, isFeatureEnabled }: any) => {
  // Don't show map if feature is disabled
  if (!isFeatureEnabled('crowdHeatmapEnabled')) {
    return (
      <Card className="p-6">
        <Alert>
          <Map className="w-4 h-4" />
          <AlertDescription>
            Crowd heatmap has been disabled by system administrator.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI-Powered Live Crowd Map */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Live Crowd Heatmap
            <Badge variant="outline" className="ml-auto text-xs">
              {aiLoading ? 'UPDATING...' : 'LIVE'}
            </Badge>
          </h2>
          
          {/* Map Container */}
          <div className="relative w-full h-64 bg-muted rounded-lg border overflow-hidden">
            {/* Venue Layout */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40">
              {/* Current Location */}
              <div 
                className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse z-10"
                style={{ left: `${currentLocation.x}%`, top: `${currentLocation.y}%` }}
              />
              
              {/* Crowd Zones */}
              {crowdZones.map((zone: any) => (
                <div
                  key={zone.id}
                  className={cn(
                    "absolute w-8 h-8 rounded-full border-2 border-white shadow-lg opacity-80 flex items-center justify-center text-white text-xs font-bold",
                    getDensityColor(zone.density)
                  )}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                  title={`${zone.name}: ${zone.density}%`}
                >
                  {zone.density}
                </div>
              ))}

              {/* Safe Route Path */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                  d="M 25 35 Q 40 45 60 40"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  fill="none"
                  className="animate-pulse"
                />
                <text x="35" y="50" fill="#10b981" fontSize="10" className="font-medium">
                  Safe Route
                </text>
              </svg>
            </div>
          </div>

          {/* Current Zone AI Status */}
          {aiAnalysis && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Your Area: Main Entrance</span>
                {(() => {
                  const currentZone = aiAnalysis.crowdDensity.find((zone: any) => 
                    zone.zoneName.includes('Entrance')
                  );
                  return currentZone ? (
                    <Badge variant={
                      currentZone.riskLevel === 'critical' ? 'destructive' :
                      currentZone.riskLevel === 'high' ? 'destructive' :
                      currentZone.riskLevel === 'medium' ? 'secondary' : 'default'
                    } className="text-xs">
                      {currentZone.riskLevel.toUpperCase()}
                    </Badge>
                  ) : null;
                })()}
              </div>
              {(() => {
                const currentZone = aiAnalysis.crowdDensity.find((zone: any) => 
                  zone.zoneName.includes('Entrance')
                );
                return currentZone && (
                  <p className="text-xs text-muted-foreground mt-1">
                    AI Analysis: {currentZone.utilizationPercentage.toFixed(1)}% capacity utilized
                  </p>
                );
              })()}
            </div>
          )}

          {/* Legend - Use admin-configured thresholds */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low (&lt;{alertThresholds?.low || 40}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Medium ({alertThresholds?.low || 40}-{alertThresholds?.medium || 65}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>High ({alertThresholds?.medium || 65}-{alertThresholds?.high || 85}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span>Critical (&gt;{alertThresholds?.high || 85}%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Zone Status */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Zone Status
          </h3>
          <div className="space-y-2">
            {crowdZones.map((zone: any) => (
              <div key={zone.id} className="flex items-center justify-between p-3 rounded border">
                <span className="text-sm font-medium">{zone.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{zone.density}%</span>
                  <Badge variant={getStatusColor(zone.status)} className="text-xs">
                    {zone.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Emergency Contacts Component
const EmergencyContacts = () => {
  const contacts = [
    { name: "Emergency Services", number: "112", type: "emergency" },
    { name: "Venue Security", number: "+91-9876543210", type: "security" },
    { name: "Medical Assistance", number: "+91-9876543211", type: "medical" },
    { name: "Event Control Room", number: "+91-9876543212", type: "control" }
  ];

  return (
    <Card>
      <div className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Emergency Contacts
        </h3>
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium text-sm">{contact.name}</div>
                <div className="text-xs text-muted-foreground">{contact.number}</div>
              </div>
              <Button size="sm" variant="outline">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Notification Center Component
const NotificationCenter = ({ notifications, aiAnalysis, activeAnnouncements, isFeatureEnabled }: any) => {
  return (
    <div className="space-y-4">
      {/* Admin Announcements */}
      {activeAnnouncements && activeAnnouncements.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              System Announcements
            </h3>
            <div className="space-y-3">
              {activeAnnouncements.map((announcement: any) => (
                <div key={announcement.id} className={cn(
                  "p-3 rounded border",
                  announcement.type === 'emergency' ? "bg-red-50 border-red-200" :
                  announcement.type === 'warning' ? "bg-yellow-50 border-yellow-200" :
                  announcement.type === 'maintenance' ? "bg-orange-50 border-orange-200" :
                  "bg-blue-50 border-blue-200"
                )}>
                  <div className="flex items-start gap-2">
                    <Bell className={cn(
                      "h-4 w-4 mt-0.5 flex-shrink-0",
                      announcement.type === 'emergency' ? "text-red-500" :
                      announcement.type === 'warning' ? "text-yellow-500" :
                      announcement.type === 'maintenance' ? "text-orange-500" :
                      "text-blue-500"
                    )} />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{announcement.title}</h4>
                      <p className="text-sm mt-1">{announcement.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={announcement.type === 'emergency' ? 'destructive' : 'secondary'} className="text-xs">
                          {announcement.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {announcement.priority}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(announcement.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Safety Notifications
          </h3>
          <div className="space-y-3">
            {notifications.map((notification: any) => (
              <div key={notification.id} className="p-3 rounded border bg-muted/50">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* AI-Powered Alerts */}
      {isFeatureEnabled('aiPredictionsEnabled') ? (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              AI Safety Alerts
            </h3>
            <div className="space-y-2">
              {aiAnalysis && aiAnalysis.predictiveAlerts.length > 0 ? (
                aiAnalysis.predictiveAlerts.slice(0, 3).map((alert: any) => (
                  <div key={alert.id} className="p-3 rounded border bg-muted/50">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        alert.severity === 'emergency' ? 'text-red-500' : 'text-orange-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confidence: {(alert.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded border bg-green-50 dark:bg-green-950">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">All clear! No safety concerns detected.</p>
                      <p className="text-xs text-muted-foreground mt-1">AI monitoring active</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-4">
            <Alert>
              <Activity className="w-4 h-4" />
              <AlertDescription>
                AI predictions have been disabled by system administrator.
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MobileApp;