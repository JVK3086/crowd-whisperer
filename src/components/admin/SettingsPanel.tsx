import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAdminSettings } from '@/hooks/useSettings';
import { 
  Settings, 
  AlertTriangle, 
  Shield, 
  Smartphone, 
  Bell, 
  ToggleLeft,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const SettingsPanel = () => {
  const {
    settings,
    loading,
    error,
    updateAlertThresholds,
    updateEmergencySettings,
    updateMobileSettings,
    updateFeatureFlags,
    addAnnouncement,
    removeAnnouncement,
    toggleAnnouncementStatus,
    exportSettings,
    importSettings,
    resetToDefaults
  } = useAdminSettings();

  const [activeTab, setActiveTab] = useState('thresholds');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    targetAudience: 'all' as const,
    priority: 'medium' as const,
    expiresAt: ''
  });

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading settings...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Alert className="border-destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>Error loading settings: {error}</AlertDescription>
        </Alert>
      </Card>
    );
  }

  if (!settings) return null;

  const handleSave = async (updateFn: () => Promise<void>, successMsg: string) => {
    setIsSaving(true);
    try {
      await updateFn();
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;

    await handleSave(async () => {
      await addAnnouncement({
        ...newAnnouncement,
        expiresAt: newAnnouncement.expiresAt 
          ? new Date(newAnnouncement.expiresAt)
          : new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true
      });
      setNewAnnouncement({
        title: '',
        message: '',
        type: 'info',
        targetAudience: 'all',
        priority: 'medium',
        expiresAt: ''
      });
    }, 'Announcement added successfully');
  };

  const handleExportSettings = () => {
    const settingsJson = exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scfms-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const settingsJson = e.target?.result as string;
        await handleSave(
          () => importSettings(settingsJson),
          'Settings imported successfully'
        );
      } catch (err) {
        console.error('Failed to import settings:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            <h2 className="text-xl font-semibold">System Settings</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportSettings}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleSave(resetToDefaults, 'Settings reset to defaults')}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="thresholds">Alert Thresholds</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
            <TabsTrigger value="mobile">Mobile App</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Alert Thresholds Tab */}
          <TabsContent value="thresholds" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Crowd Density Thresholds
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="low-threshold">Low (%)</Label>
                      <Input
                        id="low-threshold"
                        type="number"
                        value={settings.alertThresholds.low}
                        onChange={(e) => updateAlertThresholds({
                          low: parseInt(e.target.value)
                        })}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="medium-threshold">Medium (%)</Label>
                      <Input
                        id="medium-threshold"
                        type="number"
                        value={settings.alertThresholds.medium}
                        onChange={(e) => updateAlertThresholds({
                          medium: parseInt(e.target.value)
                        })}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="high-threshold">High (%)</Label>
                      <Input
                        id="high-threshold"
                        type="number"
                        value={settings.alertThresholds.high}
                        onChange={(e) => updateAlertThresholds({
                          high: parseInt(e.target.value)
                        })}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="critical-threshold">Critical (%)</Label>
                      <Input
                        id="critical-threshold"
                        type="number"
                        value={settings.alertThresholds.critical}
                        onChange={(e) => updateAlertThresholds({
                          critical: parseInt(e.target.value)
                        })}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Threshold Preview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-green-100">
                    <span className="text-green-800">Low Density</span>
                    <span className="text-sm">&lt; {settings.alertThresholds.low}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-yellow-100">
                    <span className="text-yellow-800">Medium Density</span>
                    <span className="text-sm">{settings.alertThresholds.low}% - {settings.alertThresholds.medium}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-orange-100">
                    <span className="text-orange-800">High Density</span>
                    <span className="text-sm">{settings.alertThresholds.medium}% - {settings.alertThresholds.high}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-red-100">
                    <span className="text-red-800">Critical Density</span>
                    <span className="text-sm">&gt; {settings.alertThresholds.high}%</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Emergency Settings Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Emergency Response Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Panic Button Enabled</Label>
                    <p className="text-sm text-muted-foreground">Allow users to send emergency alerts</p>
                  </div>
                  <Switch
                    checked={settings.emergencySettings.panicButtonEnabled}
                    onCheckedChange={(checked) => updateEmergencySettings({
                      panicButtonEnabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Panic Confirmation</Label>
                    <p className="text-sm text-muted-foreground">Show confirmation dialog before sending alert</p>
                  </div>
                  <Switch
                    checked={settings.emergencySettings.requirePanicConfirmation}
                    onCheckedChange={(checked) => updateEmergencySettings({
                      requirePanicConfirmation: checked
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmation-timeout">Confirmation Timeout (seconds)</Label>
                  <Input
                    id="confirmation-timeout"
                    type="number"
                    value={settings.emergencySettings.panicConfirmationTimeout}
                    onChange={(e) => updateEmergencySettings({
                      panicConfirmationTimeout: parseInt(e.target.value)
                    })}
                    min="1"
                    max="30"
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Evacuation Enabled</Label>
                    <p className="text-sm text-muted-foreground">Automatically trigger evacuation for critical alerts</p>
                  </div>
                  <Switch
                    checked={settings.emergencySettings.autoEvacuationEnabled}
                    onCheckedChange={(checked) => updateEmergencySettings({
                      autoEvacuationEnabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emergency Contacts Visible</Label>
                    <p className="text-sm text-muted-foreground">Show emergency contact numbers in mobile app</p>
                  </div>
                  <Switch
                    checked={settings.emergencySettings.emergencyContactsVisible}
                    onCheckedChange={(checked) => updateEmergencySettings({
                      emergencyContactsVisible: checked
                    })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Mobile Settings Tab */}
          <TabsContent value="mobile" className="space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Mobile App Configuration
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Offline Mode Enabled</Label>
                    <p className="text-sm text-muted-foreground">Allow app to work without internet connection</p>
                  </div>
                  <Switch
                    checked={settings.mobileSettings.offlineModeEnabled}
                    onCheckedChange={(checked) => updateMobileSettings({
                      offlineModeEnabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Location Tracking</Label>
                    <p className="text-sm text-muted-foreground">Track user location for navigation and emergency response</p>
                  </div>
                  <Switch
                    checked={settings.mobileSettings.locationTrackingEnabled}
                    onCheckedChange={(checked) => updateMobileSettings({
                      locationTrackingEnabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send real-time alerts and notifications</p>
                  </div>
                  <Switch
                    checked={settings.mobileSettings.pushNotificationsEnabled}
                    onCheckedChange={(checked) => updateMobileSettings({
                      pushNotificationsEnabled: checked
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Route Recalculation</Label>
                    <p className="text-sm text-muted-foreground">Automatically recalculate routes based on crowd changes</p>
                  </div>
                  <Switch
                    checked={settings.mobileSettings.routeRecalculationEnabled}
                    onCheckedChange={(checked) => updateMobileSettings({
                      routeRecalculationEnabled: checked
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="map-refresh">Map Refresh Interval (milliseconds)</Label>
                  <Input
                    id="map-refresh"
                    type="number"
                    value={settings.mobileSettings.mapRefreshInterval}
                    onChange={(e) => updateMobileSettings({
                      mapRefreshInterval: parseInt(e.target.value)
                    })}
                    min="1000"
                    max="60000"
                    step="1000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="default-language">Default Language</Label>
                  <Select
                    value={settings.mobileSettings.defaultLanguage}
                    onValueChange={(value) => updateMobileSettings({
                      defaultLanguage: value
                    })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                      <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                System Announcements
              </h3>

              {/* Add New Announcement */}
              <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium">Add New Announcement</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="announcement-title">Title</Label>
                    <Input
                      id="announcement-title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                      placeholder="Announcement title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="announcement-expires">Expires At</Label>
                    <Input
                      id="announcement-expires"
                      type="datetime-local"
                      value={newAnnouncement.expiresAt}
                      onChange={(e) => setNewAnnouncement(prev => ({
                        ...prev,
                        expiresAt: e.target.value
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="announcement-message">Message</Label>
                  <Textarea
                    id="announcement-message"
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement(prev => ({
                      ...prev,
                      message: e.target.value
                    }))}
                    placeholder="Announcement message"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newAnnouncement.type}
                      onValueChange={(value: any) => setNewAnnouncement(prev => ({
                        ...prev,
                        type: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Audience</Label>
                    <Select
                      value={newAnnouncement.targetAudience}
                      onValueChange={(value: any) => setNewAnnouncement(prev => ({
                        ...prev,
                        targetAudience: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="mobile_only">Mobile Only</SelectItem>
                        <SelectItem value="admin_only">Admin Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newAnnouncement.priority}
                      onValueChange={(value: any) => setNewAnnouncement(prev => ({
                        ...prev,
                        priority: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleAddAnnouncement}
                  disabled={!newAnnouncement.title || !newAnnouncement.message}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Announcement
                </Button>
              </div>

              {/* Existing Announcements */}
              <div className="space-y-3">
                {settings.systemAnnouncements.map(announcement => (
                  <div key={announcement.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <Badge variant={announcement.type === 'emergency' ? 'destructive' : 'secondary'}>
                            {announcement.type}
                          </Badge>
                          <Badge variant="outline">
                            {announcement.targetAudience}
                          </Badge>
                          {announcement.isActive ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{announcement.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Priority: {announcement.priority}</span>
                          <span>Expires: {new Date(announcement.expiresAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAnnouncementStatus(announcement.id, !announcement.isActive)}
                        >
                          {announcement.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAnnouncement(announcement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ToggleLeft className="w-5 h-5" />
                Feature Flags
              </h3>
              <div className="space-y-4">
                {Object.entries(settings.featureFlags).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <div>
                      <Label>{feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                      <p className="text-sm text-muted-foreground">
                        {getFeatureDescription(feature)}
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => updateFeatureFlags({
                        [feature]: checked
                      } as any)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

function getFeatureDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    aiPredictionsEnabled: 'Enable AI-powered crowd predictions and analytics',
    realTimeUpdatesEnabled: 'Enable real-time data updates and notifications',
    advancedAnalyticsEnabled: 'Enable advanced analytics and reporting features',
    emergencyBroadcastEnabled: 'Enable emergency broadcast messaging system',
    crowdHeatmapEnabled: 'Enable crowd density heatmap visualization',
    routeOptimizationEnabled: 'Enable AI-powered route optimization for mobile app'
  };
  return descriptions[feature] || 'Feature configuration option';
}