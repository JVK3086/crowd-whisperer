export interface EmergencyAlert {
  id: string;
  type: 'panic_button' | 'evacuation' | 'medical' | 'security';
  location: {
    lat: number;
    lng: number;
    zoneName: string;
    description?: string;
  };
  reporter: {
    userId?: string;
    deviceId: string;
    contact?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'responding' | 'resolved';
  assignedTeams: string[];
  description: string;
  media?: Array<{
    type: 'image' | 'video' | 'audio';
    url: string;
    timestamp: Date;
  }>;
}

export interface EvacuationPlan {
  id: string;
  name: string;
  triggerConditions: string[];
  affectedZones: string[];
  evacuationRoutes: Array<{
    id: string;
    name: string;
    fromZone: string;
    toZone: string;
    capacity: number;
    estimatedTime: number;
    isAvailable: boolean;
    coordinates: Array<{ lat: number; lng: number }>;
  }>;
  assemblyPoints: Array<{
    id: string;
    name: string;
    location: { lat: number; lng: number };
    capacity: number;
    facilities: string[];
  }>;
  responseProcedure: string[];
  estimatedDuration: number;
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'emergency' | 'all_clear';
  targetAudience: 'all' | 'zone_specific' | 'staff_only';
  targetZones?: string[];
  language: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  expiresAt: Date;
  isActive: boolean;
  deliveryStatus: {
    sent: number;
    delivered: number;
    read: number;
  };
}

class EmergencyManagementService {
  private wsConnection: WebSocket | null = null;
  private emergencyAlerts: EmergencyAlert[] = [];
  private evacuationPlans: EvacuationPlan[] = [];
  
  constructor() {
    this.initializeWebSocket();
    this.loadEvacuationPlans();
  }

  private initializeWebSocket() {
    try {
      // In a real implementation, this would connect to your WebSocket server
      console.log('Emergency WebSocket service initialized');
    } catch (error) {
      console.error('Failed to initialize emergency WebSocket:', error);
    }
  }

  private loadEvacuationPlans() {
    // Mock evacuation plans - in real implementation, load from backend
    this.evacuationPlans = [
      {
        id: 'evac-plan-1',
        name: 'Main Hall Evacuation',
        triggerConditions: ['fire_alarm', 'structural_damage', 'security_threat'],
        affectedZones: ['central-hall', 'main-entrance', 'east-platform'],
        evacuationRoutes: [
          {
            id: 'route-1',
            name: 'Main to North Exit',
            fromZone: 'central-hall',
            toZone: 'north-exit',
            capacity: 500,
            estimatedTime: 5,
            isAvailable: true,
            coordinates: [
              { lat: 28.6139, lng: 77.2090 },
              { lat: 28.6145, lng: 77.2095 },
              { lat: 28.6150, lng: 77.2092 }
            ]
          }
        ],
        assemblyPoints: [
          {
            id: 'assembly-1',
            name: 'North Parking Lot',
            location: { lat: 28.6155, lng: 77.2090 },
            capacity: 2000,
            facilities: ['first_aid', 'water', 'shelter']
          }
        ],
        responseProcedure: [
          'Sound evacuation alarm',
          'Broadcast evacuation instructions',
          'Deploy security teams to guide crowds',
          'Open all emergency exits',
          'Close non-essential entrances',
          'Monitor crowd flow via CCTV',
          'Update mobile app with exit information'
        ],
        estimatedDuration: 15
      }
    ];
  }

  async reportEmergency(emergency: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status' | 'assignedTeams'>): Promise<string> {
    const alert: EmergencyAlert = {
      ...emergency,
      id: `emergency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'active',
      assignedTeams: []
    };

    this.emergencyAlerts.push(alert);
    
    // In real implementation, send to backend and notify authorities
    console.log('Emergency reported:', alert);
    
    // Auto-assign response team based on type and severity
    await this.autoAssignResponseTeam(alert.id);
    
    return alert.id;
  }

  async triggerPanicButton(location: { lat: number; lng: number }, deviceId: string, userId?: string): Promise<string> {
    return this.reportEmergency({
      type: 'panic_button',
      location: {
        lat: location.lat,
        lng: location.lng,
        zoneName: 'Unknown Location'
      },
      reporter: {
        userId,
        deviceId
      },
      severity: 'critical',
      description: 'Panic button activated by user'
    });
  }

  async activateEvacuationPlan(planId: string, reason: string): Promise<boolean> {
    const plan = this.evacuationPlans.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Evacuation plan not found');
    }

    // Broadcast evacuation instructions
    await this.broadcastNotification({
      title: 'EVACUATION ALERT',
      message: `Immediate evacuation required. Follow evacuation route signs to designated assembly points. Reason: ${reason}`,
      type: 'emergency',
      targetAudience: 'all',
      language: 'en',
      priority: 'urgent'
    });

    console.log('Evacuation plan activated:', plan.name);
    return true;
  }

  async broadcastNotification(notification: Omit<NotificationMessage, 'id' | 'timestamp' | 'expiresAt' | 'isActive' | 'deliveryStatus'>): Promise<string> {
    const message: NotificationMessage = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isActive: true,
      deliveryStatus: {
        sent: 0,
        delivered: 0,
        read: 0
      }
    };

    // In real implementation, send via FCM, SMS, and in-app notifications
    console.log('Broadcasting notification:', message);
    
    // Simulate delivery status updates
    setTimeout(() => {
      message.deliveryStatus = {
        sent: 1000,
        delivered: 950,
        read: 720
      };
    }, 2000);

    return message.id;
  }

  private async autoAssignResponseTeam(alertId: string): Promise<void> {
    const alert = this.emergencyAlerts.find(a => a.id === alertId);
    if (!alert) return;

    const teams: string[] = [];
    
    switch (alert.type) {
      case 'panic_button':
        teams.push('security-team-1', 'medical-team-1');
        break;
      case 'medical':
        teams.push('medical-team-1', 'medical-team-2');
        break;
      case 'security':
        teams.push('security-team-1', 'security-team-2');
        break;
      case 'evacuation':
        teams.push('security-team-1', 'security-team-2', 'medical-team-1');
        break;
    }

    alert.assignedTeams = teams;
    alert.status = 'acknowledged';
  }

  getActiveEmergencies(): EmergencyAlert[] {
    return this.emergencyAlerts.filter(alert => 
      alert.status === 'active' || alert.status === 'acknowledged' || alert.status === 'responding'
    );
  }

  getEvacuationPlans(): EvacuationPlan[] {
    return this.evacuationPlans;
  }

  async acknowledgeEmergency(alertId: string, teamId: string): Promise<boolean> {
    const alert = this.emergencyAlerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.status = 'acknowledged';
    if (!alert.assignedTeams.includes(teamId)) {
      alert.assignedTeams.push(teamId);
    }
    
    return true;
  }

  async updateEmergencyStatus(alertId: string, status: EmergencyAlert['status']): Promise<boolean> {
    const alert = this.emergencyAlerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.status = status;
    return true;
  }

  /**
   * Emergency gate control - automatically manages gates during emergencies
   */
  async activateEmergencyGateProtocol(severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    console.log(`Activating emergency gate protocol for ${severity} emergency`);

    if (severity === 'critical' || severity === 'high') {
      // Open all emergency exits
      const emergencyExits = ['emergency-exit-1', 'emergency-exit-2'];
      for (const exitId of emergencyExits) {
        realTimeService.sendGateControl(exitId, 'open');
      }

      // Open main exits for evacuation
      const mainExits = ['exit-gate-a', 'exit-gate-b'];
      for (const exitId of mainExits) {
        realTimeService.sendGateControl(exitId, 'open');
      }

      // Close or restrict entrances to prevent new people from entering
      if (severity === 'critical') {
        const entrances = ['main-entrance', 'south-entrance'];
        for (const entranceId of entrances) {
          realTimeService.sendGateControl(entranceId, 'close');
        }
      }
    }

    // Send real-time update to mobile apps about emergency exits
    realTimeService.emitEvent({
      type: 'emergency_alert',
      data: {
        type: 'emergency_gate_protocol',
        severity,
        message: `Emergency gate protocol activated. ${severity === 'critical' ? 'All emergency exits open, entrances closed.' : 'Emergency exits opened.'}`,
        instructions: 'Please proceed to the nearest open exit. Follow emergency personnel instructions.',
        openExits: severity === 'critical' ? ['emergency-exit-1', 'emergency-exit-2', 'exit-gate-a', 'exit-gate-b'] : ['emergency-exit-1', 'emergency-exit-2']
      },
      timestamp: new Date(),
      priority: 'critical'
    });
  }

  /**
   * Deactivate emergency protocols and return gates to normal operation
   */
  async deactivateEmergencyGateProtocol(): Promise<void> {
    console.log('Deactivating emergency gate protocol');

    // Close emergency exits (back to normal)
    const emergencyExits = ['emergency-exit-1', 'emergency-exit-2'];
    for (const exitId of emergencyExits) {
      realTimeService.sendGateControl(exitId, 'close');
    }

    // Reopen normal entrances
    const entrances = ['main-entrance', 'south-entrance'];
    for (const entranceId of entrances) {
      realTimeService.sendGateControl(entranceId, 'open');
    }

    // Send normal operations update
    realTimeService.emitEvent({
      type: 'system_status',
      data: {
        type: 'normal_operations_resumed',
        message: 'Emergency protocol deactivated. Normal gate operations resumed.',
        gates_status: 'normal'
      },
      timestamp: new Date(),
      priority: 'medium'
    });
  }
}

export const emergencyManagementService = new EmergencyManagementService();