import { useState, useEffect, useCallback } from 'react';
import { settingsService, SystemSettings } from '../services/settingsService';
import { realTimeService } from '../services/realTimeService';

export interface UseSettingsResult {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
  
  // Settings update methods
  updateAlertThresholds: (thresholds: Partial<SystemSettings['alertThresholds']>) => Promise<void>;
  updateEmergencySettings: (settings: Partial<SystemSettings['emergencySettings']>) => Promise<void>;
  updateZoneSettings: (zoneId: string, settings: Partial<SystemSettings['zoneSettings'][string]>) => Promise<void>;
  updateMobileSettings: (settings: Partial<SystemSettings['mobileSettings']>) => Promise<void>;
  updateFeatureFlags: (flags: Partial<SystemSettings['featureFlags']>) => Promise<void>;
  
  // Announcement management
  addAnnouncement: (announcement: Omit<SystemSettings['systemAnnouncements'][0], 'id' | 'createdAt'>) => Promise<string>;
  removeAnnouncement: (announcementId: string) => Promise<void>;
  toggleAnnouncementStatus: (announcementId: string, isActive: boolean) => Promise<void>;
  
  // Utility methods
  getActiveAnnouncements: (targetAudience?: string) => SystemSettings['systemAnnouncements'];
  getZoneThresholdStatus: (currentDensity: number, capacity: number) => 'low' | 'medium' | 'high' | 'critical';
  isFeatureEnabled: (feature: keyof SystemSettings['featureFlags']) => boolean;
  
