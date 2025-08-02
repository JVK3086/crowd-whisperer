import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  QrCode, 
  Camera, 
  MapPin, 
  Info, 
  Navigation,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  className?: string;
}

interface QRResult {
  type: 'location' | 'event' | 'emergency' | 'info';
  title: string;
  description: string;
  data: any;
}

export const QRScanner = ({ className }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<QRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Mock QR detection after 3 seconds for demo
      setTimeout(() => {
        const mockResults: QRResult[] = [
          {
            type: 'location',
            title: 'Central Hall - Zone A',
            description: 'Current crowd density: 45% | Meditation session in progress',
            data: { zone: 'central-hall-a', density: 45, event: 'meditation' }
          },
          {
            type: 'event',
            title: 'Evening Discourse',
            description: 'Starts at 6:00 PM | Central Auditorium | 200 seats available',
            data: { event: 'discourse', time: '18:00', venue: 'auditorium', seats: 200 }
          },
          {
            type: 'emergency',
            title: 'Emergency Assembly Point B',
            description: 'Capacity: 500 people | Next exit: 50m east',
            data: { type: 'assembly', capacity: 500, exits: ['east-exit'] }
          }
        ];
        
        setScanResult(mockResults[Math.floor(Math.random() * mockResults.length)]);
        stopScanning();
      }, 3000);

    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      setIsScanning(false);
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const closeResult = () => {
    setScanResult(null);
  };

  const getResultIcon = (type: QRResult['type']) => {
    switch (type) {
      case 'location': return <MapPin className="w-6 h-6 text-blue-500" />;
      case 'event': return <Info className="w-6 h-6 text-green-500" />;
      case 'emergency': return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default: return <Info className="w-6 h-6 text-gray-500" />;
    }
  };

  const getResultColor = (type: QRResult['type']) => {
    switch (type) {
      case 'location': return 'border-blue-200 bg-blue-50';
      case 'event': return 'border-green-200 bg-green-50';
      case 'emergency': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">QR Code Scanner</h3>
            <p className="text-muted-foreground text-sm">
              Scan QR codes around the venue for location info, event details, and navigation assistance.
            </p>
          </div>

          <Button
            size="lg"
            onClick={startScanning}
            disabled={isScanning}
            className="w-full"
          >
            <Camera className="w-5 h-5 mr-2" />
            {isScanning ? 'Scanning...' : 'Start Scanning'}
          </Button>

          {error && (
            <Alert className="text-left">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Camera Preview Dialog */}
      <Dialog open={isScanning} onOpenChange={stopScanning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scanning QR Code</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Scanning overlay */}
              <div className="absolute inset-0 border-2 border-white/30 rounded-lg">
                <div className="absolute inset-4 border-2 border-white rounded-lg animate-pulse" />
              </div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground">
              Position the QR code within the frame
            </p>
            
            <Button variant="outline" onClick={stopScanning} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan Result Dialog */}
      <Dialog open={!!scanResult} onOpenChange={closeResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              QR Code Scanned
            </DialogTitle>
          </DialogHeader>
          
          {scanResult && (
            <div className="space-y-4">
              <Card className={cn("p-4", getResultColor(scanResult.type))}>
                <div className="flex items-start gap-3">
                  {getResultIcon(scanResult.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{scanResult.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {scanResult.description}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex gap-2">
                {scanResult.type === 'location' && (
                  <Button className="flex-1">
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate Here
                  </Button>
                )}
                
                {scanResult.type === 'event' && (
                  <Button className="flex-1">
                    <Info className="w-4 h-4 mr-2" />
                    Event Details
                  </Button>
                )}
                
                {scanResult.type === 'emergency' && (
                  <Button variant="destructive" className="flex-1">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Info
                  </Button>
                )}
                
                <Button variant="outline" onClick={closeResult}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};