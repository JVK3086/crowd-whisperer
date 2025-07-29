import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Navigation, 
  MapPin, 
  Route,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafeRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: number; // in meters
  estimatedTime: number; // in minutes
  crowdLevel: 'low' | 'medium' | 'high' | 'avoid';
  difficulty: 'easy' | 'moderate' | 'challenging';
  waypoints: Array<{
    name: string;
    crowdDensity: number;
    isCheckpoint: boolean;
  }>;
  features: string[];
  isRecommended: boolean;
  lastUpdated: Date;
}

interface SafeNavigationProps {
  className?: string;
}

export const SafeNavigation = ({ className }: SafeNavigationProps) => {
  const [currentLocation, setCurrentLocation] = useState<string>('Main Entrance');
  const [destination, setDestination] = useState<string>('');
  const [routes, setRoutes] = useState<SafeRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SafeRoute | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const destinations = [
    'Food Court',
    'Central Hall',
    'Exit Gate A',
    'Exit Gate B',
    'West Wing',
    'North Corridor',
    'East Platform',
    'Assembly Point A',
    'Assembly Point B'
  ];

  useEffect(() => {
    if (destination) {
      calculateRoutes();
    }
  }, [destination, currentLocation, calculateRoutes]);

  const calculateRoutes = useCallback(async () => {
    setIsCalculating(true);
    
    // Simulate route calculation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockRoutes: SafeRoute[] = [
      {
        id: 'route-1',
        name: 'Direct Route',
        from: currentLocation,
        to: destination,
        distance: 150,
        estimatedTime: 3,
        crowdLevel: 'high',
        difficulty: 'easy',
        waypoints: [
          { name: 'Main Corridor', crowdDensity: 85, isCheckpoint: false },
          { name: 'Central Junction', crowdDensity: 92, isCheckpoint: true },
          { name: destination, crowdDensity: 78, isCheckpoint: false }
        ],
        features: ['Shortest distance', 'Well-lit path'],
        isRecommended: false,
        lastUpdated: new Date()
      },
      {
        id: 'route-2',
        name: 'Safe Alternative Route',
        from: currentLocation,
        to: destination,
        distance: 220,
        estimatedTime: 5,
        crowdLevel: 'low',
        difficulty: 'easy',
        waypoints: [
          { name: 'West Corridor', crowdDensity: 25, isCheckpoint: false },
          { name: 'Quiet Garden Area', crowdDensity: 15, isCheckpoint: true },
          { name: 'Side Entrance', crowdDensity: 35, isCheckpoint: false },
          { name: destination, crowdDensity: 78, isCheckpoint: false }
        ],
        features: ['Low crowd density', 'Multiple exits', 'Rest areas'],
        isRecommended: true,
        lastUpdated: new Date()
      },
      {
        id: 'route-3',
        name: 'Emergency Route',
        from: currentLocation,
        to: destination,
        distance: 300,
        estimatedTime: 7,
        crowdLevel: 'medium',
        difficulty: 'moderate',
        waypoints: [
          { name: 'Emergency Corridor', crowdDensity: 45, isCheckpoint: false },
          { name: 'Staff Area', crowdDensity: 20, isCheckpoint: true },
          { name: 'Service Tunnel', crowdDensity: 10, isCheckpoint: false },
          { name: destination, crowdDensity: 78, isCheckpoint: false }
        ],
        features: ['Emergency access', 'Staff assistance available', 'Climate controlled'],
        isRecommended: false,
        lastUpdated: new Date()
      }
    ];

    setRoutes(mockRoutes);
    setSelectedRoute(mockRoutes.find(r => r.isRecommended) || mockRoutes[0]);
    setIsCalculating(false);
  }, [currentLocation, destination]);

  const getCrowdLevelColor = (level: SafeRoute['crowdLevel']) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'avoid': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCrowdLevelIcon = (level: SafeRoute['crowdLevel']) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <Users className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'avoid': return <AlertTriangle className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const startNavigation = (route: SafeRoute) => {
    setSelectedRoute(route);
    // In a real app, this would start turn-by-turn navigation
    alert(`Navigation started for: ${route.name}\nEstimated time: ${route.estimatedTime} minutes`);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          Safe Route Navigation
        </h3>

        {/* Destination Selection */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Current Location</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{currentLocation}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Destination</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select destination...</option>
              {destinations.map((dest) => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Route Options */}
      {isCalculating && (
        <Card className="p-6 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Calculating safe routes...</p>
        </Card>
      )}

      {routes.length > 0 && !isCalculating && (
        <div className="space-y-4">
          <h4 className="font-semibold">Available Routes</h4>
          
          {routes.map((route) => (
            <Card 
              key={route.id} 
              className={cn(
                "p-4 cursor-pointer transition-all",
                selectedRoute?.id === route.id && "ring-2 ring-blue-500",
                route.isRecommended && "border-green-200 bg-green-50"
              )}
              onClick={() => setSelectedRoute(route)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium">{route.name}</h5>
                    {route.isRecommended && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {route.from} → {route.to}
                  </div>
                </div>
                
                <Badge className={cn("text-xs", getCrowdLevelColor(route.crowdLevel))}>
                  {getCrowdLevelIcon(route.crowdLevel)}
                  <span className="ml-1">{route.crowdLevel}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Distance</div>
                  <div className="font-medium">{route.distance}m</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Time</div>
                  <div className="font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {route.estimatedTime} min
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Difficulty</div>
                  <div className="font-medium capitalize">{route.difficulty}</div>
                </div>
              </div>

              {/* Waypoints */}
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-2">Route waypoints:</div>
                <div className="flex items-center gap-1 text-xs">
                  {route.waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-center">
                      <span className={cn(
                        "px-2 py-1 rounded",
                        waypoint.crowdDensity > 70 ? "bg-red-100 text-red-700" :
                        waypoint.crowdDensity > 40 ? "bg-yellow-100 text-yellow-700" :
                        "bg-green-100 text-green-700"
                      )}>
                        {waypoint.name}
                      </span>
                      {index < route.waypoints.length - 1 && (
                        <ArrowRight className="w-3 h-3 mx-1 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {route.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                size="sm"
                className="w-full"
                variant={selectedRoute?.id === route.id ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  startNavigation(route);
                }}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Start Navigation
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Active Navigation */}
      {selectedRoute && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Route className="w-5 h-5 text-blue-600" />
            Active Route: {selectedRoute.name}
          </h4>

          <div className="space-y-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Next waypoint:</span>
              <span className="ml-2 font-medium">
                {selectedRoute.waypoints[0]?.name || 'Destination'}
              </span>
            </div>

            <Progress value={25} className="h-2" />
            
            <div className="text-xs text-muted-foreground">
              25% complete • {Math.round(selectedRoute.estimatedTime * 0.75)} minutes remaining
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};