import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  AlertTriangle, 
  MapPin, 
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  Navigation,
  Clock,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrowdAlert {
  id: string;
  location: string;
  currentDensity: number;
  threshold: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  estimatedClearTime?: number; // minutes
  alternatives?: string[];
  isActive: boolean;
}

interface AlertSettings {
  enabled: boolean;
  thresholds: {
    medium: number;
    high: number;
    critical: number;
  };
  locations: string[];
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface CrowdAlertsProps {
  className?: string;
}

export const CrowdAlerts = ({ className }: CrowdAlertsProps) => {
  const [alerts, setAlerts] = useState<CrowdAlert[]>([]);
  const [settings, setSettings] = useState<AlertSettings>({
    enabled: true,
    thresholds: {
      medium: 60,
      high: 75,
      critical: 90
    },
    locations: ['Central Hall', 'Main Entrance', 'Food Court'],
    soundEnabled: true,
    vibrationEnabled: true
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Mock real-time crowd data
    const mockAlerts: CrowdAlert[] = [
      {
        id: '1',
        location: 'Central Hall',
        currentDensity: 92,
        threshold: 90,
        trend: 'increasing',
        severity: 'critical',
        message: 'Central Hall is extremely crowded. Consider visiting North Wing or Garden Area.',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        estimatedClearTime: 15,
        alternatives: ['North Wing', 'Garden Area', 'West Corridor'],
        isActive: true
      },
      {
        id: '2',
        location: 'Food Court',
        currentDensity: 78,
        threshold: 75,
        trend: 'decreasing',
        severity: 'high',
        message: 'Food Court crowd is high but decreasing. Expected to clear in 10 minutes.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        estimatedClearTime: 10,
        alternatives: ['West Dining Area'],
        isActive: true
      },
      {
        id: '3',
        location: 'Main Entrance',
        currentDensity: 45,
        threshold: 60,
        trend: 'stable',
        severity: 'low',
        message: 'Main Entrance crowd levels are normal.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        isActive: false
      }
    ];

    setAlerts(mockAlerts);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setAlerts(prev => prev.map(alert => ({
        ...alert,
        currentDensity: Math.max(10, alert.currentDensity + (Math.random() - 0.5) * 10),
        timestamp: new Date()
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: CrowdAlert['severity']) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: CrowdAlert['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 animate-pulse" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: CrowdAlert['trend']) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isActive: false } : alert
    ));
  };

  const navigateToAlternative = (location: string) => {
    alert(`Navigating to ${location}`);
  };

  const updateSettings = (newSettings: Partial<AlertSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const activeAlerts = alerts.filter(alert => alert.isActive);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');

  return (
    <div className={cn("space-y-4", className)}>
      {/* Settings Toggle */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-semibold">Crowd Alerts</h3>
            <Badge variant={settings.enabled ? 'default' : 'secondary'}>
              {settings.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => updateSettings({ enabled })}
            />
          </div>
        </div>

        {/* Critical Alert Summary */}
        {criticalAlerts.length > 0 && settings.enabled && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>{criticalAlerts.length} critical crowd alert(s)</strong> require immediate attention.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-4">
          <h4 className="font-medium mb-4">Alert Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Alert Thresholds (%)</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Medium</label>
                  <input
                    type="number"
                    value={settings.thresholds.medium}
                    onChange={(e) => updateSettings({
                      thresholds: { ...settings.thresholds, medium: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded text-sm"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">High</label>
                  <input
                    type="number"
                    value={settings.thresholds.high}
                    onChange={(e) => updateSettings({
                      thresholds: { ...settings.thresholds, high: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded text-sm"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Critical</label>
                  <input
                    type="number"
                    value={settings.thresholds.critical}
                    onChange={(e) => updateSettings({
                      thresholds: { ...settings.thresholds, critical: parseInt(e.target.value) }
                    })}
                    className="w-full p-2 border rounded text-sm"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm">Sound notifications</span>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(soundEnabled) => updateSettings({ soundEnabled })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Vibration alerts</span>
              </div>
              <Switch
                checked={settings.vibrationEnabled}
                onCheckedChange={(vibrationEnabled) => updateSettings({ vibrationEnabled })}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Active Alerts */}
      {settings.enabled && (
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={cn(
                "p-4",
                alert.severity === 'critical' && "border-red-200 bg-red-50",
                alert.severity === 'high' && "border-orange-200 bg-orange-50"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <h4 className="font-semibold text-sm">{alert.location}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{alert.currentDensity}% capacity</span>
                        {getTrendIcon(alert.trend)}
                        <span className="capitalize">{alert.trend}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      <BellOff className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {alert.message}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {alert.estimatedClearTime 
                        ? `Clears in ${alert.estimatedClearTime} min`
                        : 'No estimate'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>
                      {Math.round(new Date(Date.now() - alert.timestamp.getTime()).getTime() / 60000)} min ago
                    </span>
                  </div>
                </div>

                {alert.alternatives && alert.alternatives.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium mb-2">Alternative locations:</p>
                    <div className="flex flex-wrap gap-2">
                      {alert.alternatives.map((alternative, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => navigateToAlternative(alternative)}
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          {alternative}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No Active Alerts */}
      {settings.enabled && activeAlerts.length === 0 && (
        <Card className="p-6 text-center">
          <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h4 className="font-medium text-green-700 mb-1">All Clear!</h4>
          <p className="text-sm text-green-600">No crowd alerts at this time.</p>
        </Card>
      )}

      {/* Disabled State */}
      {!settings.enabled && (
        <Card className="p-6 text-center">
          <BellOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <h4 className="font-medium text-muted-foreground mb-1">Alerts Disabled</h4>
          <p className="text-sm text-muted-foreground">
            Turn on alerts to receive crowd density notifications.
          </p>
        </Card>
      )}
    </div>
  );
};