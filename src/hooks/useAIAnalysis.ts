import { useState, useEffect, useCallback } from 'react';
import { aiCrowdAnalysisService, AIAnalysisResult, PredictiveAlert } from '../services/aiCrowdAnalysis';

export interface AIAnalysisState {
  data: AIAnalysisResult | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useAIAnalysis(refreshInterval: number = 30000) {
  const [state, setState] = useState<AIAnalysisState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchAnalysis = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await aiCrowdAnalysisService.analyzeCrowdDensity();
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
    
    const interval = setInterval(fetchAnalysis, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAnalysis, refreshInterval]);

  return {
    ...state,
    refresh: fetchAnalysis
  };
}

export function useCrowdPrediction(zoneId: string | null, timeHorizon: number = 30) {
  const [predictions, setPredictions] = useState<Array<{
    time: Date;
    predictedDensity: number;
    confidence: number;
  }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchPredictions = useCallback(async () => {
    if (!zoneId) return;
    
    setLoading(true);
    try {
      const result = await aiCrowdAnalysisService.getCrowdPrediction(zoneId, timeHorizon);
      setPredictions(result.predictions);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
    } finally {
      setLoading(false);
    }
  }, [zoneId, timeHorizon]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return { predictions, loading, refresh: fetchPredictions };
}

export function useAlertManager() {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const addAlert = useCallback((alert: PredictiveAlert) => {
    setAlerts(prev => [...prev, alert]);
  }, []);

  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => !acknowledgedAlerts.has(alert.id));
  }, [alerts, acknowledgedAlerts]);

  const getCriticalAlerts = useCallback(() => {
    return getActiveAlerts().filter(alert => alert.severity === 'emergency');
  }, [getActiveAlerts]);

  return {
    alerts,
    acknowledgeAlert,
    dismissAlert,
    addAlert,
    getActiveAlerts,
    getCriticalAlerts,
    acknowledgedAlerts
  };
}