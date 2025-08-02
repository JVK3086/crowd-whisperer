import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Wifi,
  WifiOff,
  Map,
  AlertTriangle,
  Phone,
  CheckCircle,
  RefreshCw,
  MapPin,
  Navigation,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineData {
  maps: boolean;
  emergencyInfo: boolean;
  contacts: boolean;
  routes: boolean;
  lastUpdated: Date | null;
  size: number; // in MB
}

interface OfflineSupportProps {
  className?: string;
}

export const OfflineSupport = ({ className }: OfflineSupportProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    maps: false,
    emergencyInfo: false,
    contacts: false,
    routes: false,
    lastUpdated: null,
    size: 0
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Check if offline data exists
    const storedData = localStorage.getItem('scfms-offline-data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setOfflineData({
          ...parsed,
          lastUpdated: parsed.lastUpdated ? new Date(parsed.lastUpdated) : null
        });
      } catch (error) {
        console.error('Failed to parse offline data:', error);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const downloadOfflineData = async () => {
    if (!isOnline) {
      alert('Please connect to internet to download offline data');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Simulate downloading different components
      const components = ['maps', 'emergencyInfo', 'contacts', 'routes'];
      
      for (let i = 0; i < components.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDownloadProgress(((i + 1) / components.length) * 100);
        
        setOfflineData(prev => ({
          ...prev,
          [components[i]]: true
        }));
      }

      const finalData: OfflineData = {
        maps: true,
        emergencyInfo: true,
        contacts: true,
        routes: true,
        lastUpdated: new Date(),
        size: 25.3
      };

      setOfflineData(finalData);
      localStorage.setItem('scfms-offline-data', JSON.stringify(finalData));
      
    } catch (error) {
      console.error('Failed to download offline data:', error);
      alert('Failed to download offline data. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const clearOfflineData = () => {
    localStorage.removeItem('scfms-offline-data');
    setOfflineData({
      maps: false,
      emergencyInfo: false,
      contacts: false,
      routes: false,
      lastUpdated: null,
      size: 0
    });
  };

  const hasOfflineData = offlineData.maps && offlineData.emergencyInfo && offlineData.contacts && offlineData.routes;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Connection Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="font-medium">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-500" />
                <span className="font-medium">Offline</span>
              </>
            )}
          </div>
          
          <Badge variant={hasOfflineData ? 'default' : 'secondary'}>
            {hasOfflineData ? 'Offline Ready' : 'Not Downloaded'}
          </Badge>
        </div>
      </Card>

      {/* Offline Status Alert */}
      {!isOnline && (
        <Alert className={cn(
          hasOfflineData ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
        )}>
          {hasOfflineData ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <AlertDescription>
            {hasOfflineData ? (
              'You\'re offline but have access to downloaded venue data and emergency information.'
            ) : (
              'You\'re offline and don\'t have emergency data downloaded. Some features may be limited.'
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="download" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="download">Download</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="maps">Offline Maps</TabsTrigger>
        </TabsList>

        <TabsContent value="download" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Offline Data Download
            </h3>
            
            {isDownloading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Downloading offline data...</span>
                </div>
                <Progress value={downloadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(downloadProgress)}% complete
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download essential venue data for offline access including maps, emergency routes, and contact information.
                </p>
                
                {/* Download Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={cn(
                    "p-3 rounded-lg border",
                    offlineData.maps ? "bg-green-50 border-green-200" : "bg-gray-50"
                  )}>
                    <div className="flex items-center gap-2 text-sm">
                      <Map className="w-4 h-4" />
                      <span>Venue Maps</span>
                      {offlineData.maps && <CheckCircle className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-lg border",
                    offlineData.emergencyInfo ? "bg-green-50 border-green-200" : "bg-gray-50"
                  )}>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Emergency Info</span>
                      {offlineData.emergencyInfo && <CheckCircle className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-lg border",
                    offlineData.contacts ? "bg-green-50 border-green-200" : "bg-gray-50"
                  )}>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4" />
                      <span>Emergency Contacts</span>
                      {offlineData.contacts && <CheckCircle className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                  
                  <div className={cn(
                    "p-3 rounded-lg border",
                    offlineData.routes ? "bg-green-50 border-green-200" : "bg-gray-50"
                  )}>
                    <div className="flex items-center gap-2 text-sm">
                      <Navigation className="w-4 h-4" />
                      <span>Safe Routes</span>
                      {offlineData.routes && <CheckCircle className="w-3 h-3 text-green-500" />}
                    </div>
                  </div>
                </div>

                {offlineData.lastUpdated && (
                  <div className="text-xs text-muted-foreground">
                    Last updated: {offlineData.lastUpdated.toLocaleDateString()} at {offlineData.lastUpdated.toLocaleTimeString()}
                    <br />
                    Size: {offlineData.size} MB
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={downloadOfflineData}
                    disabled={!isOnline}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {hasOfflineData ? 'Update Data' : 'Download Data'}
                  </Button>
                  
                  {hasOfflineData && (
                    <Button variant="outline" onClick={clearOfflineData}>
                      Clear Data
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Emergency Information
            </h3>
            
            <div className="space-y-4">
              <Alert>
                <Phone className="w-4 h-4" />
                <AlertDescription>
                  <strong>Emergency Hotline:</strong> 112 (India Emergency Services)
                  <br />
                  <strong>Venue Security:</strong> +91-9876543210
                  <br />
                  <strong>Medical Emergency:</strong> +91-9876543211
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Emergency Assembly Points:</h4>
                <div className="grid gap-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="font-medium text-sm">Assembly Point A</div>
                        <div className="text-xs text-muted-foreground">Main Garden Area - North Side</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <div>
                        <div className="font-medium text-sm">Assembly Point B</div>
                        <div className="text-xs text-muted-foreground">Parking Area - South Side</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Emergency Procedures:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Stay calm and follow staff instructions</li>
                  <li>Move to the nearest emergency assembly point</li>
                  <li>Do not use elevators during emergency</li>
                  <li>Keep emergency exits clear</li>
                  <li>Report to assembly point coordinator</li>
                </ol>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="maps" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Map className="w-5 h-5" />
              Offline Venue Map
            </h3>
            
            {offlineData.maps ? (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <Map className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Offline map would be displayed here
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Key Locations:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Main Entrance</li>
                      <li>• Central Hall</li>
                      <li>• Food Court</li>
                      <li>• Emergency Exits</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Facilities:</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Restrooms</li>
                      <li>• First Aid Station</li>
                      <li>• Information Desk</li>
                      <li>• Prayer Halls</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <Download className="w-4 h-4" />
                <AlertDescription>
                  Offline maps not available. Please download offline data when connected to internet.
                </AlertDescription>
              </Alert>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};