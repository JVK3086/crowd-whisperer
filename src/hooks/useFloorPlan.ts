import { useState, useEffect, useCallback } from 'react';

export interface Gate {
  id: string;
  type: 'entry' | 'exit' | 'emergency_exit';
  x: number;
  y: number;
  name: string;
  isActive: boolean;
}

export interface EmergencyRoute {
  id: string;
  name: string;
  path: Array<{ x: number; y: number }>;
  isActive: boolean;
  scenario: string;
  priority: number;
}

export interface FloorPlan {
  id: string;
  imageUrl: string;
  gates: Gate[];
  emergencyRoutes: EmergencyRoute[];
  lastUpdated: Date;
}

class FloorPlanService {
  private currentFloorPlan: FloorPlan | null = null;
  private subscribers: Map<string, (floorPlan: FloorPlan | null) => void> = new Map();

  constructor() {
    this.loadFloorPlan();
  }

  private loadFloorPlan(): void {
    try {
      const stored = localStorage.getItem('scfms-floor-plan');
      if (stored) {
        this.currentFloorPlan = JSON.parse(stored);
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Failed to load floor plan:', error);
    }
  }

  private persistFloorPlan(): void {
    try {
      if (this.currentFloorPlan) {
        localStorage.setItem('scfms-floor-plan', JSON.stringify(this.currentFloorPlan));
      }
    } catch (error) {
      console.error('Failed to persist floor plan:', error);
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.currentFloorPlan);
      } catch (error) {
        console.error('Error notifying floor plan subscriber:', error);
      }
    });
  }

  getFloorPlan(): FloorPlan | null {
    return this.currentFloorPlan;
  }

  async updateFloorPlan(imageUrl: string): Promise<void> {
    this.currentFloorPlan = {
      id: `floor-plan-${Date.now()}`,
      imageUrl,
      gates: [],
      emergencyRoutes: [],
      lastUpdated: new Date()
    };
    this.persistFloorPlan();
    this.notifySubscribers();
  }

  async updateGates(gates: Gate[]): Promise<void> {
    if (!this.currentFloorPlan) return;
    
    this.currentFloorPlan = {
      ...this.currentFloorPlan,
      gates,
      lastUpdated: new Date()
    };
    this.persistFloorPlan();
    this.notifySubscribers();
  }

  async updateEmergencyRoutes(routes: EmergencyRoute[]): Promise<void> {
    if (!this.currentFloorPlan) return;
    
    this.currentFloorPlan = {
      ...this.currentFloorPlan,
      emergencyRoutes: routes,
      lastUpdated: new Date()
    };
    this.persistFloorPlan();
    this.notifySubscribers();
  }

  subscribe(subscriberId: string, callback: (floorPlan: FloorPlan | null) => void): void {
    this.subscribers.set(subscriberId, callback);
    // Immediately call with current floor plan
    callback(this.currentFloorPlan);
  }

  unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
  }
}

export const floorPlanService = new FloorPlanService();

export function useFloorPlan() {
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const subscriberId = `floor-plan-hook-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const handleFloorPlanUpdate = (updatedFloorPlan: FloorPlan | null) => {
      setFloorPlan(updatedFloorPlan);
      setLoading(false);
    };

    floorPlanService.subscribe(subscriberId, handleFloorPlanUpdate);

    return () => {
      floorPlanService.unsubscribe(subscriberId);
    };
  }, [subscriberId]);

  const updateFloorPlan = useCallback(async (imageUrl: string) => {
    await floorPlanService.updateFloorPlan(imageUrl);
  }, []);

  const updateGates = useCallback(async (gates: Gate[]) => {
    await floorPlanService.updateGates(gates);
  }, []);

  const updateEmergencyRoutes = useCallback(async (routes: EmergencyRoute[]) => {
    await floorPlanService.updateEmergencyRoutes(routes);
  }, []);

  return {
    floorPlan,
    loading,
    updateFloorPlan,
    updateGates,
    updateEmergencyRoutes
  };
}