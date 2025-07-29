export interface SystemSettings {
  id: string;
  lastUpdated: Date;
  updatedBy: string;
  
  // Alert Configuration
  alertThresholds: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  
  // Emergency Settings
  emergencySettings: {
    panicButtonEnabled: boolean;
    autoEvacuationEnabled: boolean;
    emergencyContactsVisible: boolean;
    emergencyExitsVisible: boolean;
    requirePanicConfirmation: boolean;
    panicConfirmationTimeout: number; // seconds
  };
  
  // Zone Configuration
  zoneSettings: {
    [zoneId: string]: {
      name: string;
      capacity: number;
      isActive: boolean;
      alertsEnabled: boolean;
      accessRestricted: boolean;
      emergencyExitsCount: number;
    };
  };
  
  // Mobile App Settings
  mobileSettings: {
    offlineModeEnabled: boolean;
    locationTrackingEnabled: boolean;
    pushNotificationsEnabled: boolean;
    supportedLanguages: string[];
    defaultLanguage: string;
    mapRefreshInterval: number; // milliseconds
    routeRecalculationEnabled: boolean;
  };
  
  // System Announcements
  systemAnnouncements: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'emergency' | 'maintenance';
    targetAudience: 'all' | 'mobile_only' | 'admin_only';
    isActive: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    expiresAt: Date;
    createdAt: Date;
  }>;
  
  // Feature Flags
  featureFlags: {
    aiPredictionsEnabled: boolean;
    realTimeUpdatesEnabled: boolean;
    advancedAnalyticsEnabled: boolean;
    emergencyBroadcastEnabled: boolean;
    crowdHeatmapEnabled: boolean;
    routeOptimizationEnabled: boolean;
  };
}

class SettingsService {
  private currentSettings: SystemSettings;
  private subscribers: Map<string, (settings: SystemSettings) => void> = new Map();
  private isInitialized = false;

  constructor() {
    this.currentSettings = this.getDefaultSettings();
    this.initializeSettings();
  }

  private getDefaultSettings(): SystemSettings {
    return {
      id: 'system-settings-default',
      lastUpdated: new Date(),
      updatedBy: 'system',
      
      alertThresholds: {
        low: 40,
        medium: 65,
        high: 85,
        critical: 95
      },
      
      emergencySettings: {
        panicButtonEnabled: true,
        autoEvacuationEnabled: false,
        emergencyContactsVisible: true,
        emergencyExitsVisible: true,
        requirePanicConfirmation: true,
        panicConfirmationTimeout: 5
      },
      
      zoneSettings: {
        'entrance-main': {
          name: 'Main Entrance',
          capacity: 500,
          isActive: true,
          alertsEnabled: true,
          accessRestricted: false,
          emergencyExitsCount: 2
        },
        'food-court': {
          name: 'Food Court',
          capacity: 300,
          isActive: true,
          alertsEnabled: true,
          accessRestricted: false,
          emergencyExitsCount: 1
        },
        'central-hall': {
          name: 'Central Hall',
          capacity: 600,
          isActive: true,
          alertsEnabled: true,
          accessRestricted: false,
          emergencyExitsCount: 4
        }
      },
      
      mobileSettings: {
        offlineModeEnabled: true,
        locationTrackingEnabled: true,
        pushNotificationsEnabled: true,
        supportedLanguages: ['en', 'hi', 'te', 'ta'],
        defaultLanguage: 'en',
        mapRefreshInterval: 5000,
        routeRecalculationEnabled: true
      },
      
      systemAnnouncements: [
        {
          id: 'welcome-msg',
          title: 'Welcome to SCFMS',
          message: 'Smart Crowd Flow Management System is now active. Your safety is our priority.',
          type: 'info',
          targetAudience: 'all',
          isActive: true,
          priority: 'medium',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          createdAt: new Date()
        }
      ],
      
      featureFlags: {
        aiPredictionsEnabled: true,
        realTimeUpdatesEnabled: true,
        advancedAnalyticsEnabled: true,
        emergencyBroadcastEnabled: true,
        crowdHeatmapEnabled: true,
        routeOptimizationEnabled: true
      }
    };
  }

  private async initializeSettings(): Promise<void> {
    // In a real implementation, this would load from backend/database
    // For now, we'll use localStorage for persistence
    try {
      const stored = localStorage.getItem('scfms-system-settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        this.currentSettings = { ...this.currentSettings, ...parsedSettings };
      }
      this.isInitialized = true;
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.isInitialized = true;
    }
  }

