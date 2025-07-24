import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CrowdDensityData } from '../../services/aiCrowdAnalysis';

interface CrowdHeatmapProps {
  crowdData: CrowdDensityData[];
  selectedZone?: string;
  onZoneSelect?: (zoneId: string) => void;
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'low': return 'bg-green-500/20 border-green-500';
    case 'medium': return 'bg-yellow-500/20 border-yellow-500';
    case 'high': return 'bg-orange-500/20 border-orange-500';
    case 'critical': return 'bg-red-500/20 border-red-500';
    default: return 'bg-muted';
  }
};

const getRiskBadgeVariant = (riskLevel: string) => {
  switch (riskLevel) {
    case 'low': return 'secondary';
    case 'medium': return 'secondary';
    case 'high': return 'destructive';
    case 'critical': return 'destructive';
    default: return 'secondary';
  }
};

export function CrowdHeatmap({ crowdData, selectedZone, onZoneSelect }: CrowdHeatmapProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🗺️ Live Crowd Heatmap
          <Badge variant="outline" className="ml-auto">
            {crowdData.length} Zones
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {crowdData.map((zone) => (
            <div
              key={zone.zoneId}
              className={`
                p-3 rounded-lg border-2 cursor-pointer transition-all
                ${getRiskColor(zone.riskLevel)}
                ${selectedZone === zone.zoneId ? 'ring-2 ring-primary' : ''}
                hover:shadow-md
              `}
              onClick={() => onZoneSelect?.(zone.zoneId)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{zone.zoneName}</h4>
                  <Badge variant={getRiskBadgeVariant(zone.riskLevel)} className="text-xs">
                    {zone.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Density</span>
                    <span>{zone.currentDensity}/{zone.maxCapacity}</span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        zone.utilizationPercentage > 90 ? 'bg-red-500' :
                        zone.utilizationPercentage > 75 ? 'bg-orange-500' :
                        zone.utilizationPercentage > 50 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(zone.utilizationPercentage, 100)}%` }}
                    />
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    {zone.utilizationPercentage.toFixed(1)}% utilized
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Critical</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}