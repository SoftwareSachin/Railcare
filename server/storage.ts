import {
  users,
  stations,
  trains,
  alerts,
  crowdflowData,
  medicalEmergencies,
  safetyIncidents,
  type User,
  type UpsertUser,
  type Station,
  type Train,
  type Alert,
  type CrowdflowData,
  type MedicalEmergency,
  type SafetyIncident,
  type InsertStation,
  type InsertTrain,
  type InsertAlert,
  type InsertCrowdflowData,
  type InsertMedicalEmergency,
  type InsertSafetyIncident,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByAadhaar(aadhaarNumber: string): Promise<User | undefined>;
  
  // Station operations
  getStations(): Promise<Station[]>;
  getStation(id: number): Promise<Station | undefined>;
  getStationByCode(code: string): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;
  
  // Train operations
  getTrains(): Promise<Train[]>;
  getTrain(id: number): Promise<Train | undefined>;
  getTrainByNumber(number: string): Promise<Train | undefined>;
  createTrain(train: InsertTrain): Promise<Train>;
  
  // Alert operations
  getAlerts(stationId?: number, status?: string): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlertStatus(id: number, status: string, assignedTo?: string): Promise<Alert | undefined>;
  getActiveAlertsByUser(userId: string): Promise<Alert[]>;
  
  // CrowdFlow operations
  getCurrentCrowdData(stationId: number): Promise<CrowdflowData[]>;
  addCrowdflowData(data: InsertCrowdflowData): Promise<CrowdflowData>;
  getCrowdHistoryForStation(stationId: number, hours: number): Promise<CrowdflowData[]>;
  
  // Medical Emergency operations
  getMedicalEmergencies(status?: string): Promise<MedicalEmergency[]>;
  getMedicalEmergency(id: number): Promise<MedicalEmergency | undefined>;
  createMedicalEmergency(emergency: InsertMedicalEmergency): Promise<MedicalEmergency>;
  updateMedicalEmergency(id: number, updates: Partial<InsertMedicalEmergency>): Promise<MedicalEmergency | undefined>;
  
  // Safety Incident operations
  getSafetyIncidents(status?: string): Promise<SafetyIncident[]>;
  getSafetyIncident(id: number): Promise<SafetyIncident | undefined>;
  createSafetyIncident(incident: InsertSafetyIncident): Promise<SafetyIncident>;
  updateSafetyIncident(id: number, updates: Partial<InsertSafetyIncident>): Promise<SafetyIncident | undefined>;
  
  // Dashboard analytics
  getDashboardStats(stationId?: number): Promise<{
    totalPassengers: number;
    activeAlerts: number;
    resolvedAlertsToday: number;
    averageResponseTime: number;
    onTimeTrains: number;
    totalTrains: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByAadhaar(aadhaarNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.aadhaarNumber, aadhaarNumber));
    return user;
  }

  // Station operations
  async getStations(): Promise<Station[]> {
    return await db.select().from(stations).where(eq(stations.isActive, true));
  }

  async getStation(id: number): Promise<Station | undefined> {
    const [station] = await db.select().from(stations).where(eq(stations.id, id));
    return station;
  }

  async getStationByCode(code: string): Promise<Station | undefined> {
    const [station] = await db.select().from(stations).where(eq(stations.code, code));
    return station;
  }

  async createStation(station: InsertStation): Promise<Station> {
    const [newStation] = await db.insert(stations).values(station).returning();
    return newStation;
  }

  // Train operations
  async getTrains(): Promise<Train[]> {
    return await db.select().from(trains).where(eq(trains.isActive, true));
  }

  async getTrain(id: number): Promise<Train | undefined> {
    const [train] = await db.select().from(trains).where(eq(trains.id, id));
    return train;
  }

  async getTrainByNumber(number: string): Promise<Train | undefined> {
    const [train] = await db.select().from(trains).where(eq(trains.number, number));
    return train;
  }

  async createTrain(train: InsertTrain): Promise<Train> {
    const [newTrain] = await db.insert(trains).values(train).returning();
    return newTrain;
  }

  // Alert operations
  async getAlerts(stationId?: number, status?: string): Promise<Alert[]> {
    let query = db.select().from(alerts).orderBy(desc(alerts.createdAt));
    
    if (stationId && status) {
      return await query.where(and(eq(alerts.stationId, stationId), eq(alerts.status, status)));
    } else if (stationId) {
      return await query.where(eq(alerts.stationId, stationId));
    } else if (status) {
      return await query.where(eq(alerts.status, status));
    }
    
    return await query;
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async updateAlertStatus(id: number, status: string, assignedTo?: string): Promise<Alert | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (status === 'resolved') updateData.resolvedAt = new Date();

    const [updatedAlert] = await db
      .update(alerts)
      .set(updateData)
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert;
  }

  async getActiveAlertsByUser(userId: string): Promise<Alert[]> {
    return await db
      .select()
      .from(alerts)
      .where(and(eq(alerts.assignedTo, userId), eq(alerts.status, 'active')))
      .orderBy(desc(alerts.createdAt));
  }

  // CrowdFlow operations
  async getCurrentCrowdData(stationId: number): Promise<CrowdflowData[]> {
    return await db
      .select()
      .from(crowdflowData)
      .where(eq(crowdflowData.stationId, stationId))
      .orderBy(desc(crowdflowData.timestamp))
      .limit(10);
  }

  async addCrowdflowData(data: InsertCrowdflowData): Promise<CrowdflowData> {
    const [newData] = await db.insert(crowdflowData).values(data).returning();
    return newData;
  }

  async getCrowdHistoryForStation(stationId: number, hours: number): Promise<CrowdflowData[]> {
    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await db
      .select()
      .from(crowdflowData)
      .where(and(
        eq(crowdflowData.stationId, stationId),
        gte(crowdflowData.timestamp, hoursAgo)
      ))
      .orderBy(crowdflowData.timestamp);
  }

  // Medical Emergency operations
  async getMedicalEmergencies(status?: string): Promise<MedicalEmergency[]> {
    let query = db.select().from(medicalEmergencies).orderBy(desc(medicalEmergencies.createdAt));
    
    if (status) {
      return await query.where(eq(medicalEmergencies.status, status));
    }
    
    return await query;
  }

  async getMedicalEmergency(id: number): Promise<MedicalEmergency | undefined> {
    const [emergency] = await db.select().from(medicalEmergencies).where(eq(medicalEmergencies.id, id));
    return emergency;
  }

  async createMedicalEmergency(emergency: InsertMedicalEmergency): Promise<MedicalEmergency> {
    const [newEmergency] = await db.insert(medicalEmergencies).values(emergency).returning();
    return newEmergency;
  }

  async updateMedicalEmergency(id: number, updates: Partial<InsertMedicalEmergency>): Promise<MedicalEmergency | undefined> {
    const [updatedEmergency] = await db
      .update(medicalEmergencies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(medicalEmergencies.id, id))
      .returning();
    return updatedEmergency;
  }

  // Safety Incident operations
  async getSafetyIncidents(status?: string): Promise<SafetyIncident[]> {
    let query = db.select().from(safetyIncidents).orderBy(desc(safetyIncidents.createdAt));
    
    if (status) {
      return await query.where(eq(safetyIncidents.status, status));
    }
    
    return await query;
  }

  async getSafetyIncident(id: number): Promise<SafetyIncident | undefined> {
    const [incident] = await db.select().from(safetyIncidents).where(eq(safetyIncidents.id, id));
    return incident;
  }

  async createSafetyIncident(incident: InsertSafetyIncident): Promise<SafetyIncident> {
    const [newIncident] = await db.insert(safetyIncidents).values(incident).returning();
    return newIncident;
  }

  async updateSafetyIncident(id: number, updates: Partial<InsertSafetyIncident>): Promise<SafetyIncident | undefined> {
    const [updatedIncident] = await db
      .update(safetyIncidents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(safetyIncidents.id, id))
      .returning();
    return updatedIncident;
  }

  // Dashboard analytics
  async getDashboardStats(stationId?: number): Promise<{
    totalPassengers: number;
    activeAlerts: number;
    resolvedAlertsToday: number;
    averageResponseTime: number;
    onTimeTrains: number;
    totalTrains: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let alertsQuery = db.select().from(alerts);
    if (stationId) {
      alertsQuery = alertsQuery.where(eq(alerts.stationId, stationId));
    }
    
    const [activeAlertsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(eq(alerts.status, 'active'));
    
    const [resolvedTodayResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(alerts)
      .where(and(
        eq(alerts.status, 'resolved'),
        gte(alerts.resolvedAt, today)
      ));
    
    const [trainsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(trains)
      .where(eq(trains.isActive, true));
    
    // Mock data for remaining stats as they would require more complex calculations
    return {
      totalPassengers: 47832, // This would come from ticketing system integration
      activeAlerts: activeAlertsResult.count || 0,
      resolvedAlertsToday: resolvedTodayResult.count || 0,
      averageResponseTime: 2.4, // This would be calculated from alert creation to resolution times
      onTimeTrains: Math.floor((trainsResult.count || 0) * 0.89), // Mock 89% on-time performance
      totalTrains: trainsResult.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