  private persistSettings(): void {
    try {
      localStorage.setItem('scfms-system-settings', JSON.stringify(this.currentSettings));
    } catch (error) {
      console.error('Failed to persist settings:', error);
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback({ ...this.currentSettings });
      } catch (error) {
        console.error('Error notifying settings subscriber:', error);
      }
    });
  }

  // Public API
  getSettings(): SystemSettings {
    return { ...this.currentSettings };
  }

  async updateSettings(updates: Partial<SystemSettings>, updatedBy: string = 'admin'): Promise<void> {
    const newSettings = {
      ...this.currentSettings,
      ...updates,
      lastUpdated: new Date(),
      updatedBy
    };

    this.currentSettings = newSettings;
    this.persistSettings();
    this.notifySubscribers();

    // Broadcast settings change to all connected clients
    if (typeof window !== 'undefined' && (window as any).realTimeService) {
      (window as any).realTimeService.emit({
        type: 'settings_update',
        data: { settings: newSettings },
        timestamp: new Date(),
        priority: 'high'
      });
    }
  }

  // Alert Threshold Management
  async updateAlertThresholds(thresholds: Partial<SystemSettings['alertThresholds']>, updatedBy: string): Promise<void> {
    await this.updateSettings({
      alertThresholds: { ...this.currentSettings.alertThresholds, ...thresholds }
    }, updatedBy);
  }

  // Emergency Settings Management
  async updateEmergencySettings(settings: Partial<SystemSettings['emergencySettings']>, updatedBy: string): Promise<void> {
    await this.updateSettings({
      emergencySettings: { ...this.currentSettings.emergencySettings, ...settings }
    }, updatedBy);
  }

  // Zone Configuration Management
  async updateZoneSettings(zoneId: string, zoneSettings: Partial<SystemSettings['zoneSettings'][string]>, updatedBy: string): Promise<void> {
    const newZoneSettings = {
      ...this.currentSettings.zoneSettings,
      [zoneId]: { ...this.currentSettings.zoneSettings[zoneId], ...zoneSettings }
    };

    await this.updateSettings({
      zoneSettings: newZoneSettings
    }, updatedBy);
  }

  // Mobile Settings Management
  async updateMobileSettings(settings: Partial<SystemSettings['mobileSettings']>, updatedBy: string): Promise<void> {
    await this.updateSettings({
      mobileSettings: { ...this.currentSettings.mobileSettings, ...settings }
    }, updatedBy);
  }

  // System Announcements Management
  async addSystemAnnouncement(announcement: Omit<SystemSettings['systemAnnouncements'][0], 'id' | 'createdAt'>, updatedBy: string): Promise<string> {
    const newAnnouncement = {
      ...announcement,
      id: `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    };

    const newAnnouncements = [...this.currentSettings.systemAnnouncements, newAnnouncement];

    await this.updateSettings({
      systemAnnouncements: newAnnouncements
    }, updatedBy);

    return newAnnouncement.id;
  }

  async removeSystemAnnouncement(announcementId: string, updatedBy: string): Promise<void> {
    const newAnnouncements = this.currentSettings.systemAnnouncements.filter(
      announcement => announcement.id !== announcementId
    );

    await this.updateSettings({
      systemAnnouncements: newAnnouncements
    }, updatedBy);
  }

  async toggleAnnouncementStatus(announcementId: string, isActive: boolean, updatedBy: string): Promise<void> {
    const newAnnouncements = this.currentSettings.systemAnnouncements.map(announcement =>
      announcement.id === announcementId ? { ...announcement, isActive } : announcement
    );

    await this.updateSettings({
      systemAnnouncements: newAnnouncements
    }, updatedBy);
  }

  // Feature Flags Management
  async updateFeatureFlags(flags: Partial<SystemSettings['featureFlags']>, updatedBy: string): Promise<void> {
    await this.updateSettings({
      featureFlags: { ...this.currentSettings.featureFlags, ...flags }
    }, updatedBy);
  }

  // Subscription Management
  subscribe(subscriberId: string, callback: (settings: SystemSettings) => void): void {
    this.subscribers.set(subscriberId, callback);
    
    // Immediately call with current settings if initialized
    if (this.isInitialized) {
      callback({ ...this.currentSettings });
    }
  }

  unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
  }

  // Utility Methods
  getActiveAnnouncements(targetAudience?: string): SystemSettings['systemAnnouncements'] {
    const now = new Date();
    return this.currentSettings.systemAnnouncements.filter(announcement => 
      announcement.isActive && 
      announcement.expiresAt > now &&
      (!targetAudience || announcement.targetAudience === 'all' || announcement.targetAudience === targetAudience)
    );
  }

  getZoneThresholdStatus(currentDensity: number, capacity: number): 'low' | 'medium' | 'high' | 'critical' {
    const utilizationPercentage = (currentDensity / capacity) * 100;
    const thresholds = this.currentSettings.alertThresholds;

    if (utilizationPercentage >= thresholds.critical) return 'critical';
    if (utilizationPercentage >= thresholds.high) return 'high';
    if (utilizationPercentage >= thresholds.medium) return 'medium';
    return 'low';
  }

  isFeatureEnabled(feature: keyof SystemSettings['featureFlags']): boolean {
    return this.currentSettings.featureFlags[feature];
  }

  // Export/Import Settings
  exportSettings(): string {
    return JSON.stringify(this.currentSettings, null, 2);
  }

  async importSettings(settingsJson: string, updatedBy: string): Promise<void> {
    try {
      const importedSettings = JSON.parse(settingsJson) as SystemSettings;
      await this.updateSettings(importedSettings, updatedBy);
    } catch (error) {
      throw new Error('Invalid settings format');
    }
  }

  // Reset to defaults
  async resetToDefaults(updatedBy: string): Promise<void> {
    const defaultSettings = this.getDefaultSettings();
    await this.updateSettings(defaultSettings, updatedBy);
  }
}

export const settingsService = new SettingsService();