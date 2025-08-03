import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  MapPin, 
  Users, 
  Settings, 
  Save, 
  Upload,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  Music,
  GraduationCap,
  Plane,
  ShoppingBag,
  Building,
  Heart,
  Car,
  Coffee,
  Gamepad2,
  Landmark
} from 'lucide-react';

export interface VenueConfig {
  id: string;
  name: string;
  type: string;
  category: 'indoor' | 'outdoor' | 'mixed';
  description: string;
  address: string;
  capacity: number;
  operatingHours: {
    start: string;
    end: string;
  };
  features: string[];
  zones: Array<{
    id: string;
    name: string;
    capacity: number;
    type: string;
  }>;
  emergencyContacts: Array<{
    name: string;
    role: string;
    phone: string;
  }>;
  customization: {
    primaryColor: string;
    logo?: string;
    welcomeMessage: string;
    languages: string[];
  };
}

const VENUE_TYPES = [
  { id: 'conference', name: 'Conference Center', icon: Building2, color: 'blue' },
  { id: 'concert', name: 'Concert Venue', icon: Music, color: 'purple' },
  { id: 'sports', name: 'Sports Stadium', icon: Calendar, color: 'green' },
  { id: 'university', name: 'University Campus', icon: GraduationCap, color: 'indigo' },
  { id: 'airport', name: 'Airport Terminal', icon: Plane, color: 'sky' },
  { id: 'mall', name: 'Shopping Mall', icon: ShoppingBag, color: 'pink' },
  { id: 'office', name: 'Office Building', icon: Building, color: 'gray' },
  { id: 'hospital', name: 'Hospital/Medical', icon: Heart, color: 'red' },
  { id: 'transport', name: 'Transport Hub', icon: Car, color: 'orange' },
  { id: 'exhibition', name: 'Exhibition Center', icon: Coffee, color: 'amber' },
  { id: 'entertainment', name: 'Entertainment Complex', icon: Gamepad2, color: 'violet' },
  { id: 'government', name: 'Government Building', icon: Landmark, color: 'slate' },
  { id: 'custom', name: 'Custom Venue', icon: Settings, color: 'zinc' }
];

const ZONE_TEMPLATES = {
  conference: ['Main Hall', 'Registration', 'Exhibition Area', 'Networking Lounge'],
  concert: ['Main Stage', 'VIP Area', 'General Admission', 'Merchandise'],
  sports: ['Field/Court', 'Home Stands', 'Away Stands', 'Concessions'],
  university: ['Lecture Halls', 'Library', 'Cafeteria', 'Outdoor Areas'],
  airport: ['Check-in', 'Security', 'Gates', 'Baggage Claim'],
  mall: ['Food Court', 'Main Concourse', 'Department Stores', 'Parking'],
  office: ['Lobby', 'Conference Rooms', 'Work Areas', 'Break Rooms'],
  hospital: ['Emergency', 'Waiting Areas', 'Reception', 'Treatment Areas'],
  transport: ['Platform', 'Waiting Area', 'Ticket Office', 'Parking'],
  exhibition: ['Main Floor', 'Meeting Rooms', 'Reception', 'Storage'],
  entertainment: ['Main Floor', 'Gaming Area', 'Dining', 'VIP Lounge'],
  government: ['Reception', 'Waiting Areas', 'Meeting Rooms', 'Security'],
  custom: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4']
};

interface VenueSetupProps {
  onVenueConfigured: (config: VenueConfig) => void;
}

