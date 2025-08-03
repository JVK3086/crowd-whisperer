import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { useMobileSettings } from '../hooks/useSettings';
import { useFloorPlan } from '../hooks/useFloorPlan';
import { useVenueConfig } from '../hooks/useVenueConfig';
import { PanicButton } from '../components/mobile/PanicButton';
import { SafeNavigation } from '../components/mobile/SafeNavigation';
import { EntranceExitStatus } from '../components/mobile/EntranceExitStatus';
import { QRScanner } from '../components/mobile/QRScanner';
import { OfflineSupport } from '../components/mobile/OfflineSupport';
import { EventSchedule } from '../components/mobile/EventSchedule';
import { CrowdAlerts } from '../components/mobile/CrowdAlerts';
import { FeedbackSystem } from '../components/mobile/FeedbackSystem';
import { GateStatusNotification } from '../components/shared/GateStatusNotification';
import { LanguageSwitcher } from '../components/shared/LanguageSwitcher';
import { realTimeService } from '../services/realTimeService';
import { Link } from 'react-router-dom';
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
  Info,
  DoorOpen,
  DoorClosed,
  Calendar,
  QrCode,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import sampleVenueMap from '@/assets/sample-venue-map.jpg';

// Mock data for crowd density zones - Kanha Shantivanam locations
const crowdZones = [
  { id: 1, name: "Main Gate (West)", density: 85, status: "high", x: 15, y: 42 },
  { id: 2, name: "Meditation Hall", density: 45, status: "medium", x: 50, y: 15 },
  { id: 3, name: "Dining Hall", density: 72, status: "high", x: 35, y: 75 },
  { id: 4, name: "Central Hall", density: 92, status: "critical", x: 50, y: 45 },
  { id: 5, name: "North Block", density: 25, status: "low", x: 70, y: 20 },
  { id: 6, name: "Sports Complex", density: 35, status: "low", x: 65, y: 80 },
  { id: 7, name: "East Gate", density: 58, status: "medium", x: 85, y: 50 },
  { id: 8, name: "Auditorium", density: 68, status: "high", x: 60, y: 25 },
];

const mockNotifications = [
  { id: 1, type: "warning", message: "High crowd density at Central Hall. Consider visiting Meditation Hall instead.", time: "2 min ago" },
  { id: 2, type: "info", message: "New safe route available to Dining Hall via North Block.", time: "5 min ago" },
  { id: 3, type: "info", message: "Sports Complex has low crowd density - ideal for peaceful activities.", time: "8 min ago" },
];

