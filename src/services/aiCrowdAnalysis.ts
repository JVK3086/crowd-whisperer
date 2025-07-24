export interface CrowdDensityData {
  zoneId: string;
  zoneName: string;
  currentDensity: number;
  maxCapacity: number;
  utilizationPercentage: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PredictiveAlert {
  id: string;
  type: 'overcrowding' | 'bottleneck' | 'panic' | 'surge';
  severity: 'warning' | 'critical' | 'emergency';
  zoneId: string;
  zoneName: string;
  message: string;
  predictedTime: Date;
  confidence: number;
  recommendedActions: string[];
  affectedCapacity: number;
}

export interface AIAnalysisResult {
  crowdDensity: CrowdDensityData[];
  predictiveAlerts: PredictiveAlert[];
  anomalies: Array<{
    id: string;
    type: string;
    location: string;
    severity: string;
    description: string;
  }>;
  recommendations: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
  }>;
}

class AICrowdAnalysisService {
  private apiEndpoint = '/api/ai-analysis';
  
  // Simulate AI analysis with realistic data
  async analyzeCrowdDensity(): Promise<AIAnalysisResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const zones = [
      { id: 'entrance-main', name: 'Main Entrance', maxCapacity: 500 },
      { id: 'hall-central', name: 'Central Hall', maxCapacity: 2000 },
      { id: 'exit-north', name: 'North Exit', maxCapacity: 300 },
      { id: 'exit-south', name: 'South Exit', maxCapacity: 400 },
      { id: 'stairs-main', name: 'Main Staircase', maxCapacity: 200 },
      { id: 'platform-east', name: 'East Platform', maxCapacity: 800 }
    ];
    
    const crowdDensity: CrowdDensityData[] = zones.map(zone => {
      const currentDensity = Math.floor(Math.random() * zone.maxCapacity * 1.2);
      const utilizationPercentage = (currentDensity / zone.maxCapacity) * 100;
      
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (utilizationPercentage < 50) riskLevel = 'low';
      else if (utilizationPercentage < 75) riskLevel = 'medium';
      else if (utilizationPercentage < 90) riskLevel = 'high';
      else riskLevel = 'critical';
      
      return {
        zoneId: zone.id,
        zoneName: zone.name,
        currentDensity,
        maxCapacity: zone.maxCapacity,
        utilizationPercentage: Math.min(utilizationPercentage, 100),
        riskLevel,
        timestamp: new Date(),
        coordinates: {
          lat: 28.6139 + (Math.random() - 0.5) * 0.01,
          lng: 77.2090 + (Math.random() - 0.5) * 0.01
        }
      };
    });
    
    // Generate predictive alerts based on high-risk zones
    const predictiveAlerts: PredictiveAlert[] = crowdDensity
      .filter(zone => zone.riskLevel === 'high' || zone.riskLevel === 'critical')
      .map(zone => ({
        id: `alert-${zone.zoneId}-${Date.now()}`,
        type: zone.riskLevel === 'critical' ? 'overcrowding' : 'bottleneck',
        severity: zone.riskLevel === 'critical' ? 'emergency' : 'warning',
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        message: zone.riskLevel === 'critical' 
          ? `Critical overcrowding detected in ${zone.zoneName}. Immediate intervention required.`
          : `High crowd density in ${zone.zoneName}. Monitor closely for potential bottleneck.`,
        predictedTime: new Date(Date.now() + Math.random() * 20 * 60 * 1000), // Next 20 minutes
        confidence: 0.75 + Math.random() * 0.2, // 75-95%
        recommendedActions: zone.riskLevel === 'critical' 
          ? ['Close entry points', 'Open additional exits', 'Deploy security teams', 'Broadcast evacuation routes']
          : ['Monitor closely', 'Prepare alternate routes', 'Increase staff presence'],
        affectedCapacity: zone.currentDensity
      }));
    
    const anomalies = [
      {
        id: 'anomaly-1',
        type: 'Unusual gathering pattern',
        location: 'Central Hall - Section B',
        severity: 'medium',
        description: 'Detected irregular crowd clustering near west wall'
      }
    ];
    
    const recommendations = [
      {
        action: 'Open North Exit Gate 3',
        priority: 'high' as const,
        estimatedImpact: 'Reduce central hall congestion by 15%'
      },
      {
        action: 'Deploy staff to Main Entrance',
        priority: 'medium' as const,
        estimatedImpact: 'Improve flow regulation'
      }
    ];
    
    return {
      crowdDensity,
      predictiveAlerts,
      anomalies,
      recommendations
    };
  }
  
  async getCrowdPrediction(zoneId: string, timeHorizon: number = 30): Promise<{
    predictions: Array<{
      time: Date;
      predictedDensity: number;
      confidence: number;
    }>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const predictions = [];
    const currentTime = new Date();
    
    for (let i = 0; i < timeHorizon; i += 5) {
      predictions.push({
        time: new Date(currentTime.getTime() + i * 60 * 1000),
        predictedDensity: Math.max(0, 300 + Math.sin(i * 0.2) * 150 + (Math.random() - 0.5) * 50),
        confidence: 0.8 + Math.random() * 0.15
      });
    }
    
    return { predictions };
  }
}

export const aiCrowdAnalysisService = new AICrowdAnalysisService();