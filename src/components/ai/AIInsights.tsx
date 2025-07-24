import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AIAnalysisResult } from '../../services/aiCrowdAnalysis';
import { TrendingUp, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';

interface AIInsightsProps {
  analysis: AIAnalysisResult;
  loading?: boolean;
  onRefresh?: () => void;
}

export function AIInsights({ analysis, loading, onRefresh }: AIInsightsProps) {
  const totalCapacity = analysis.crowdDensity.reduce((sum, zone) => sum + zone.maxCapacity, 0);
  const totalCurrent = analysis.crowdDensity.reduce((sum, zone) => sum + zone.currentDensity, 0);
  const overallUtilization = (totalCurrent / totalCapacity) * 100;
  
  const criticalZones = analysis.crowdDensity.filter(zone => zone.riskLevel === 'critical').length;
  const highRiskZones = analysis.crowdDensity.filter(zone => zone.riskLevel === 'high').length;

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🧠 AI Crowd Intelligence
            <Button
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
              className="gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{overallUtilization.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Overall Utilization</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{criticalZones}</div>
              <div className="text-xs text-muted-foreground">Critical Zones</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-500">{highRiskZones}</div>
              <div className="text-xs text-muted-foreground">High Risk Zones</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-500">{analysis.predictiveAlerts.length}</div>
              <div className="text-xs text-muted-foreground">Active Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies */}
      {analysis.anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Detected Anomalies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.anomalies.map((anomaly) => (
              <div key={anomaly.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{anomaly.type}</span>
                    <Badge variant="outline" className="text-xs">
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{anomaly.description}</p>
                  <p className="text-xs text-muted-foreground">{anomaly.location}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{rec.action}</span>
                  <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                    {rec.priority} priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.estimatedImpact}</p>
              </div>
              <div className="flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}