const MobileApp = () => {
  const { t } = useTranslation();
  const { floorPlan } = useFloorPlan();
  const { config: venueConfig } = useVenueConfig();
  const [currentLocation, setCurrentLocation] = useState({ x: 20, y: 42 }); // Near Main Gate
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
            <div>
              <h1 className="text-lg font-semibold">{venueConfig?.name || t('mobile.title')}</h1>
              {venueConfig?.type && (
                <p className="text-xs text-muted-foreground capitalize">{venueConfig.type.replace('_', ' ')}</p>
              )}
            </div>
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
            <LanguageSwitcher />
            <div className={cn(
              "w-2 h-2 rounded-full", 
              isOnline ? "bg-green-400" : "bg-red-400"
            )} />
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/mobile/help">
                <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
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
          <TabsList className="grid w-full grid-cols-7 text-xs">
            <TabsTrigger value="map" className="flex flex-col items-center gap-1 p-2">
              <Map className="w-4 h-4" />
              <span className="text-xs">Map</span>
            </TabsTrigger>
            <TabsTrigger value="gates" className="flex flex-col items-center gap-1 p-2">
              <Navigation className="w-4 h-4" />
              <span className="text-xs">Gates</span>
            </TabsTrigger>
            <TabsTrigger value="navigate" className="flex flex-col items-center gap-1 p-2">
              <Route className="w-4 h-4" />
              <span className="text-xs">Navigate</span>
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex flex-col items-center gap-1 p-2">
              <Shield className="w-4 h-4" />
              <span className="text-xs">Emergency</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex flex-col items-center gap-1 p-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Events</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex flex-col items-center gap-1 p-2">
              <QrCode className="w-4 h-4" />
              <span className="text-xs">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex flex-col items-center gap-1 p-2">
              <Bell className="w-4 h-4" />
              <span className="text-xs">Alerts</span>
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
              floorPlan={floorPlan}
              venueConfig={venueConfig}
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

          <TabsContent value="events" className="mt-6">
            <EventSchedule />
          </TabsContent>

          <TabsContent value="tools" className="mt-6 space-y-6">
            <QRScanner />
            <OfflineSupport />
            <FeedbackSystem />
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <CrowdAlerts />
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
const LiveCrowdMap = ({ crowdZones, currentLocation, aiAnalysis, aiLoading, getDensityColor, getStatusColor, alertThresholds, isFeatureEnabled, floorPlan, venueConfig }: any) => {
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

  const getGateIcon = (gate: any) => {
    switch (gate.type) {
      case 'entry': return <DoorOpen className="w-3 h-3" />;
      case 'exit': return <DoorClosed className="w-3 h-3" />;
      case 'emergency_exit': return <AlertTriangle className="w-3 h-3" />;
      default: return <MapPin className="w-3 h-3" />;
    }
  };

  const getGateColor = (gate: any) => {
    switch (gate.type) {
      case 'entry': return 'bg-green-600';
      case 'exit': return 'bg-blue-600';
      case 'emergency_exit': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {/* AI-Powered Live Crowd Map */}
      <Card>
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {venueConfig?.name ? `${venueConfig.name} - Live Map` : 'Live Crowd Map'}
              <Badge variant="outline" className="ml-auto text-xs">
                {aiLoading ? 'UPDATING...' : 'LIVE'}
              </Badge>
            </h2>
          
          {/* Map Container */}
          <div className="relative w-full h-80 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border overflow-hidden">
            {/* Floor Plan Background or Default Layout */}
            {floorPlan ? (
              <>
                {/* Uploaded Floor Plan */}
                <img 
                  src={floorPlan.imageUrl} 
                  alt="Floor Plan" 
                  className="absolute inset-0 w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    console.error('Failed to load floor plan, falling back to default');
                    e.currentTarget.src = sampleVenueMap;
                  }}
                />
                {/* Overlay for better marker visibility */}
                <div className="absolute inset-0 bg-black/10 rounded-lg" />
                
                {/* Floor Plan Gates */}
                {floorPlan.gates?.map((gate) => (
                  <div
                    key={gate.id}
                    className={cn(
                      "absolute w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                      getGateColor(gate),
                      "text-white shadow-lg"
                    )}
                    style={{ 
                      left: `${gate.x}%`, 
                      top: `${gate.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: 20
                    }}
                    title={`${gate.name} (${gate.type})`}
                  >
                    {getGateIcon(gate)}
                  </div>
                ))}

                {/* Emergency Routes */}
                {floorPlan.emergencyRoutes?.map((route) => (
                  <svg
                    key={route.id}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 15 }}
                  >
                    <path
                      d={`M ${route.path.map(point => `${point.x}% ${point.y}%`).join(' L ')}`}
                      stroke="#ef4444"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      opacity={0.8}
                      className="animate-pulse"
                    />
                  </svg>
                ))}
              </>
            ) : (
              /* Default Venue Layout Background - Fallback when no floor plan */
              <div className="absolute inset-0">
                {/* North Zone */}
                <div className="absolute top-2 right-4 left-4 h-16 bg-green-200/30 rounded border border-green-300/50">
                  <div className="p-1 text-xs font-medium text-green-800">NORTH</div>
                  <div className="text-xs text-green-700 px-1">Meditation Hall • Auditorium • Family Quarters</div>
                </div>
                
                {/* West Zone */}
                <div className="absolute top-20 left-4 w-20 h-32 bg-blue-200/30 rounded border border-blue-300/50">
                  <div className="p-1 text-xs font-medium text-blue-800 transform -rotate-90 origin-top-left">WEST</div>
                  <div className="text-xs text-blue-700 px-1 mt-4">Gates • Parking</div>
                </div>
                
                {/* Central Zone */}
                <div className="absolute top-24 left-26 right-4 h-28 bg-yellow-200/30 rounded border border-yellow-300/50">
                  <div className="p-1 text-xs font-medium text-yellow-800">CENTRAL</div>
                  <div className="text-xs text-yellow-700 px-1">Main Hall • Yatra Garden • Control Tower</div>
                </div>
                
                {/* South Zone */}
                <div className="absolute bottom-8 left-4 right-4 h-16 bg-orange-200/30 rounded border border-orange-300/50">
                  <div className="p-1 text-xs font-medium text-orange-800">SOUTH</div>
                  <div className="text-xs text-orange-700 px-1">Dining • Sports Complex • Life Sheds</div>
                </div>
                
                {/* East Zone */}
                <div className="absolute top-20 right-4 w-16 h-40 bg-purple-200/30 rounded border border-purple-300/50">
                  <div className="p-1 text-xs font-medium text-purple-800">EAST</div>
                  <div className="text-xs text-purple-700 px-1 mt-2">Admin • Gym • Row Houses</div>
                </div>

                {/* Key Landmarks */}
                <div className="absolute top-24 left-6 w-4 h-4 bg-blue-600 rounded border-2 border-white">
                  <div className="absolute -top-6 -left-8 text-xs font-medium text-blue-800 whitespace-nowrap">Main Gate</div>
                </div>
                <div className="absolute top-8 left-1/2 w-4 h-4 bg-green-600 rounded border-2 border-white">
                  <div className="absolute -top-6 -left-8 text-xs font-medium text-green-800 whitespace-nowrap">Meditation Hall</div>
                </div>
                <div className="absolute bottom-12 left-1/3 w-4 h-4 bg-orange-600 rounded border-2 border-white">
                  <div className="absolute -bottom-6 -left-6 text-xs font-medium text-orange-800 whitespace-nowrap">Dining</div>
                </div>
                <div className="absolute top-32 right-8 w-3 h-3 bg-red-500 rounded border border-white">
                  <div className="absolute -top-5 -left-4 text-xs text-red-600">Exit A</div>
                </div>
                <div className="absolute bottom-16 left-8 w-3 h-3 bg-red-500 rounded border border-white">
                  <div className="absolute -bottom-5 -left-4 text-xs text-red-600">Exit B</div>
                </div>
              </div>
            )}
            
            {/* Current Location */}
            <div 
              className="absolute w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg z-20 flex items-center justify-center"
              style={{ left: `${currentLocation.x}%`, top: `${currentLocation.y}%` }}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute -top-8 -left-8 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                You are here
              </div>
            </div>
            
            {/* Crowd Density Zones - only show if no floor plan */}
            {!floorPlan && crowdZones.map((zone: any) => (
              <div
                key={zone.id}
                className={cn(
                  "absolute w-8 h-8 rounded-full border-2 border-white shadow-lg opacity-90 flex items-center justify-center text-white text-xs font-bold z-10",
                  getDensityColor(zone.density)
                )}
                style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                title={`${zone.name}: ${zone.density}% capacity`}
              >
                {zone.density}
              </div>
            ))}

            {/* Safe Route Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                </marker>
              </defs>
              <path
                d={`M ${currentLocation.x * 3.2} ${currentLocation.y * 3.2} Q ${(currentLocation.x + 20) * 3.2} ${(currentLocation.y + 10) * 3.2} ${60 * 3.2} ${40 * 3.2}`}
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="8,4"
                fill="none"
                markerEnd="url(#arrowhead)"
                className="animate-pulse"
              />
              <text x={`${(currentLocation.x + 15) * 3.2}`} y={`${(currentLocation.y + 15) * 3.2}`} 
                    fill="#10b981" fontSize="12" className="font-medium">
                Recommended Route
              </text>
            </svg>

            {/* Live Updates Indicator */}
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>

          {/* Current Zone AI Status */}
          {aiAnalysis && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Your Area: Main Gate (West)</span>
                {(() => {
                  const currentZone = aiAnalysis.crowdDensity.find((zone: any) => 
                    zone.zoneName.includes('Gate') || zone.zoneName.includes('Entrance')
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
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="space-y-1">
              <div className="font-medium">Crowd Density:</div>
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
            </div>
            <div className="space-y-1">
              <div className="font-medium">Map Elements:</div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Your Location</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Key Landmarks</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Emergency Exits</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-1 bg-green-500 rounded" style={{background: 'repeating-linear-gradient(90deg, #10b981 0, #10b981 8px, transparent 8px, transparent 12px)'}}></div>
                <span>Safe Route</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Zone Information */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Zone Status & Information
          </h3>
          <div className="space-y-2">
            {crowdZones.map((zone: any) => (
              <div key={zone.id} className="flex items-center justify-between p-3 rounded border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn("w-4 h-4 rounded-full", getDensityColor(zone.density))}></div>
                  <div>
                    <span className="text-sm font-medium">{zone.name}</span>
                    <div className="text-xs text-muted-foreground">Tap for directions</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{zone.density}%</span>
                  <Badge variant={getStatusColor(zone.status)} className="text-xs">
                    {zone.status}
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-6 px-2">
                    <Navigation className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Route className="h-4 w-4" />
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Nearest Exit
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Users className="w-4 h-4 mr-2" />
              Less Crowded Area
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Navigation className="w-4 h-4 mr-2" />
              Dining Hall
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Medical Center
            </Button>
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