export const VenueSetup: React.FC<VenueSetupProps> = ({ onVenueConfigured }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<Partial<VenueConfig>>({
    name: '',
    type: '',
    category: 'indoor',
    description: '',
    address: '',
    capacity: 1000,
    operatingHours: { start: '08:00', end: '22:00' },
    features: [],
    zones: [],
    emergencyContacts: [],
    customization: {
      primaryColor: '#3b82f6',
      welcomeMessage: 'Welcome to your venue!',
      languages: ['en']
    }
  });

  const handleVenueTypeSelect = (typeId: string) => {
    const selectedType = VENUE_TYPES.find(t => t.id === typeId);
    if (selectedType) {
      const zones = ZONE_TEMPLATES[typeId as keyof typeof ZONE_TEMPLATES]?.map((zoneName, index) => ({
        id: `zone-${index + 1}`,
        name: zoneName,
        capacity: Math.floor(config.capacity! / 4),
        type: 'general'
      })) || [];

      setConfig(prev => ({
        ...prev,
        type: typeId,
        zones
      }));
    }
  };

  const addZone = () => {
    const newZone = {
      id: `zone-${Date.now()}`,
      name: `Zone ${(config.zones?.length || 0) + 1}`,
      capacity: 100,
      type: 'general'
    };
    setConfig(prev => ({
      ...prev,
      zones: [...(prev.zones || []), newZone]
    }));
  };

  const updateZone = (zoneId: string, updates: Partial<typeof config.zones[0]>) => {
    setConfig(prev => ({
      ...prev,
      zones: prev.zones?.map(zone => 
        zone.id === zoneId ? { ...zone, ...updates } : zone
      ) || []
    }));
  };

  const addEmergencyContact = () => {
    const newContact = {
      name: '',
      role: '',
      phone: ''
    };
    setConfig(prev => ({
      ...prev,
      emergencyContacts: [...(prev.emergencyContacts || []), newContact]
    }));
  };

  const updateEmergencyContact = (index: number, updates: Partial<typeof config.emergencyContacts[0]>) => {
    setConfig(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts?.map((contact, i) => 
        i === index ? { ...contact, ...updates } : contact
      ) || []
    }));
  };

  const handleComplete = () => {
    if (!config.name || !config.type) {
      toast({
        title: "Missing Information",
        description: "Please provide venue name and type.",
        variant: "destructive"
      });
      return;
    }

    const completeConfig: VenueConfig = {
      id: `venue-${Date.now()}`,
      name: config.name!,
      type: config.type!,
      category: config.category!,
      description: config.description || '',
      address: config.address || '',
      capacity: config.capacity!,
      operatingHours: config.operatingHours!,
      features: config.features || [],
      zones: config.zones || [],
      emergencyContacts: config.emergencyContacts || [],
      customization: config.customization!
    };

    onVenueConfigured(completeConfig);
    toast({
      title: "Venue Configured",
      description: "Your venue has been set up successfully!",
    });
  };

  const selectedVenueType = VENUE_TYPES.find(t => t.id === config.type);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Venue Setup - Step {step} of 4
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`h-2 flex-1 rounded ${
                  stepNum <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="venueName">Venue Name</Label>
                  <Input
                    id="venueName"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your venue name"
                  />
                </div>

                <div>
                  <Label htmlFor="venueDescription">Description</Label>
                  <Textarea
                    id="venueDescription"
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your venue"
                  />
                </div>

                <div>
                  <Label htmlFor="venueAddress">Address</Label>
                  <Input
                    id="venueAddress"
                    value={config.address}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Venue address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Total Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={config.capacity}
                      onChange={(e) => setConfig(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={config.category} onValueChange={(value: 'indoor' | 'outdoor' | 'mixed') => 
                      setConfig(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Venue Type</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {VENUE_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={config.type === type.id ? "default" : "outline"}
                      className="h-20 flex flex-col gap-2"
                      onClick={() => handleVenueTypeSelect(type.id)}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm">{type.name}</span>
                    </Button>
                  );
                })}
              </div>

              {selectedVenueType && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Selected: <strong>{selectedVenueType.name}</strong>
                    {config.zones?.length > 0 && (
                      <span> - {config.zones.length} zones will be pre-configured</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Zone Configuration</h3>
                <Button onClick={addZone} variant="outline" size="sm">
                  Add Zone
                </Button>
              </div>

              <div className="space-y-3">
                {config.zones?.map((zone) => (
                  <Card key={zone.id} className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Zone Name</Label>
                        <Input
                          value={zone.name}
                          onChange={(e) => updateZone(zone.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Capacity</Label>
                        <Input
                          type="number"
                          value={zone.capacity}
                          onChange={(e) => updateZone(zone.id, { capacity: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select value={zone.type} onValueChange={(value) => updateZone(zone.id, { type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="restricted">Restricted</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Emergency Contacts & Customization</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Emergency Contacts</Label>
                  <Button onClick={addEmergencyContact} variant="outline" size="sm">
                    Add Contact
                  </Button>
                </div>

                {config.emergencyContacts?.map((contact, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => updateEmergencyContact(index, { name: e.target.value })}
                          placeholder="Contact name"
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Input
                          value={contact.role}
                          onChange={(e) => updateEmergencyContact(index, { role: e.target.value })}
                          placeholder="Security, Medical, etc."
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => updateEmergencyContact(index, { phone: e.target.value })}
                          placeholder="Phone number"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4">
                <div>
                  <Label>Welcome Message</Label>
                  <Textarea
                    value={config.customization?.welcomeMessage}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      customization: { ...prev.customization!, welcomeMessage: e.target.value }
                    }))}
                    placeholder="Welcome message for visitors"
                  />
                </div>

                <div>
                  <Label>Primary Color</Label>
                  <Input
                    type="color"
                    value={config.customization?.primaryColor}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      customization: { ...prev.customization!, primaryColor: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                <Save className="h-4 w-4 mr-2" />
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};