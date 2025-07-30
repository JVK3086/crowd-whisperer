import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  MapPin, 
  Trash2, 
  Save, 
  Download,
  AlertTriangle,
  DoorOpen,
  DoorClosed,
  Route,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface FloorPlan {
  id: string;
  name: string;
  imageUrl: string;
  uploadedAt: Date;
  gates: Gate[];
  emergencyRoutes: EmergencyRoute[];
}

interface Gate {
  id: string;
  name: string;
  type: 'entrance' | 'exit' | 'emergency_exit' | 'bidirectional';
  position: { x: number; y: number };
  status: 'active' | 'inactive' | 'maintenance';
  capacity: number;
  isEmergencyRoute: boolean;
}

interface EmergencyRoute {
  id: string;
  name: string;
  startGate: string;
  endGate: string;
  path: Array<{ x: number; y: number }>;
  priority: 'high' | 'medium' | 'low';
  maxCapacity: number;
  estimatedTime: number; // in seconds
}

export const FloorPlanManager = () => {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<FloorPlan | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingGate, setIsAddingGate] = useState(false);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Array<{ x: number; y: number }>>([]);
  const [newGate, setNewGate] = useState<Partial<Gate>>({
    type: 'entrance',
    status: 'active',
    capacity: 100,
    isEmergencyRoute: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create object URL for immediate display
      const imageUrl = URL.createObjectURL(file);
      
      const newPlan: FloorPlan = {
        id: `plan-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        imageUrl,
        uploadedAt: new Date(),
        gates: [],
        emergencyRoutes: []
      };

      setFloorPlans(prev => [...prev, newPlan]);
      setSelectedPlan(newPlan);
      toast.success('Floor plan uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload floor plan');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleMapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedPlan || !mapContainerRef.current) return;

    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (isAddingGate) {
      const gateId = `gate-${Date.now()}`;
      const gate: Gate = {
        id: gateId,
        name: newGate.name || `Gate ${selectedPlan.gates.length + 1}`,
        type: newGate.type as Gate['type'],
        position: { x, y },
        status: newGate.status as Gate['status'],
        capacity: newGate.capacity || 100,
        isEmergencyRoute: newGate.isEmergencyRoute || false
      };

      setSelectedPlan(prev => prev ? {
        ...prev,
        gates: [...prev.gates, gate]
      } : null);

      setFloorPlans(prev => prev.map(plan => 
        plan.id === selectedPlan.id 
          ? { ...plan, gates: [...plan.gates, gate] }
          : plan
      ));

      setIsAddingGate(false);
      setNewGate({
        type: 'entrance',
        status: 'active',
        capacity: 100,
        isEmergencyRoute: false
      });
      
      toast.success(`Gate "${gate.name}" added successfully`);
    } else if (isDrawingRoute) {
      setCurrentRoute(prev => [...prev, { x, y }]);
    }
  }, [selectedPlan, isAddingGate, isDrawingRoute, newGate]);

  const finishRoute = useCallback(() => {
    if (currentRoute.length < 2) {
      toast.error('Route must have at least 2 points');
      return;
    }

    const routeId = `route-${Date.now()}`;
    const newRoute: EmergencyRoute = {
      id: routeId,
      name: `Emergency Route ${selectedPlan?.emergencyRoutes.length || 0 + 1}`,
      startGate: '', // Will be assigned based on nearest gates
      endGate: '',
      path: currentRoute,
      priority: 'medium',
      maxCapacity: 500,
      estimatedTime: Math.round(currentRoute.length * 15) // Rough estimate
    };

    if (selectedPlan) {
      setSelectedPlan(prev => prev ? {
        ...prev,
        emergencyRoutes: [...prev.emergencyRoutes, newRoute]
      } : null);

      setFloorPlans(prev => prev.map(plan => 
        plan.id === selectedPlan.id 
          ? { ...plan, emergencyRoutes: [...plan.emergencyRoutes, newRoute] }
          : plan
      ));
    }

    setCurrentRoute([]);
    setIsDrawingRoute(false);
    toast.success('Emergency route created successfully');
  }, [currentRoute, selectedPlan]);

  const deleteGate = useCallback((gateId: string) => {
    if (!selectedPlan) return;

    setSelectedPlan(prev => prev ? {
      ...prev,
      gates: prev.gates.filter(gate => gate.id !== gateId)
    } : null);

    setFloorPlans(prev => prev.map(plan => 
      plan.id === selectedPlan.id 
        ? { ...plan, gates: plan.gates.filter(gate => gate.id !== gateId) }
        : plan
    ));

    toast.success('Gate deleted successfully');
  }, [selectedPlan]);

  const getGateIcon = (gate: Gate) => {
    switch (gate.type) {
      case 'entrance': return <DoorOpen className="w-4 h-4" />;
      case 'exit': return <DoorClosed className="w-4 h-4" />;
      case 'emergency_exit': return <AlertTriangle className="w-4 h-4" />;
      case 'bidirectional': return <Route className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getGateColor = (gate: Gate) => {
    switch (gate.type) {
      case 'entrance': return 'bg-green-600 hover:bg-green-700';
      case 'exit': return 'bg-blue-600 hover:bg-blue-700';
      case 'emergency_exit': return 'bg-red-600 hover:bg-red-700';
      case 'bidirectional': return 'bg-purple-600 hover:bg-purple-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Upload */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Floor Plan Manager</h3>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload Floor Plan'}
          </Button>
        </div>
      </div>

      {/* Floor Plan Selection */}
      {floorPlans.length > 0 && (
        <Card className="p-4">
          <Label className="text-sm font-medium mb-2 block">Select Floor Plan</Label>
          <Select
            value={selectedPlan?.id || ''}
            onValueChange={(value) => {
              const plan = floorPlans.find(p => p.id === value);
              setSelectedPlan(plan || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a floor plan" />
            </SelectTrigger>
            <SelectContent>
              {floorPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} ({plan.gates.length} gates)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      )}

      {selectedPlan ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Interactive Floor Plan */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">{selectedPlan.name}</h4>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Gate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Gate</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="gateName">Gate Name</Label>
                        <Input
                          id="gateName"
                          value={newGate.name || ''}
                          onChange={(e) => setNewGate(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter gate name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gateType">Gate Type</Label>
                        <Select 
                          value={newGate.type}
                          onValueChange={(value) => setNewGate(prev => ({ ...prev, type: value as Gate['type'] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entrance">Entrance</SelectItem>
                            <SelectItem value="exit">Exit</SelectItem>
                            <SelectItem value="emergency_exit">Emergency Exit</SelectItem>
                            <SelectItem value="bidirectional">Bidirectional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="gateCapacity">Capacity (people/min)</Label>
                        <Input
                          id="gateCapacity"
                          type="number"
                          value={newGate.capacity || 100}
                          onChange={(e) => setNewGate(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          setIsAddingGate(true);
                          document.querySelector('[role="dialog"]')?.querySelector('button')?.click();
                        }}
                        className="w-full"
                      >
                        Click on Map to Place Gate
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant={isDrawingRoute ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isDrawingRoute) {
                      finishRoute();
                    } else {
                      setIsDrawingRoute(true);
                      setCurrentRoute([]);
                    }
                  }}
                >
                  <Route className="w-4 h-4 mr-1" />
                  {isDrawingRoute ? 'Finish Route' : 'Draw Emergency Route'}
                </Button>
              </div>
            </div>

            {(isAddingGate || isDrawingRoute) && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {isAddingGate && "Click on the floor plan to place a new gate"}
                  {isDrawingRoute && "Click on the floor plan to draw emergency route points"}
                </AlertDescription>
              </Alert>
            )}

            <div 
              ref={mapContainerRef}
              className="relative bg-gray-50 rounded-lg h-96 overflow-hidden cursor-crosshair"
              onClick={handleMapClick}
            >
              <img 
                src={selectedPlan.imageUrl} 
                alt="Floor Plan" 
                className="absolute inset-0 w-full h-full object-contain"
                draggable={false}
              />

              {/* Gates */}
              {selectedPlan.gates.map((gate) => (
                <div
                  key={gate.id}
                  className={`absolute w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 ${getGateColor(gate)}`}
                  style={{ 
                    left: `${gate.position.x}%`, 
                    top: `${gate.position.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  title={`${gate.name} (${gate.type})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle gate selection or editing
                  }}
                >
                  {getGateIcon(gate)}
                </div>
              ))}

              {/* Emergency Routes */}
              {selectedPlan.emergencyRoutes.map((route) => (
                <svg
                  key={route.id}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  <path
                    d={`M ${route.path.map(point => `${point.x}% ${point.y}%`).join(' L ')}`}
                    stroke="#ef4444"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                </svg>
              ))}

              {/* Current Route Being Drawn */}
              {currentRoute.length > 0 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
                  <path
                    d={`M ${currentRoute.map(point => `${point.x}% ${point.y}%`).join(' L ')}`}
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="2,2"
                  />
                  {currentRoute.map((point, index) => (
                    <circle
                      key={index}
                      cx={`${point.x}%`}
                      cy={`${point.y}%`}
                      r="4"
                      fill="#3b82f6"
                    />
                  ))}
                </svg>
              )}
            </div>
          </Card>

          {/* Gate & Route Management */}
          <Card className="p-6">
            <h4 className="font-semibold mb-4">Gates & Routes</h4>
            
            {/* Gates List */}
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Gates ({selectedPlan.gates.length})</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedPlan.gates.map((gate) => (
                    <div key={gate.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${getGateColor(gate).split(' ')[0]}`}>
                          {getGateIcon(gate)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{gate.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {gate.type} • {gate.capacity}/min
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGate(gate.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Routes */}
              <div>
                <h5 className="text-sm font-medium mb-2">Emergency Routes ({selectedPlan.emergencyRoutes.length})</h5>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedPlan.emergencyRoutes.map((route) => (
                    <div key={route.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="text-sm font-medium">{route.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {route.maxCapacity} capacity • {route.estimatedTime}s
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {route.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Layout
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Floor Plan Selected</h3>
          <p className="text-muted-foreground mb-4">
            Upload a floor plan image to start identifying gates and emergency routes
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Your First Floor Plan
          </Button>
        </Card>
      )}
    </div>
  );
};