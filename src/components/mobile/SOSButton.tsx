import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  MapPin, 
  Phone,
  Shield,
  Clock,
  CheckCircle,
  Siren,
  Heart,
  Users
} from 'lucide-react';
import { emergencyManagementService } from '../../services/emergencyManagement';
import { cn } from '@/lib/utils';

interface SOSButtonProps {
  className?: string;
}

interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

type EmergencyType = 'medical' | 'disaster' | 'security' | 'general';

export const SOSButton = ({ className }: SOSButtonProps) => {
  const [isActivating, setIsActivating] = useState(false);
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emergencyId, setEmergencyId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    isLoading: false
  });

  useEffect(() => {
    if ('geolocation' in navigator) {
      setLocation(prev => ({ ...prev, isLoading: true }));
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            error: null,
            isLoading: false
          });
        },
        (error) => {
          setLocation(prev => ({
            ...prev,
            error: 'Unable to get location. Please enable GPS.',
            isLoading: false
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  }, []);

  const handleSOSPress = () => {
    if (isActivating) return;
    setShowTypeSelection(true);
  };

  const handleTypeSelect = (type: EmergencyType) => {
    setSelectedType(type);
    setShowTypeSelection(false);
    setShowConfirmation(true);
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          activateSOS(type);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      if (showConfirmation) {
        setShowConfirmation(false);
        clearInterval(timer);
      }
    }, 3000);
  };

  const activateSOS = async (type: EmergencyType) => {
    setIsActivating(true);
    setShowConfirmation(false);

    try {
      const deviceId = navigator.userAgent + Date.now();
      const sosLocation = location.lat && location.lng 
        ? { lat: location.lat, lng: location.lng }
        : { lat: 28.6139, lng: 77.2090 };

      const alertId = await emergencyManagementService.triggerSOS(
        sosLocation,
        type,
        deviceId,
        'mobile-user-' + Math.random().toString(36).substr(2, 9)
      );

      setEmergencyId(alertId);
      
      setTimeout(() => {
        setEmergencyId(null);
        setIsActivating(false);
        setSelectedType(null);
      }, 5000);

    } catch (error) {
      console.error('Failed to activate SOS:', error);
      setIsActivating(false);
      alert('Failed to send SOS alert. Please try calling emergency services directly.');
    }
  };

  const cancelSOS = () => {
    setShowConfirmation(false);
    setShowTypeSelection(false);
    setSelectedType(null);
    setCountdown(3);
  };

  const getEmergencyTypeInfo = (type: EmergencyType) => {
    switch (type) {
      case 'medical':
        return {
          icon: Heart,
          title: 'Medical Emergency',
          description: 'Medical team will be dispatched immediately',
          color: 'text-red-600'
        };
      case 'disaster':
        return {
          icon: Siren,
          title: 'Disaster/Crowd Control',
          description: 'Disaster recovery team will respond',
          color: 'text-orange-600'
        };
      case 'security':
        return {
          icon: Shield,
          title: 'Security Emergency',
          description: 'Security team will be alerted',
          color: 'text-blue-600'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'General Emergency',
          description: 'All emergency teams will be notified',
          color: 'text-yellow-600'
        };
    }
  };

  if (emergencyId) {
    const typeInfo = selectedType ? getEmergencyTypeInfo(selectedType) : getEmergencyTypeInfo('general');
    const Icon = typeInfo.icon;
    
    return (
      <Card className={cn("p-6 text-center bg-success/10 border-success", className)}>
        <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          SOS Alert Sent
        </h3>
        <p className="text-muted-foreground mb-4">
          {typeInfo.description}. Help is on the way.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>Alert ID: {emergencyId.slice(-8)}</div>
          <div className="flex items-center justify-center gap-2">
            <Icon className="w-4 h-4" />
            <span>{typeInfo.title}</span>
          </div>
          {location.lat && location.lng && (
            <div className="flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              Location shared with emergency teams
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (showConfirmation && selectedType) {
    const typeInfo = getEmergencyTypeInfo(selectedType);
    const Icon = typeInfo.icon;
    
    return (
      <Card className={cn("p-6 text-center bg-destructive/10 border-destructive", className)}>
        <Icon className={cn("w-12 h-12 mx-auto mb-4 animate-pulse", typeInfo.color)} />
        <h3 className="text-lg font-semibold mb-2">
          Confirm {typeInfo.title}
        </h3>
        <p className="text-muted-foreground mb-4">
          Alert will be sent in <span className="font-bold text-2xl">{countdown}</span> seconds
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button
            variant="destructive"
            onClick={() => activateSOS(selectedType)}
            disabled={isActivating}
          >
            Send Alert Now
          </Button>
          <Button
            variant="outline"
            onClick={cancelSOS}
          >
            Cancel
          </Button>
        </div>

        {location.error && (
          <Alert className="mt-4 text-left">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              {location.error}
            </AlertDescription>
          </Alert>
        )}
      </Card>
    );
  }

  if (showTypeSelection) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2">Select Emergency Type</h3>
          <p className="text-sm text-muted-foreground">
            Choose the type of emergency to alert the appropriate team
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:border-red-500"
            onClick={() => handleTypeSelect('medical')}
          >
            <Heart className="w-8 h-8 text-red-600" />
            <span className="text-sm font-semibold">Medical Emergency</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 hover:border-orange-500"
            onClick={() => handleTypeSelect('disaster')}
          >
            <Siren className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-semibold">Crowd Control</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-500"
            onClick={() => handleTypeSelect('security')}
          >
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-semibold">Security Issue</span>
          </Button>

          <Button
            variant="outline"
            className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-yellow-50 hover:border-yellow-500"
            onClick={() => handleTypeSelect('general')}
          >
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <span className="text-sm font-semibold">General SOS</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={cancelSOS}
        >
          Cancel
        </Button>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 text-center", className)}>
      <div className="mb-6">
        <div className="w-20 h-20 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-destructive/90 transition-colors animate-pulse">
          <Siren className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Emergency SOS</h3>
        <p className="text-muted-foreground text-sm">
          For political rally emergencies. Alert medical teams, disaster recovery, or security personnel.
        </p>
      </div>

      <Button
        size="lg"
        variant="destructive"
        className="w-full h-16 text-lg font-semibold"
        onClick={handleSOSPress}
        disabled={isActivating || location.isLoading}
      >
        {isActivating ? (
          <>
            <Clock className="w-5 h-5 mr-2 animate-spin" />
            Sending Alert...
          </>
        ) : (
          <>
            <Siren className="w-5 h-5 mr-2" />
            PRESS FOR SOS
          </>
        )}
      </Button>

      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3" />
          {location.isLoading ? (
            'Getting location...'
          ) : location.lat && location.lng ? (
            `Location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
          ) : (
            'Location unavailable'
          )}
        </div>
        
        <div className="flex items-center justify-center gap-1">
          <Phone className="w-3 h-3" />
          Emergency Hotline: 112 / 100
        </div>

        <div className="mt-4 p-2 bg-muted rounded-md">
          <Users className="w-4 h-4 mx-auto mb-1" />
          <p className="text-xs">
            Medical • Disaster Recovery • Security Teams
          </p>
        </div>
      </div>

      {location.error && (
        <Alert className="mt-4 text-left">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-xs">
            {location.error}
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
};