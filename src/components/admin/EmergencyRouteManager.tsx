import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Route, 
  AlertTriangle, 
  Clock, 
  Users, 
  ArrowRight,
  Play,
  Square,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { emergencyManagementService } from '../../services/emergencyManagement';

interface DynamicRoute {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'blocked' | 'emergency_only';
  sourceGate: string;
  destinationGate: string;
  waypoints: Array<{ x: number; y: number; name?: string }>;
  capacity: number;
  estimatedTime: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  conditions: {
    maxCrowdDensity: number;
    weatherDependent: boolean;
    timeRestrictions?: { start: string; end: string };
  };
  lastActivated?: Date;
  usageCount: number;
}

interface EmergencyScenario {
  id: string;
  name: string;
  type: 'fire' | 'earthquake' | 'security' | 'medical' | 'general';
  affectedZones: string[];
  blockedRoutes: string[];
  priorityRoutes: string[];
  estimatedEvacuationTime: number;
  maxCapacity: number;
}

export const EmergencyRouteManager = () => {
  const [routes, setRoutes] = useState<DynamicRoute[]>([
    {
      id: 'route-1',
      name: 'Main Exit Corridor',
      status: 'active',
      sourceGate: 'main-entrance',
      destinationGate: 'main-exit',
      waypoints: [{ x: 20, y: 30 }, { x: 50, y: 30 }, { x: 80, y: 30 }],
      capacity: 500,
      estimatedTime: 120,
      priority: 'high',
      conditions: {
        maxCrowdDensity: 85,
        weatherDependent: false
      },
      usageCount: 45
    },
    {
      id: 'route-2',
      name: 'Emergency Side Exit',
      status: 'emergency_only',
      sourceGate: 'central-hall',
      destinationGate: 'emergency-exit-1',
      waypoints: [{ x: 50, y: 55 }, { x: 30, y: 70 }, { x: 10, y: 85 }],
      capacity: 200,
      estimatedTime: 90,
      priority: 'critical',
      conditions: {
        maxCrowdDensity: 95,
        weatherDependent: false
      },
      usageCount: 12
    }
  ]);

  const [scenarios, setScenarios] = useState<EmergencyScenario[]>([
    {
      id: 'fire-scenario',
      name: 'Fire Emergency - Main Hall',
      type: 'fire',
      affectedZones: ['central-hall', 'main-entrance'],
      blockedRoutes: ['route-1'],
      priorityRoutes: ['route-2'],
      estimatedEvacuationTime: 300,
      maxCapacity: 1000
    }
  ]);

  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [newRoute, setNewRoute] = useState<Partial<DynamicRoute>>({
    status: 'active',
    priority: 'medium',
    capacity: 300,
    estimatedTime: 180,
    conditions: {
      maxCrowdDensity: 80,
      weatherDependent: false
    }
  });

  // Real-time route monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time route capacity updates
      setRoutes(prev => prev.map(route => ({
        ...route,
        // Simulate dynamic capacity changes based on crowd conditions
        capacity: route.capacity + Math.floor(Math.random() * 20 - 10)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const activateEmergencyScenario = useCallback(async (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    try {
      setActiveScenario(scenarioId);
      
      // Update route statuses based on scenario
      setRoutes(prev => prev.map(route => {
        if (scenario.blockedRoutes.includes(route.id)) {
          return { ...route, status: 'blocked' as const };
        }
        if (scenario.priorityRoutes.includes(route.id)) {
          return { ...route, status: 'active' as const, priority: 'critical' as const };
        }
        return route;
      }));

      // Activate emergency management
      await emergencyManagementService.activateEvacuationPlan('evac-plan-1', `Emergency scenario: ${scenario.name}`);
      
      toast.success(`Emergency scenario "${scenario.name}" activated`);
    } catch (error) {
      toast.error('Failed to activate emergency scenario');
    }
  }, [scenarios]);

  const deactivateEmergencyScenario = useCallback(() => {
    setActiveScenario(null);
    
    // Reset all routes to normal status
    setRoutes(prev => prev.map(route => ({
      ...route,
      status: route.status === 'blocked' ? 'active' : route.status,
      priority: route.priority === 'critical' ? 'high' : route.priority
    })));

    toast.success('Emergency scenario deactivated');
  }, []);

  const toggleRouteStatus = useCallback((routeId: string) => {
    setRoutes(prev => prev.map(route => {
      if (route.id === routeId) {
        const newStatus = route.status === 'active' ? 'inactive' : 'active';
        return { ...route, status: newStatus };
      }
      return route;
    }));
  }, []);

  const createNewRoute = useCallback(() => {
    if (!newRoute.name || !newRoute.sourceGate || !newRoute.destinationGate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const route: DynamicRoute = {
      id: `route-${Date.now()}`,
      name: newRoute.name,
      status: newRoute.status || 'active',
      sourceGate: newRoute.sourceGate,
      destinationGate: newRoute.destinationGate,
      waypoints: [],
      capacity: newRoute.capacity || 300,
      estimatedTime: newRoute.estimatedTime || 180,
      priority: newRoute.priority || 'medium',
      conditions: newRoute.conditions || {
        maxCrowdDensity: 80,
        weatherDependent: false
      },
      usageCount: 0
    };

    setRoutes(prev => [...prev, route]);
    setIsCreatingRoute(false);
    setNewRoute({
      status: 'active',
      priority: 'medium',
      capacity: 300,
      estimatedTime: 180,
      conditions: {
        maxCrowdDensity: 80,
        weatherDependent: false
      }
    });

    toast.success(`Route "${route.name}" created successfully`);
  }, [newRoute]);

  const getStatusColor = (status: DynamicRoute['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'emergency_only': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: DynamicRoute['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getScenarioTypeColor = (type: EmergencyScenario['type']) => {
    switch (type) {
      case 'fire': return 'bg-red-500 text-white';
      case 'earthquake': return 'bg-orange-500 text-white';
      case 'security': return 'bg-blue-500 text-white';
      case 'medical': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Emergency Route Manager</h3>
        <div className="flex gap-2">
          <Dialog open={isCreatingRoute} onOpenChange={setIsCreatingRoute}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Route
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Emergency Route</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="routeName">Route Name</Label>
                  <Input
                    id="routeName"
                    value={newRoute.name || ''}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter route name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sourceGate">Source Gate</Label>
                    <Input
                      id="sourceGate"
                      value={newRoute.sourceGate || ''}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, sourceGate: e.target.value }))}
                      placeholder="Source gate ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="destinationGate">Destination Gate</Label>
                    <Input
                      id="destinationGate"
                      value={newRoute.destinationGate || ''}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, destinationGate: e.target.value }))}
                      placeholder="Destination gate ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity (people)</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={newRoute.capacity || 300}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedTime">Estimated Time (seconds)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      value={newRoute.estimatedTime || 180}
                      onChange={(e) => setNewRoute(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newRoute.priority}
                    onValueChange={(value) => setNewRoute(prev => ({ ...prev, priority: value as DynamicRoute['priority'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createNewRoute} className="w-full">
                  Create Route
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Emergency Scenario Alert */}
      {activeScenario && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="font-semibold text-red-800">
              Emergency Scenario Active: {scenarios.find(s => s.id === activeScenario)?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={deactivateEmergencyScenario}
              className="ml-4"
            >
              <Square className="w-4 h-4 mr-1" />
              Deactivate
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dynamic Routes */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Dynamic Routes ({routes.length})</h4>
          <div className="space-y-3">
            {routes.map((route) => (
              <div key={route.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(route.priority)}`} />
                    <h5 className="font-medium">{route.name}</h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(route.status)}>
                      {route.status.replace('_', ' ')}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRouteStatus(route.id)}
                      disabled={activeScenario !== null}
                    >
                      {route.status === 'active' ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{route.capacity} capacity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{route.estimatedTime}s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-muted-foreground" />
                    <span>{route.sourceGate}</span>
                    <ArrowRight className="w-3 h-3" />
                    <span className="truncate">{route.destinationGate}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Used {route.usageCount} times
                  </div>
                </div>

                {route.conditions.maxCrowdDensity < 90 && (
                  <div className="mt-2 text-xs text-amber-600">
                    ⚠️ Activates at {route.conditions.maxCrowdDensity}% crowd density
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Emergency Scenarios */}
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Emergency Scenarios</h4>
          <div className="space-y-3">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getScenarioTypeColor(scenario.type)}>
                      {scenario.type}
                    </Badge>
                    <h5 className="font-medium">{scenario.name}</h5>
                  </div>
                  <Button
                    variant={activeScenario === scenario.id ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (activeScenario === scenario.id) {
                        deactivateEmergencyScenario();
                      } else {
                        activateEmergencyScenario(scenario.id);
                      }
                    }}
                  >
                    {activeScenario === scenario.id ? (
                      <>
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Affected Zones: </span>
                    <span>{scenario.affectedZones.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blocked Routes: </span>
                    <span className="text-red-600">{scenario.blockedRoutes.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority Routes: </span>
                    <span className="text-green-600">{scenario.priorityRoutes.length}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>{scenario.estimatedEvacuationTime}s evacuation</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span>{scenario.maxCapacity} max capacity</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t">
            <h5 className="text-sm font-medium mb-3">Quick Actions</h5>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                Simulate Fire Emergency
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Test All Routes
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Capacity Analysis
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Generate Report
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Route Visualization Stats */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Route Performance Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {routes.filter(r => r.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Routes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {routes.reduce((sum, r) => sum + r.capacity, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Capacity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(routes.reduce((sum, r) => sum + r.estimatedTime, 0) / routes.length)}s
            </div>
            <div className="text-sm text-muted-foreground">Avg. Evacuation Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {routes.reduce((sum, r) => sum + r.usageCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Usage</div>
          </div>
        </div>
      </Card>
    </div>
  );
};