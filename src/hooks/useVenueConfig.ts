import { useState, useEffect } from 'react';
import { VenueConfig } from '@/components/admin/VenueSetup';

export interface VenueContextData {
  config: VenueConfig | null;
  loading: boolean;
  error: string | null;
  updateConfig: (config: VenueConfig) => void;
  clearConfig: () => void;
  isConfigured: boolean;
}

export function useVenueConfig(): VenueContextData {
  const [config, setConfig] = useState<VenueConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVenueConfig();
  }, []);

  const loadVenueConfig = () => {
    try {
      setLoading(true);
      setError(null);
      
      const stored = localStorage.getItem('venue-config');
      if (stored) {
        const parsedConfig = JSON.parse(stored) as VenueConfig;
        setConfig(parsedConfig);
        
        // Apply theme customization
        if (parsedConfig.customization?.primaryColor) {
          document.documentElement.style.setProperty(
            '--primary', 
            hexToHsl(parsedConfig.customization.primaryColor)
          );
        }
      }
    } catch (err) {
      setError('Failed to load venue configuration');
      console.error('Error loading venue config:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (newConfig: VenueConfig) => {
    try {
      localStorage.setItem('venue-config', JSON.stringify(newConfig));
      setConfig(newConfig);
      
      // Apply theme customization
      if (newConfig.customization?.primaryColor) {
        document.documentElement.style.setProperty(
          '--primary', 
          hexToHsl(newConfig.customization.primaryColor)
        );
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to save venue configuration');
      console.error('Error saving venue config:', err);
    }
  };

  const clearConfig = () => {
    try {
      localStorage.removeItem('venue-config');
      setConfig(null);
      
      // Reset theme to default
      document.documentElement.style.removeProperty('--primary');
      
      setError(null);
    } catch (err) {
      setError('Failed to clear venue configuration');
      console.error('Error clearing venue config:', err);
    }
  };

  return {
    config,
    loading,
    error,
    updateConfig,
    clearConfig,
    isConfigured: !!config
  };
}

// Helper function to convert hex to HSL for CSS custom properties
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Export venue types for external use
export const VENUE_TYPES = [
  'conference', 'concert', 'sports', 'university', 'airport', 'mall', 
  'office', 'hospital', 'transport', 'exhibition', 'entertainment', 
  'government', 'custom'
] as const;

export type VenueType = typeof VENUE_TYPES[number];