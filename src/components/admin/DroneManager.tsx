import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, MapPin, Battery, Signal, Trash2, Play, Pause, RotateCcw, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DroneCamera {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance' | 'flying';
  battery: number;
  signal: number;
  position: { x: number; y: number; altitude: number };
  type: 'surveillance' | 'emergency' | 'crowd-monitoring';
  streamUrl?: string;
  lastUpdate: Date;
}

export function DroneManager() {
  const { toast } = useToast();
  const [drones, setDrones] = useState<DroneCamera[]>([
    {
      id: 'drone-1',
      name: 'Main Gate Monitor',
      status: 'active',
      battery: 85,
      signal: 92,
      position: { x: 100, y: 150, altitude: 30 },
      type: 'surveillance',
      streamUrl: 'https://via.placeholder.com/400x300/000000/FFFFFF?text=Live+Feed+1',
      lastUpdate: new Date()
    },
    {
      id: 'drone-2',
      name: 'Crowd Overview',
      status: 'flying',
      battery: 67,
      signal: 88,
      position: { x: 250, y: 200, altitude: 45 },
      type: 'crowd-monitoring',
      streamUrl: 'https://via.placeholder.com/400x300/000000/FFFFFF?text=Live+Feed+2',
      lastUpdate: new Date()
    }
  ]);

  const [selectedDrone, setSelectedDrone] = useState<DroneCamera | null>(null);
  const [isAddingDrone, setIsAddingDrone] = useState(false);
  const [newDrone, setNewDrone] = useState({
    name: '',
    type: 'surveillance' as DroneCamera['type'],
    position: { x: 0, y: 0, altitude: 25 }
  });

  const handleAddDrone = () => {
    if (!newDrone.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a drone name",
        variant: "destructive"
      });
      return;
    }

    const drone: DroneCamera = {
      id: `drone-${Date.now()}`,
      name: newDrone.name,
      status: 'inactive',
      battery: 100,
      signal: 0,
      position: newDrone.position,
      type: newDrone.type,
      lastUpdate: new Date()
    };

    setDrones(prev => [...prev, drone]);
    setNewDrone({ name: '', type: 'surveillance', position: { x: 0, y: 0, altitude: 25 } });
    setIsAddingDrone(false);
    
    toast({
      title: "Drone Added",
      description: `${drone.name} has been added to the fleet`,
    });
  };

  const handleDeleteDrone = (droneId: string) => {
    setDrones(prev => prev.filter(d => d.id !== droneId));
    toast({
      title: "Drone Removed",
      description: "Drone has been removed from the fleet",
    });
  };

  const handleDroneAction = (droneId: string, action: 'start' | 'stop' | 'return') => {
    setDrones(prev => prev.map(drone => {
      if (drone.id === droneId) {
        let newStatus: DroneCamera['status'];
        switch (action) {
          case 'start':
            newStatus = 'flying';
            break;
          case 'stop':
            newStatus = 'active';
            break;
          case 'return':
            newStatus = 'inactive';
            break;
          default:
            newStatus = drone.status;
        }
        return { ...drone, status: newStatus, lastUpdate: new Date() };
      }
      return drone;
    }));

    toast({
      title: "Drone Command Sent",
      description: `Drone ${action} command executed successfully`,
    });
  };

  const getStatusColor = (status: DroneCamera['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'flying': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: DroneCamera['type']) => {
    switch (type) {
      case 'surveillance': return <Eye className="h-4 w-4" />;
      case 'emergency': return <Camera className="h-4 w-4" />;
      case 'crowd-monitoring': return <MapPin className="h-4 w-4" />;
      default: return <Camera className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Drone Fleet Management</h3>
        <Dialog open={isAddingDrone} onOpenChange={setIsAddingDrone}>
          <DialogTrigger asChild>
            <Button>
              <Camera className="mr-2 h-4 w-4" />
              Add Drone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Drone Camera</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="drone-name">Drone Name</Label>
                <Input
                  id="drone-name"
                  value={newDrone.name}
                  onChange={(e) => setNewDrone(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter drone name"
                />
              </div>
              <div>
                <Label htmlFor="drone-type">Type</Label>
                <Select
                  value={newDrone.type}
                  onValueChange={(value: DroneCamera['type']) => 
                    setNewDrone(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="surveillance">Surveillance</SelectItem>
                    <SelectItem value="emergency">Emergency Response</SelectItem>
                    <SelectItem value="crowd-monitoring">Crowd Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="pos-x">X Position</Label>
                  <Input
                    id="pos-x"
                    type="number"
                    value={newDrone.position.x}
                    onChange={(e) => setNewDrone(prev => ({
                      ...prev,
                      position: { ...prev.position, x: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="pos-y">Y Position</Label>
                  <Input
                    id="pos-y"
                    type="number"
                    value={newDrone.position.y}
                    onChange={(e) => setNewDrone(prev => ({
                      ...prev,
                      position: { ...prev.position, y: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="altitude">Altitude (m)</Label>
                  <Input
                    id="altitude"
                    type="number"
                    value={newDrone.position.altitude}
                    onChange={(e) => setNewDrone(prev => ({
                      ...prev,
                      position: { ...prev.position, altitude: parseInt(e.target.value) || 25 }
                    }))}
                  />
                </div>
              </div>
              <Button onClick={handleAddDrone} className="w-full">
                Add Drone
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Fleet Overview</TabsTrigger>
          <TabsTrigger value="feeds">Live Feeds</TabsTrigger>
          <TabsTrigger value="control">Control Panel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {drones.map((drone) => (
              <Card key={drone.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(drone.type)}
                      <CardTitle className="text-sm">{drone.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(drone.status)} text-white`}>
                      {drone.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-1">
                      <Battery className="h-3 w-3" />
                      <span>{drone.battery}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Signal className="h-3 w-3" />
                      <span>{drone.signal}%</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Position: ({drone.position.x}, {drone.position.y}) • {drone.position.altitude}m
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDroneAction(drone.id, drone.status === 'flying' ? 'stop' : 'start')}
                      className="flex-1"
                    >
                      {drone.status === 'flying' ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                      {drone.status === 'flying' ? 'Land' : 'Launch'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDroneAction(drone.id, 'return')}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteDrone(drone.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feeds" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {drones.filter(drone => drone.streamUrl && drone.status !== 'inactive').map((drone) => (
              <Card key={drone.id}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>{drone.name}</span>
                    <Badge variant="outline" className={`${getStatusColor(drone.status)} text-white`}>
                      LIVE
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white text-sm">
                    {drone.streamUrl ? (
                      <img 
                        src={drone.streamUrl} 
                        alt={`${drone.name} feed`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      'No Signal'
                    )}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>Alt: {drone.position.altitude}m</span>
                    <span>Battery: {drone.battery}%</span>
                    <span>Signal: {drone.signal}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="control" className="space-y-4">
          <Alert>
            <Camera className="h-4 w-4" />
            <AlertDescription>
              Control panel for advanced drone operations. Select a drone to view detailed controls.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {drones.map((drone) => (
              <Card key={drone.id}>
                <CardHeader>
                  <CardTitle className="text-sm">{drone.name} - Advanced Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Status:</strong> {drone.status}
                    </div>
                    <div>
                      <strong>Type:</strong> {drone.type}
                    </div>
                    <div>
                      <strong>Battery:</strong> {drone.battery}%
                    </div>
                    <div>
                      <strong>Signal:</strong> {drone.signal}%
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Emergency Return
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Patrol Mode
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Follow Target
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}