  // Export/Import
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export function useSettings(autoSubscribe: boolean = true): UseSettingsResult {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subscriberId = `settings-hook-${Math.random().toString(36).substr(2, 9)}`;

  // Initialize settings and subscribe to updates
  useEffect(() => {
    if (!autoSubscribe) return;

    const handleSettingsUpdate = (updatedSettings: SystemSettings) => {
      setSettings(updatedSettings);
      setLoading(false);
      setError(null);
    };

    const handleError = (err: Error) => {
      setError(err.message || 'Failed to load settings');
      setLoading(false);
    };

    try {
      // Subscribe to settings updates
      settingsService.subscribe(subscriberId, handleSettingsUpdate);

      // Also listen for real-time settings updates
      const handleRealTimeSettingsUpdate = (event: { type: string; data: { settings?: unknown } }) => {
        if (event.type === 'settings_update' && event.data.settings) {
          setSettings(event.data.settings);
        }
      };

      realTimeService.subscribe('settings_update', handleRealTimeSettingsUpdate);

      // Get initial settings
      const currentSettings = settingsService.getSettings();
      setSettings(currentSettings);
      setLoading(false);

    } catch (err) {
      handleError(err);
    }

    return () => {
      settingsService.unsubscribe(subscriberId);
      realTimeService.unsubscribe('settings_update', handleRealTimeSettingsUpdate);
    };
  }, [subscriberId, autoSubscribe]);

  // Update methods with error handling
  const updateAlertThresholds = useCallback(async (thresholds: Partial<SystemSettings['alertThresholds']>) => {
    try {
      await settingsService.updateAlertThresholds(thresholds, 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert thresholds');
      throw err;
    }
  }, []);

  const updateEmergencySettings = useCallback(async (emergencySettings: Partial<SystemSettings['emergencySettings']>) => {
    try {
      await settingsService.updateEmergencySettings(emergencySettings, 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update emergency settings');
      throw err;
    }
  }, []);

  const updateZoneSettings = useCallback(async (zoneId: string, zoneSettings: Partial<SystemSettings['zoneSettings'][string]>) => {
    try {
      await settingsService.updateZoneSettings(zoneId, zoneSettings, 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update zone settings');
      throw err;
    }
  }, []);

  const updateMobileSettings = useCallback(async (mobileSettings: Partial<SystemSettings['mobileSettings']>) => {
    try {
      await settingsService.updateMobileSettings(mobileSettings, 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mobile settings');
      throw err;
    }
  }, []);

  const updateFeatureFlags = useCallback(async (flags: Partial<SystemSettings['featureFlags']>) => {
    try {
      await settingsService.updateFeatureFlags(flags, 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feature flags');
      throw err;
    }
  }, []);

  // Announcement management
  const addAnnouncement = useCallback(async (announcement: Omit<SystemSettings['systemAnnouncements'][0], 'id' | 'createdAt'>) => {
    try {
      return await settingsService.addSystemAnnouncement(announcement, 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add announcement');
      throw err;
    }
  }, []);

  const removeAnnouncement = useCallback(async (announcementId: string) => {
    try {
      await settingsService.removeSystemAnnouncement(announcementId, 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove announcement');
      throw err;
    }
  }, []);

  const toggleAnnouncementStatus = useCallback(async (announcementId: string, isActive: boolean) => {
    try {
      await settingsService.toggleAnnouncementStatus(announcementId, isActive, 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle announcement status');
      throw err;
    }
  }, []);

  // Utility methods
  const getActiveAnnouncements = useCallback((targetAudience?: string) => {
    return settingsService.getActiveAnnouncements(targetAudience);
  }, []);

  const getZoneThresholdStatus = useCallback((currentDensity: number, capacity: number) => {
    return settingsService.getZoneThresholdStatus(currentDensity, capacity);
  }, []);

  const isFeatureEnabled = useCallback((feature: keyof SystemSettings['featureFlags']) => {
    return settingsService.isFeatureEnabled(feature);
  }, []);

  // Export/Import methods
  const exportSettings = useCallback(() => {
    return settingsService.exportSettings();
  }, []);

  const importSettings = useCallback(async (settingsJson: string) => {
    try {
      await settingsService.importSettings(settingsJson, 'admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import settings');
      throw err;
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    try {
      await settingsService.resetToDefaults('admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
      throw err;
    }
  }, []);

  return {
    settings,
    loading,
    error,
    updateAlertThresholds,
    updateEmergencySettings,
    updateZoneSettings,
    updateMobileSettings,
    updateFeatureFlags,
    addAnnouncement,
    removeAnnouncement,
    toggleAnnouncementStatus,
    getActiveAnnouncements,
    getZoneThresholdStatus,
    isFeatureEnabled,
    exportSettings,
    importSettings,
    resetToDefaults
  };
}

// Specialized hook for mobile app settings
export function useMobileSettings() {
  const { settings, loading, error, isFeatureEnabled } = useSettings();

  const mobileSettings = settings?.mobileSettings;
  const emergencySettings = settings?.emergencySettings;
  const alertThresholds = settings?.alertThresholds;
  const activeAnnouncements = settings ? settingsService.getActiveAnnouncements('mobile_only') : [];

  return {
    mobileSettings,
    emergencySettings,
    alertThresholds,
    activeAnnouncements,
    loading,
    error,
    isFeatureEnabled,
    isLocationTrackingEnabled: mobileSettings?.locationTrackingEnabled ?? true,
    isPanicButtonEnabled: emergencySettings?.panicButtonEnabled ?? true,
    isPushNotificationsEnabled: mobileSettings?.pushNotificationsEnabled ?? true,
    mapRefreshInterval: mobileSettings?.mapRefreshInterval ?? 5000,
    panicConfirmationTimeout: emergencySettings?.panicConfirmationTimeout ?? 5,
    supportedLanguages: mobileSettings?.supportedLanguages ?? ['en'],
    defaultLanguage: mobileSettings?.defaultLanguage ?? 'en'
  };
}

// Specialized hook for admin settings management
export function useAdminSettings() {
  const hookResult = useSettings();

  return {
    ...hookResult,
    // Additional admin-specific methods can be added here
    bulkUpdateSettings: async (updates: Partial<SystemSettings>) => {
      await settingsService.updateSettings(updates, 'admin');
    }
  };
}