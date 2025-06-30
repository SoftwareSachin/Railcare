import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertAlertSchema,
  insertCrowdflowDataSchema,
  insertMedicalEmergencySchema,
  insertSafetyIncidentSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Mock Aadhaar authentication endpoint
  app.post('/api/auth/request-otp', async (req, res) => {
    try {
      const { aadhaarNumber } = req.body;
      
      if (!aadhaarNumber || aadhaarNumber.length !== 12) {
        return res.status(400).json({ message: "Invalid Aadhaar number" });
      }
      
      // In production, this would integrate with actual Aadhaar services
      // For now, we'll simulate OTP generation
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in session (in production, send via SMS)
      req.session.pendingAuth = {
        aadhaarNumber,
        otp: mockOtp,
        timestamp: Date.now()
      };
      
      res.json({ 
        success: true, 
        message: "OTP sent to registered mobile number",
        mockOtp // Remove in production
      });
    } catch (error) {
      console.error("OTP request error:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    try {
      const { aadhaarNumber, otp } = req.body;
      const pendingAuth = req.session.pendingAuth;
      
      if (!pendingAuth || 
          pendingAuth.aadhaarNumber !== aadhaarNumber || 
          pendingAuth.otp !== otp ||
          Date.now() - pendingAuth.timestamp > 300000) { // 5 minutes
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Find or create user
      let user = await storage.getUserByAadhaar(aadhaarNumber);
      
      if (!user) {
        // Create new user with mock data
        user = await storage.upsertUser({
          id: `user_${Date.now()}`, // In production, use proper ID generation
          aadhaarNumber,
          firstName: "Railway",
          lastName: "User",
          role: "passenger",
          isActive: true,
        });
      }
      
      // Set user session
      req.session.user = {
        id: user.id,
        aadhaarNumber: user.aadhaarNumber,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
      };
      
      // Clear pending auth
      delete req.session.pendingAuth;
      
      res.json({ 
        success: true, 
        user: {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          aadhaarNumber: user.aadhaarNumber
        }
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Failed to verify OTP" });
    }
  });

  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.session.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        aadhaarNumber: user.aadhaarNumber,
        profileImageUrl: user.profileImageUrl,
        stationCode: user.stationCode
      });
    } catch (error) {
      console.error("User fetch error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // Middleware to check authentication
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Dashboard stats endpoint
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stationId = req.query.stationId ? parseInt(req.query.stationId as string) : undefined;
      const stats = await storage.getDashboardStats(stationId);
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Stations endpoints
  app.get('/api/stations', isAuthenticated, async (req, res) => {
    try {
      const stations = await storage.getStations();
      res.json(stations);
    } catch (error) {
      console.error("Stations fetch error:", error);
      res.status(500).json({ message: "Failed to fetch stations" });
    }
  });

  // Alerts endpoints
  app.get('/api/alerts', isAuthenticated, async (req, res) => {
    try {
      const stationId = req.query.stationId ? parseInt(req.query.stationId as string) : undefined;
      const status = req.query.status as string;
      const alerts = await storage.getAlerts(stationId, status);
      res.json(alerts);
    } catch (error) {
      console.error("Alerts fetch error:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertAlertSchema.parse({
        ...req.body,
        reportedBy: req.session.user.id
      });
      
      const alert = await storage.createAlert(validatedData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_alert',
            data: alert
          }));
        }
      });
      
      res.status(201).json(alert);
    } catch (error) {
      console.error("Alert creation error:", error);
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch('/api/alerts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const { status, assignedTo } = req.body;
      
      const updatedAlert = await storage.updateAlertStatus(alertId, status, assignedTo);
      
      if (!updatedAlert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      // Broadcast update to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'alert_updated',
            data: updatedAlert
          }));
        }
      });
      
      res.json(updatedAlert);
    } catch (error) {
      console.error("Alert update error:", error);
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  // CrowdFlow endpoints
  app.get('/api/crowdflow/:stationId', isAuthenticated, async (req, res) => {
    try {
      const stationId = parseInt(req.params.stationId);
      const currentData = await storage.getCurrentCrowdData(stationId);
      res.json(currentData);
    } catch (error) {
      console.error("CrowdFlow data fetch error:", error);
      res.status(500).json({ message: "Failed to fetch crowd data" });
    }
  });

  app.post('/api/crowdflow', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCrowdflowDataSchema.parse(req.body);
      const crowdData = await storage.addCrowdflowData(validatedData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'crowd_update',
            data: crowdData
          }));
        }
      });
      
      res.status(201).json(crowdData);
    } catch (error) {
      console.error("CrowdFlow data creation error:", error);
      res.status(500).json({ message: "Failed to add crowd data" });
    }
  });

  // Medical Emergency endpoints
  app.get('/api/medical-emergencies', isAuthenticated, async (req, res) => {
    try {
      const status = req.query.status as string;
      const emergencies = await storage.getMedicalEmergencies(status);
      res.json(emergencies);
    } catch (error) {
      console.error("Medical emergencies fetch error:", error);
      res.status(500).json({ message: "Failed to fetch medical emergencies" });
    }
  });

  app.post('/api/medical-emergencies', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMedicalEmergencySchema.parse(req.body);
      const emergency = await storage.createMedicalEmergency(validatedData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'medical_emergency',
            data: emergency
          }));
        }
      });
      
      res.status(201).json(emergency);
    } catch (error) {
      console.error("Medical emergency creation error:", error);
      res.status(500).json({ message: "Failed to create medical emergency" });
    }
  });

  // Safety Incident endpoints
  app.get('/api/safety-incidents', isAuthenticated, async (req, res) => {
    try {
      const status = req.query.status as string;
      const incidents = await storage.getSafetyIncidents(status);
      res.json(incidents);
    } catch (error) {
      console.error("Safety incidents fetch error:", error);
      res.status(500).json({ message: "Failed to fetch safety incidents" });
    }
  });

  app.post('/api/safety-incidents', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSafetyIncidentSchema.parse(req.body);
      const incident = await storage.createSafetyIncident(validatedData);
      
      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'safety_incident',
            data: incident
          }));
        }
      });
      
      res.status(201).json(incident);
    } catch (error) {
      console.error("Safety incident creation error:", error);
      res.status(500).json({ message: "Failed to create safety incident" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe_station':
            // In production, you'd store subscription info per client
            ws.send(JSON.stringify({
              type: 'subscription_confirmed',
              stationId: data.stationId
            }));
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
    
    // Send initial connection message
    ws.send(JSON.stringify({
      type: 'connected',
      timestamp: new Date().toISOString()
    }));
  });

  return httpServer;
}
