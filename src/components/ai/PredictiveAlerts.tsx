import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { PredictiveAlert } from '../../services/aiCrowdAnalysis';
import { AlertTriangle, Clock, CheckCircle, X } from 'lucide-react';

interface PredictiveAlertsProps {
  alerts: PredictiveAlert[];
  onAcknowledge?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'emergency': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'critical': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    default: return <Clock className="h-4 w-4 text-yellow-500" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'emergency': return 'destructive';
    case 'critical': return 'destructive';
    default: return 'secondary';
  }
};

const getTypeEmoji = (type: string) => {
  switch (type) {
    case 'overcrowding': return '🚨';
    case 'bottleneck': return '🚧';
    case 'panic': return '😰';
    case 'surge': return '⚡';
    default: return '⚠️';
  }
};

export function PredictiveAlerts({ alerts, onAcknowledge, onDismiss }: PredictiveAlertsProps) {
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { emergency: 3, critical: 2, warning: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔮 AI Predictive Alerts
          <Badge variant="outline" className="ml-auto">
            {alerts.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>No active alerts</p>
            <p className="text-sm">All zones operating normally</p>
          </div>
        ) : (
          sortedAlerts.map((alert) => (
            <Alert key={alert.id} className="relative">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(alert.severity)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getTypeEmoji(alert.type)}</span>
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{alert.zoneName}</Badge>
                      </div>
                      <AlertDescription className="text-sm font-medium">
                        {alert.message}
                      </AlertDescription>
                    </div>
                    
                    <div className="flex gap-1">
                      {onAcknowledge && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAcknowledge(alert.id)}
                          className="h-8 px-2"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      {onDismiss && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDismiss(alert.id)}
                          className="h-8 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Predicted Time:</span><br />
                      {alert.predictedTime.toLocaleTimeString()}
                    </div>
                    <div>
                      <span className="font-medium">Confidence:</span><br />
                      {(alert.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Recommended Actions:</span>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      {alert.recommendedActions.map((action, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="w-1 h-1 bg-current rounded-full"></span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
}