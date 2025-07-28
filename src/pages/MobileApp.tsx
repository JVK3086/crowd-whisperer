import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { PanicButton } from '../components/mobile/PanicButton';
import { SafeNavigation } from '../components/mobile/SafeNavigation';
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
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('map');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // AI Analysis for real-time crowd data
  const { data: aiAnalysis, loading: aiLoading } = useAIAnalysis(15000);

  // Real-time connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = realTimeService.getConnectionStatus();
      setIsOnline(connected);
      
      // If offline, enable offline mode
      if (!connected && !isOfflineMode) {
        setIsOfflineMode(true);
      }
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    
    return () => clearInterval(interval);
  }, [isOfflineMode]);

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

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
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
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-background border rounded px-2 py-1 text-xs"
            >
              <option value="en">EN</option>
              <option value="hi">हि</option>
              <option value="te">తె</option>
              <option value="ta">த</option>
            </select>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="map" className="flex items-center gap-1">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
            <TabsTrigger value="navigate" className="flex items-center gap-1">
              <Navigation className="w-4 h-4" />
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
            <LiveCrowdMap 
              crowdZones={crowdZones}
              currentLocation={currentLocation}
              aiAnalysis={aiAnalysis}
              aiLoading={aiLoading}
              getDensityColor={getDensityColor}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="navigate" className="mt-6">
            <SafeNavigation />
          </TabsContent>

          <TabsContent value="emergency" className="mt-6">
            <div className="space-y-6">
              <PanicButton />
              <EmergencyContacts />
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <NotificationCenter 
              notifications={notifications}
              aiAnalysis={aiAnalysis}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Live Crowd Map Component
const LiveCrowdMap = ({ crowdZones, currentLocation, aiAnalysis, aiLoading, getDensityColor, getStatusColor }: any) => {
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

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low (&lt;40%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Medium (40-60%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>High (60-80%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span>Critical (&gt;80%)</span>
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
const NotificationCenter = ({ notifications, aiAnalysis }: any) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default MobileApp;