import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  aadhaarNumber: varchar("aadhaar_number", { length: 12 }).unique(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).notNull().default("passenger"), // passenger, volunteer, staff, admin
  phoneNumber: varchar("phone_number", { length: 15 }),
  stationCode: varchar("station_code", { length: 10 }), // For staff/volunteers assigned to specific stations
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Stations table for managing railway stations
export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  capacity: integer("capacity").default(0),
  platforms: integer("platforms").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Trains table for managing train information
export const trains = pgTable("trains", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 10 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // express, passenger, freight
  coaches: integer("coaches").default(0),
  capacity: integer("capacity").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alerts table for managing system alerts across all modules
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // medical, crowd, safety, security, etc.
  module: varchar("module", { length: 50 }).notNull(), // crowdflow, medilink, safeher, etc.
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  severity: varchar("severity", { length: 20 }).notNull().default("medium"), // low, medium, high, critical
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, resolved, dismissed
  stationId: integer("station_id").references(() => stations.id),
  trainId: integer("train_id").references(() => trains.id),
  platformNumber: varchar("platform_number", { length: 10 }),
  coachNumber: varchar("coach_number", { length: 10 }),
  reportedBy: varchar("reported_by").references(() => users.id),
  assignedTo: varchar("assigned_to").references(() => users.id),
  location: jsonb("location"), // {latitude, longitude, address}
  metadata: jsonb("metadata"), // Additional data specific to alert type
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// CrowdFlow data for monitoring passenger density
export const crowdflowData = pgTable("crowdflow_data", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").references(() => stations.id).notNull(),
  platformNumber: varchar("platform_number", { length: 10 }),
  currentOccupancy: integer("current_occupancy").default(0),
  maxCapacity: integer("max_capacity").default(0),
  occupancyPercentage: real("occupancy_percentage").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
  sensorData: jsonb("sensor_data"), // Raw sensor readings
});

// Medical emergencies for MediLink module
export const medicalEmergencies = pgTable("medical_emergencies", {
  id: serial("id").primaryKey(),
  alertId: integer("alert_id").references(() => alerts.id).notNull(),
  patientName: varchar("patient_name", { length: 255 }),
  patientAge: integer("patient_age"),
  patientGender: varchar("patient_gender", { length: 10 }),
  emergencyType: varchar("emergency_type", { length: 100 }).notNull(),
  vitals: jsonb("vitals"), // {heartRate, bloodPressure, temperature, etc.}
  symptoms: text("symptoms"),
  treatmentGiven: text("treatment_given"),
  hospitalDispatched: boolean("hospital_dispatched").default(false),
  ambulanceEta: timestamp("ambulance_eta"),
  status: varchar("status", { length: 20 }).default("active"), // active, treated, transferred
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Safety incidents for SafeHer module
export const safetyIncidents = pgTable("safety_incidents", {
  id: serial("id").primaryKey(),
  alertId: integer("alert_id").references(() => alerts.id).notNull(),
  incidentType: varchar("incident_type", { length: 100 }).notNull(),
  reporterGender: varchar("reporter_gender", { length: 10 }),
  witnessCount: integer("witness_count").default(0),
  actionTaken: text("action_taken"),
  escortRequested: boolean("escort_requested").default(false),
  escortAssigned: varchar("escort_assigned").references(() => users.id),
  status: varchar("status", { length: 20 }).default("reported"), // reported, investigating, resolved
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reportedAlerts: many(alerts, { relationName: "reportedAlerts" }),
  assignedAlerts: many(alerts, { relationName: "assignedAlerts" }),
  assignedIncidents: many(safetyIncidents),
}));

export const stationsRelations = relations(stations, ({ many }) => ({
  alerts: many(alerts),
  crowdflowData: many(crowdflowData),
}));

export const trainsRelations = relations(trains, ({ many }) => ({
  alerts: many(alerts),
}));

export const alertsRelations = relations(alerts, ({ one, many }) => ({
  station: one(stations, {
    fields: [alerts.stationId],
    references: [stations.id],
  }),
  train: one(trains, {
    fields: [alerts.trainId],
    references: [trains.id],
  }),
  reportedByUser: one(users, {
    fields: [alerts.reportedBy],
    references: [users.id],
    relationName: "reportedAlerts",
  }),
  assignedToUser: one(users, {
    fields: [alerts.assignedTo],
    references: [users.id],
    relationName: "assignedAlerts",
  }),
  medicalEmergencies: many(medicalEmergencies),
  safetyIncidents: many(safetyIncidents),
}));

export const crowdflowDataRelations = relations(crowdflowData, ({ one }) => ({
  station: one(stations, {
    fields: [crowdflowData.stationId],
    references: [stations.id],
  }),
}));

export const medicalEmergenciesRelations = relations(medicalEmergencies, ({ one }) => ({
  alert: one(alerts, {
    fields: [medicalEmergencies.alertId],
    references: [alerts.id],
  }),
}));

export const safetyIncidentsRelations = relations(safetyIncidents, ({ one }) => ({
  alert: one(alerts, {
    fields: [safetyIncidents.alertId],
    references: [alerts.id],
  }),
  assignedEscort: one(users, {
    fields: [safetyIncidents.escortAssigned],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStationSchema = createInsertSchema(stations).omit({
  id: true,
  createdAt: true,
});

export const insertTrainSchema = createInsertSchema(trains).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertCrowdflowDataSchema = createInsertSchema(crowdflowData).omit({
  id: true,
  timestamp: true,
});

export const insertMedicalEmergencySchema = createInsertSchema(medicalEmergencies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSafetyIncidentSchema = createInsertSchema(safetyIncidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Station = typeof stations.$inferSelect;
export type Train = typeof trains.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type CrowdflowData = typeof crowdflowData.$inferSelect;
export type MedicalEmergency = typeof medicalEmergencies.$inferSelect;
export type SafetyIncident = typeof safetyIncidents.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertStation = z.infer<typeof insertStationSchema>;
export type InsertTrain = z.infer<typeof insertTrainSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertCrowdflowData = z.infer<typeof insertCrowdflowDataSchema>;
export type InsertMedicalEmergency = z.infer<typeof insertMedicalEmergencySchema>;
export type InsertSafetyIncident = z.infer<typeof insertSafetyIncidentSchema>;
