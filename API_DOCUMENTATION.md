# SCFMS API Documentation

This document provides comprehensive documentation for all services, interfaces, and APIs used in the Smart Crowd Flow Management System (SCFMS).

## 📋 Table of Contents

1. [Core Services](#core-services)
2. [AI Analysis Service](#ai-analysis-service)
3. [Emergency Management Service](#emergency-management-service)
4. [Real-time Service](#real-time-service)
5. [Data Models](#data-models)
6. [React Hooks](#react-hooks)
7. [Component APIs](#component-apis)

## 🔧 Core Services

### AI Crowd Analysis Service

**File**: `src/services/aiCrowdAnalysis.ts`

#### Interface: `CrowdDensityData`
```typescript
interface CrowdDensityData {
  zoneId: string;           // Unique zone identifier
  zoneName: string;         // Human-readable zone name
  currentDensity: number;   // Current number of people
  maxCapacity: number;      // Maximum safe capacity
  utilizationPercentage: number; // Percentage of capacity used
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;          // When data was recorded
  coordinates: {            // Geographic location
    lat: number;
    lng: number;
  };
}
```

#### Interface: `PredictiveAlert`
```typescript
interface PredictiveAlert {
  id: string;                    // Unique alert identifier
  type: 'overcrowding' | 'bottleneck' | 'panic' | 'surge';
  severity: 'warning' | 'critical' | 'emergency';
  zoneId: string;               // Affected zone
  zoneName: string;             // Zone display name
  message: string;              // Alert description
  predictedTime: Date;          // When event is predicted
  confidence: number;           // AI confidence (0-1)
  recommendedActions: string[]; // Suggested responses
  affectedCapacity: number;     // People involved
}
```

#### Methods

##### `analyzeCrowdDensity(): Promise<AIAnalysisResult>`
Performs comprehensive crowd analysis across all zones.

**Returns:**
```typescript
interface AIAnalysisResult {
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
```

**Example Usage:**
```typescript
import { aiCrowdAnalysisService } from '@/services/aiCrowdAnalysis';

const analysis = await aiCrowdAnalysisService.analyzeCrowdDensity();
console.log('Current crowd levels:', analysis.crowdDensity);
console.log('Predicted issues:', analysis.predictiveAlerts);
```

##### `getCrowdPrediction(zoneId: string, timeHorizon: number): Promise<PredictionResult>`
Generates future crowd density predictions for a specific zone.

**Parameters:**
- `zoneId`: Target zone identifier
- `timeHorizon`: Prediction window in minutes (default: 30)

**Returns:**
```typescript
interface PredictionResult {
  predictions: Array<{
    time: Date;
    predictedDensity: number;
    confidence: number;
  }>;
}
```

---

### Emergency Management Service

**File**: `src/services/emergencyManagement.ts`

#### Interface: `EmergencyAlert`
```typescript
interface EmergencyAlert {
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
```

#### Interface: `EvacuationPlan`
```typescript
interface EvacuationPlan {
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
```

#### Methods

##### `reportEmergency(emergency): Promise<string>`
Reports a new emergency situation.

**Parameters:**
```typescript
Omit<EmergencyAlert, 'id' | 'timestamp' | 'status' | 'assignedTeams'>
```

**Returns:** Alert ID string

**Example:**
```typescript
const alertId = await emergencyManagementService.reportEmergency({
  type: 'medical',
  location: {
    lat: 28.6139,
    lng: 77.2090,
    zoneName: 'Main Hall'
  },
  reporter: {
    deviceId: 'device123',
    userId: 'user456'
  },
  severity: 'high',
  description: 'Medical emergency requiring immediate attention'
});
```

##### `triggerPanicButton(location, deviceId, userId?): Promise<string>`
Activates panic button emergency alert.

**Parameters:**
- `location`: `{ lat: number; lng: number }`
- `deviceId`: Device identifier
- `userId`: Optional user identifier

##### `activateEvacuationPlan(planId: string, reason: string): Promise<boolean>`
Triggers evacuation procedure.

##### `broadcastNotification(notification): Promise<string>`
Sends notifications to specified zones or all areas.

---

### Real-time Service

**File**: `src/services/realTimeService.ts`

#### Interface: `RealTimeEvent`
```typescript
interface RealTimeEvent {
  type: 'crowd_update' | 'emergency_alert' | 'gate_status' | 'notification' | 'system_status';
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}
```

#### Methods

##### `connect(): Promise<void>`
Establishes WebSocket connection to real-time data service.

##### `subscribe(eventType: string, handler: EventHandler): void`
Subscribes to specific event types.

**Example:**
```typescript
import { realTimeService } from '@/services/realTimeService';

realTimeService.subscribe('crowd_update', (event) => {
  console.log('New crowd data:', event.data);
});
```

##### `sendGateControl(gateId: string, action: 'open' | 'close'): void`
Sends gate control commands.

##### `sendBroadcastMessage(message: string, zones?: string[]): void`
Broadcasts messages to specific zones or all areas.

---

## 🔗 React Hooks

### useAIAnalysis Hook

**File**: `src/hooks/useAIAnalysis.ts`

#### `useAIAnalysis(refreshInterval?: number)`
Provides real-time AI analysis data with automatic refresh.

**Parameters:**
- `refreshInterval`: Update frequency in milliseconds (default: 30000)

**Returns:**
```typescript
{
  data: AIAnalysisResult | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}
```

**Usage:**
```typescript
import { useAIAnalysis } from '@/hooks/useAIAnalysis';

function Dashboard() {
  const { data, loading, error, refresh } = useAIAnalysis(15000);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Crowd Analysis</h2>
      {data?.crowdDensity.map(zone => (
        <div key={zone.zoneId}>
          {zone.zoneName}: {zone.utilizationPercentage}%
        </div>
      ))}
    </div>
  );
}
```

#### `useCrowdPrediction(zoneId: string | null, timeHorizon?: number)`
Generates crowd predictions for specific zones.

#### `useAlertManager()`
Manages emergency alerts and acknowledgments.

**Returns:**
```typescript
{
  alerts: PredictiveAlert[];
  acknowledgeAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  addAlert: (alert: PredictiveAlert) => void;
  getActiveAlerts: () => PredictiveAlert[];
  getCriticalAlerts: () => PredictiveAlert[];
}
```

---

## 🎨 Component APIs

### InteractiveCrowdMap Component

**File**: `src/components/ai/InteractiveCrowdMap.tsx`

A comprehensive interactive map showing real-time crowd data with administrative controls.

**Features:**
- Real-time zone visualization
- Click-to-select zone details
- Emergency control buttons
- Gate management interface
- WebSocket data integration

**Usage:**
```tsx
import { InteractiveCrowdMap } from '@/components/ai/InteractiveCrowdMap';

<InteractiveCrowdMap />
```

### PanicButton Component

**File**: `src/components/mobile/PanicButton.tsx`

Emergency alert button with GPS location and confirmation dialog.

**Props:**
```typescript
interface PanicButtonProps {
  className?: string;
}
```

**Features:**
- 5-second confirmation countdown
- GPS location capture
- Emergency service integration
- Visual feedback states

**Usage:**
```tsx
import { PanicButton } from '@/components/mobile/PanicButton';

<PanicButton className="my-4" />
```

### SafeNavigation Component

**File**: `src/components/mobile/SafeNavigation.tsx`

AI-powered route planning with crowd avoidance.

**Props:**
```typescript
interface SafeNavigationProps {
  className?: string;
}
```

**Features:**
- Destination selection
- Multiple route options
- Real-time crowd data integration
- Turn-by-turn navigation
- Route difficulty and safety ratings

---

## 📊 Data Models

### Zone Configuration
```typescript
interface Zone {
  id: string;
  name: string;
  capacity: number;
  current: number;
  status: 'low' | 'medium' | 'high' | 'critical';
  coordinates: { x: number; y: number };
  cameras: number;
  emergencyExits: number;
  lastUpdated: Date;
  trend: 'increasing' | 'decreasing' | 'stable';
}
```

### Safe Route Definition
```typescript
interface SafeRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: number;
  estimatedTime: number;
  crowdLevel: 'low' | 'medium' | 'high' | 'avoid';
  difficulty: 'easy' | 'moderate' | 'challenging';
  waypoints: Array<{
    name: string;
    crowdDensity: number;
    isCheckpoint: boolean;
  }>;
  features: string[];
  isRecommended: boolean;
  lastUpdated: Date;
}
```

### Gate Status
```typescript
interface GateStatus {
  id: string;
  name: string;
  status: 'open' | 'closed' | 'maintenance';
  throughput: number;
  location: { x: number; y: number };
}
```

---

## 🔄 Event Flow Diagrams

### Emergency Alert Flow
```
User Activates Panic Button
       ↓
GPS Location Captured
       ↓
Confirmation Dialog (5s)
       ↓
Emergency Alert Created
       ↓
Auto-Assign Response Teams
       ↓
Broadcast to Admin Dashboard
       ↓
Real-time Status Updates
```

### Crowd Analysis Flow
```
CCTV/Sensor Data Input
       ↓
AI Processing (15s intervals)
       ↓
Risk Level Calculation
       ↓
Predictive Alert Generation
       ↓
WebSocket Distribution
       ↓
UI Updates (Admin + Mobile)
```

### Route Calculation Flow
```
User Selects Destination
       ↓
Current Crowd Data Retrieved
       ↓
AI Route Optimization
       ↓
Multiple Options Generated
       ↓
Safety Ratings Applied
       ↓
Recommended Route Selected
```

---

## 🛠️ Development Guidelines

### Adding New Services

1. **Create Service File**
   ```typescript
   // src/services/newService.ts
   export interface NewServiceInterface {
     // Define interfaces
   }
   
   class NewService {
     // Implement methods
   }
   
   export const newService = new NewService();
   ```

2. **Add Type Definitions**
   ```typescript
   // Define all interfaces with comprehensive types
   // Include JSDoc comments for documentation
   ```

3. **Integration Pattern**
   ```typescript
   // Use consistent error handling
   // Implement loading states
   // Provide WebSocket integration where needed
   ```

### Component Development

1. **Props Interface**
   ```typescript
   interface ComponentProps {
     // Always define prop types
     // Use optional properties where appropriate
     // Include className for styling flexibility
   }
   ```

2. **State Management**
   ```typescript
   // Use TypeScript for all state
   // Implement proper error boundaries
   // Handle loading states consistently
   ```

### API Response Formats

All service methods return consistent response formats:

**Success Response:**
```typescript
{
  success: true,
  data: T,
  timestamp: Date,
  metadata?: any
}
```

**Error Response:**
```typescript
{
  success: false,
  error: string,
  code: string,
  timestamp: Date
}
```

---

## 🧪 Testing APIs

### Mock Data Usage
All services include mock data for development and testing:

```typescript
// Example test data access
import { aiCrowdAnalysisService } from '@/services/aiCrowdAnalysis';

// This returns simulated crowd data
const mockAnalysis = await aiCrowdAnalysisService.analyzeCrowdDensity();
```

### Integration Testing
```typescript
// Test service integration
describe('Emergency Service', () => {
  it('should create panic button alert', async () => {
    const alertId = await emergencyManagementService.triggerPanicButton(
      { lat: 28.6139, lng: 77.2090 },
      'test-device-123'
    );
    expect(alertId).toBeDefined();
  });
});
```

---

## 📝 API Changelog

### Version 1.0 (Current)
- ✅ AI Crowd Analysis Service
- ✅ Emergency Management Service  
- ✅ Real-time WebSocket Service
- ✅ React Hooks for data management
- ✅ Component APIs for UI integration
- ✅ TypeScript interfaces for all data models

### Future Versions
- 🔄 Backend API integration
- 🔄 Database persistence layer
- 🔄 Authentication and authorization
- 🔄 Push notification service
- 🔄 File upload and media handling

---

For questions about specific APIs or to request additional documentation, please create an issue in the project repository.

**Last Updated:** 2025-01-28  
**Documentation Version:** 1.0