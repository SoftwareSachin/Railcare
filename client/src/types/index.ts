export interface User {
  id: string;
  name: string;
  role: 'passenger' | 'volunteer' | 'staff' | 'admin';
  aadhaarNumber?: string;
  profileImageUrl?: string;
  stationCode?: string;
}

export interface Station {
  id: number;
  code: string;
  name: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  capacity: number;
  platforms: number;
}

export interface Alert {
  id: number;
  type: string;
  module: string;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'dismissed';
  stationId?: number;
  trainId?: number;
  platformNumber?: string;
  coachNumber?: string;
  reportedBy?: string;
  assignedTo?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CrowdflowData {
  id: number;
  stationId: number;
  platformNumber?: string;
  currentOccupancy: number;
  maxCapacity: number;
  occupancyPercentage: number;
  timestamp: string;
  sensorData?: any;
}

export interface DashboardStats {
  totalPassengers: number;
  activeAlerts: number;
  resolvedAlertsToday: number;
  averageResponseTime: number;
  onTimeTrains: number;
  totalTrains: number;
}

export interface WebSocketMessage {
  type: 'new_alert' | 'alert_updated' | 'crowd_update' | 'medical_emergency' | 'safety_incident' | 'connected' | 'subscription_confirmed';
  data?: any;
  timestamp?: string;
  stationId?: number;
}

export interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  roles: string[];
  path: string;
}
