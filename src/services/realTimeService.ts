interface RealTimeEvent {
  type: 'crowd_update' | 'emergency_alert' | 'gate_status' | 'notification' | 'system_status' | 'settings_update';
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface ConnectionConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
}

type EventHandler = (event: RealTimeEvent) => void;

class RealTimeService {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private config: ConnectionConfig;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;

  constructor(config: Partial<ConnectionConfig> = {}) {
    this.config = {
      url: config.url || (process.env.NODE_ENV === 'production' 
        ? 'wss://api.scfms.com/ws' 
        : 'ws://localhost:8080/ws'),
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 3000,
      heartbeatInterval: config.heartbeatInterval || 30000
    };
  }

  async connect(): Promise<void> {
    try {
      // In a real implementation, connect to actual WebSocket server
      console.log('Connecting to real-time service...');
      
      // Simulate connection for demo purposes
      setTimeout(() => {
        this.isConnected = true;
        this.startHeartbeat();
        this.simulateRealTimeData();
        console.log('Real-time service connected');
      }, 1000);

    } catch (error) {
      console.error('Failed to connect to real-time service:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.isConnected = false;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: RealTimeEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        // In real implementation, send ping to server
        console.log('Heartbeat ping sent');
      }
    }, this.config.heartbeatInterval);
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.config.reconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.config.reconnectAttempts}`);
        this.connect();
      }, this.config.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private simulateRealTimeData(): void {
    // Simulate crowd updates every 5 seconds
    setInterval(() => {
      if (this.isConnected) {
        this.emit({
          type: 'crowd_update',
          data: {
            zones: [
              {
                id: 'entrance-main',
                currentDensity: Math.floor(Math.random() * 500) + 100,
                utilizationPercentage: Math.floor(Math.random() * 40) + 60,
                trend: Math.random() > 0.5 ? 'increasing' : 'decreasing'
              },
              {
                id: 'central-hall',
                currentDensity: Math.floor(Math.random() * 800) + 200,
                utilizationPercentage: Math.floor(Math.random() * 30) + 50,
                trend: Math.random() > 0.5 ? 'increasing' : 'stable'
              }
            ]
          },
          timestamp: new Date(),
          priority: 'medium'
        });
      }
    }, 5000);

    // Simulate random alerts
    setInterval(() => {
      if (this.isConnected && Math.random() > 0.7) {
        const alertTypes = ['crowd_surge', 'bottleneck', 'gate_blocked'];
        const zones = ['Main Entrance', 'Central Hall', 'Exit Gate A', 'Food Court'];
        
        this.emit({
          type: 'emergency_alert',
          data: {
            id: `alert-${Date.now()}`,
            type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
            zone: zones[Math.floor(Math.random() * zones.length)],
            severity: Math.random() > 0.7 ? 'critical' : 'warning',
            message: 'Automated alert detected by AI analysis'
          },
          timestamp: new Date(),
          priority: 'high'
        });
      }
    }, 15000);

    // Simulate gate status updates
    setInterval(() => {
      if (this.isConnected) {
        this.emit({
          type: 'gate_status',
          data: {
            gates: [
              { id: 'gate-a', status: Math.random() > 0.5 ? 'open' : 'closed', throughput: Math.floor(Math.random() * 100) },
              { id: 'gate-b', status: 'open', throughput: Math.floor(Math.random() * 80) },
              { id: 'gate-c', status: Math.random() > 0.3 ? 'open' : 'maintenance', throughput: Math.floor(Math.random() * 60) }
            ]
          },
          timestamp: new Date(),
          priority: 'low'
        });
      }
    }, 10000);
  }

  // Public methods for sending data (admin actions)
  sendGateControl(gateId: string, action: 'open' | 'close'): void {
    if (this.isConnected) {
      console.log(`Sending gate control: ${gateId} - ${action}`);
      // In real implementation, send to server
    }
  }

  sendBroadcastMessage(message: string, zones: string[] = []): void {
    if (this.isConnected) {
      console.log(`Broadcasting message: ${message} to zones:`, zones);
      // In real implementation, send to server
    }
  }

  sendEvacuationTrigger(planId: string, reason: string): void {
    if (this.isConnected) {
      console.log(`Triggering evacuation plan: ${planId}, reason: ${reason}`);
      // In real implementation, send to server
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Method to emit events (used by settings service)
  emit(event: RealTimeEvent): void {
    this.emit(event);
  }
}

export const realTimeService = new RealTimeService();

// Auto-connect when service is imported
realTimeService.connect();