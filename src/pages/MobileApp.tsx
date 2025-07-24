import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
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
  WifiOff
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

const notifications = [
  { id: 1, type: "warning", message: "High crowd density at Main Entrance. Use Exit Gate B instead.", time: "2 min ago" },
  { id: 2, type: "info", message: "New safe route available to Food Court via West Wing.", time: "5 min ago" },
];

const MobileApp = () => {
  const [currentLocation, setCurrentLocation] = useState({ x: 25, y: 35 });
  const [isOnline, setIsOnline] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);
  
  // AI Analysis for real-time crowd data
  const { data: aiAnalysis, loading: aiLoading } = useAIAnalysis(15000); // Refresh every 15 seconds

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

  const handlePanicButton = () => {
    if (showPanicConfirm) {
      // Simulate emergency alert
      alert('Emergency alert sent to authorities with your location!');
      setShowPanicConfirm(false);
    } else {
      setShowPanicConfirm(true);
      setTimeout(() => setShowPanicConfirm(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">CrowdSafe</h1>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-destructive" />
            )}
            <Button variant="ghost" size="sm">
              <Languages className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Emergency Panic Button */}
      <div className="px-4 py-2">
        <Button
          onClick={handlePanicButton}
          className={cn(
            "w-full h-12 text-base font-semibold transition-all",
            showPanicConfirm 
              ? "bg-destructive text-destructive-foreground animate-pulse" 
              : "bg-red-600 hover:bg-red-700 text-white"
          )}
        >
          <AlertTriangle className="h-5 w-5 mr-2" />
          {showPanicConfirm ? "CONFIRM EMERGENCY ALERT" : "PANIC BUTTON"}
        </Button>
      </div>

      {/* AI-Powered Live Crowd Map */}
      <Card className="mx-4 mb-4">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            AI Crowd Map
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
                className="absolute w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"
                style={{ left: `${currentLocation.x}%`, top: `${currentLocation.y}%` }}
              />
              
              {/* Crowd Zones */}
              {crowdZones.map((zone) => (
                <div
                  key={zone.id}
                  className={cn(
                    "absolute w-8 h-8 rounded-full border-2 border-white shadow-lg opacity-80",
                    getDensityColor(zone.density)
                  )}
                  style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                />
              ))}

              {/* Safe Route Path */}
              <svg className="absolute inset-0 w-full h-full">
                <path
                  d="M 25 35 Q 40 45 60 40"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  fill="none"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>

          {/* Current Zone AI Status */}
          {aiAnalysis && (
            <div className="mb-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Your Area: Main Entrance</span>
                {(() => {
                  const currentZone = aiAnalysis.crowdDensity.find(zone => 
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
                const currentZone = aiAnalysis.crowdDensity.find(zone => 
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
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs">High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <span className="text-xs">Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs">You</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Zone Status */}
      <Card className="mx-4 mb-4">
        <div className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Zone Status
          </h3>
          <div className="space-y-2">
            {crowdZones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between p-2 rounded border">
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

      {/* Safe Navigation */}
      <Card className="mx-4 mb-4">
        <div className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Route className="h-4 w-4" />
            Safe Navigation
          </h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Navigation className="h-4 w-4 mr-2" />
              Navigate to Exit Gate B (Recommended)
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              Find Nearest Restroom
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Locate Less Crowded Areas
            </Button>
          </div>
        </div>
      </Card>

      {/* AI-Powered Notifications */}
      <Card className="mx-4 mb-6">
        <div className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            AI Safety Alerts
          </h3>
          <div className="space-y-2">
            {aiAnalysis && aiAnalysis.predictiveAlerts.length > 0 ? (
              aiAnalysis.predictiveAlerts.slice(0, 3).map((alert) => (
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2">
        <div className="flex justify-around">
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <MapPin className="h-4 w-4" />
            <span className="text-xs mt-1">Map</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <Navigation className="h-4 w-4" />
            <span className="text-xs mt-1">Navigate</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <Bell className="h-4 w-4" />
            <span className="text-xs mt-1">Alerts</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex-col h-auto py-2">
            <Users className="h-4 w-4" />
            <span className="text-xs mt-1">Status</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileApp;