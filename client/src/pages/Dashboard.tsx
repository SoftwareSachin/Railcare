import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatusCard from "@/components/StatusCard";
import StationMap from "@/components/StationMap";
import AlertsPanel from "@/components/AlertsPanel";
import CrowdFlowAnalytics from "@/components/CrowdFlowAnalytics";
import ModuleCards from "@/components/ModuleCards";
import type { DashboardStats, WebSocketMessage, Alert } from "@/types";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStationId, setSelectedStationId] = useState<number | undefined>();

  const { data: stats, refetch: refetchStats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", selectedStationId],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: alerts, refetch: refetchAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts", { status: "active", stationId: selectedStationId }],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // WebSocket for real-time updates
  useWebSocket((message: WebSocketMessage) => {
    switch (message.type) {
      case 'new_alert':
        toast({
          title: "New Alert",
          description: `${message.data.type}: ${message.data.title}`,
          variant: message.data.severity === 'critical' ? 'destructive' : 'default',
        });
        refetchAlerts();
        refetchStats();
        break;
      case 'alert_updated':
        if (message.data.status === 'resolved') {
          toast({
            title: "Alert Resolved",
            description: `${message.data.title} has been resolved`,
            variant: 'default',
          });
        }
        refetchAlerts();
        refetchStats();
        break;
      case 'crowd_update':
        // Handle crowd updates if needed
        break;
      case 'medical_emergency':
        toast({
          title: "Medical Emergency",
          description: "New medical emergency reported",
          variant: 'destructive',
        });
        refetchAlerts();
        break;
      case 'safety_incident':
        toast({
          title: "Safety Incident",
          description: "New safety incident reported",
          variant: 'destructive',
        });
        refetchAlerts();
        break;
    }
  });

  if (!user) {
    return null;
  }

  const canViewModule = (moduleRoles: string[]) => {
    return moduleRoles.includes(user.role) || user.role === 'admin';
  };

  return (
    <div className="flex h-screen bg-irctc-light-gray">
      <Sidebar user={user} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={user} 
          selectedStationId={selectedStationId}
          onStationChange={setSelectedStationId}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Status Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatusCard
              title="Station Capacity"
              value={`${Math.round((stats?.totalPassengers || 0) / 4000 * 100)}%`}
              trend={-12}
              color="safe-green"
              icon="fas fa-users"
            />
            <StatusCard
              title="Active Alerts"
              value={stats?.activeAlerts?.toString() || "0"}
              subtitle={`${stats?.resolvedAlertsToday || 0} resolved today`}
              color="alert-orange"
              icon="fas fa-exclamation-triangle"
            />
            <StatusCard
              title="Trains On-Time"
              value={`${Math.round((stats?.onTimeTrains || 0) / (stats?.totalTrains || 1) * 100)}%`}
              subtitle={`${stats?.onTimeTrains || 0} of ${stats?.totalTrains || 0} trains`}
              color="railway-blue"
              icon="fas fa-train"
            />
            <StatusCard
              title="Avg Response Time"
              value={`${stats?.averageResponseTime || 0} min`}
              color="purple-600"
              icon="fas fa-clock"
            />
          </div>

          {/* Module Cards for Passengers */}
          {user.role === 'passenger' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Services</h2>
              <ModuleCards userRole={user.role} />
            </div>
          )}

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Station Map and CrowdFlow */}
            {canViewModule(['staff', 'admin']) && (
              <div className="lg:col-span-2 space-y-6">
                <StationMap 
                  stationId={selectedStationId}
                  alerts={alerts || []}
                />
                <CrowdFlowAnalytics stationId={selectedStationId} />
              </div>
            )}

            {/* Right Sidebar - Alerts and Activities */}
            <div className="space-y-6">
              <AlertsPanel 
                alerts={alerts || []} 
                userRole={user.role}
                onAlertUpdate={() => {
                  refetchAlerts();
                  refetchStats();
                }}
              />

              {/* Quick Stats */}
              {stats && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Passengers</span>
                      <span className="font-semibold">{stats.totalPassengers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Alerts Resolved</span>
                      <span className="font-semibold text-safe-green">{stats.resolvedAlertsToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Average Response Time</span>
                      <span className="font-semibold">{stats.averageResponseTime} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">System Status</span>
                      <span className="font-semibold text-safe-green">Online</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
