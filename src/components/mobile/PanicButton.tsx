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
  CheckCircle
} from 'lucide-react';
import { emergencyManagementService } from '../../services/emergencyManagement';
import { cn } from '@/lib/utils';

interface PanicButtonProps {
  className?: string;
}

interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

export const PanicButton = ({ className }: PanicButtonProps) => {
  const [isActivating, setIsActivating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emergencyId, setEmergencyId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    isLoading: false
  });

  // Get user location
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
    } else {
      setLocation(prev => ({
        ...prev,
        error: 'Location services not supported',
        isLoading: false
      }));
    }
  }, []);

  const handlePanicPress = () => {
    if (isActivating) return;
    
    setShowConfirmation(true);
    setCountdown(5);
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          activatePanic();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-cancel if user doesn't confirm within 5 seconds
    setTimeout(() => {
      if (showConfirmation) {
        setShowConfirmation(false);
        clearInterval(timer);
      }
    }, 5000);
  };

  const activatePanic = async () => {
    setIsActivating(true);
    setShowConfirmation(false);

    try {
      const deviceId = navigator.userAgent + Date.now();
      const panicLocation = location.lat && location.lng 
        ? { lat: location.lat, lng: location.lng }
        : { lat: 28.6139, lng: 77.2090 }; // Default location if GPS unavailable

      const alertId = await emergencyManagementService.triggerPanicButton(
        panicLocation,
        deviceId,
        'mobile-user-' + Math.random().toString(36).substr(2, 9)
      );

      setEmergencyId(alertId);
      
      // Show success for 3 seconds, then reset
      setTimeout(() => {
        setEmergencyId(null);
        setIsActivating(false);
      }, 3000);

    } catch (error) {
      console.error('Failed to activate panic button:', error);
      setIsActivating(false);
      alert('Failed to send emergency alert. Please try calling emergency services directly.');
    }
  };

  const cancelPanic = () => {
    setShowConfirmation(false);
    setCountdown(5);
  };

  if (emergencyId) {
    return (
      <Card className={cn("p-6 text-center bg-green-50 border-green-200", className)}>
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Emergency Alert Sent
        </h3>
        <p className="text-green-700 mb-4">
          Your location has been shared with emergency responders. Help is on the way.
        </p>
        <div className="space-y-2 text-sm text-green-600">
          <div>Alert ID: {emergencyId.slice(-8)}</div>
          {location.lat && location.lng && (
            <div className="flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3" />
              Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}
        </div>
      </Card>
    );
  }

  if (showConfirmation) {
    return (
      <Card className={cn("p-6 text-center bg-red-50 border-red-200", className)}>
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Confirm Emergency Alert
        </h3>
        <p className="text-red-700 mb-4">
          Emergency alert will be sent in <span className="font-bold text-2xl">{countdown}</span> seconds
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button
            variant="destructive"
            onClick={activatePanic}
            disabled={isActivating}
          >
            Send Alert Now
          </Button>
          <Button
            variant="outline"
            onClick={cancelPanic}
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

  return (
    <Card className={cn("p-6 text-center", className)}>
      <div className="mb-6">
        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-red-700 transition-colors">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Emergency Panic Button</h3>
        <p className="text-muted-foreground text-sm">
          Press and hold in case of emergency. Your location will be shared with authorities.
        </p>
      </div>

      <Button
        size="lg"
        variant="destructive"
        className="w-full h-16 text-lg font-semibold"
        onClick={handlePanicPress}
        disabled={isActivating || location.isLoading}
      >
        {isActivating ? (
          <>
            <Clock className="w-5 h-5 mr-2 animate-spin" />
            Sending Alert...
          </>
        ) : (
          <>
            <AlertTriangle className="w-5 h-5 mr-2" />
            EMERGENCY ALERT
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
          For immediate help: Call 112 (India Emergency)
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