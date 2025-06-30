import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Alert } from "@/types";

interface AlertsPanelProps {
  alerts: Alert[];
  userRole: string;
  onAlertUpdate: () => void;
}

export default function AlertsPanel({ alerts, userRole, onAlertUpdate }: AlertsPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateAlertMutation = useMutation({
    mutationFn: async ({ alertId, status }: { alertId: number; status: string }) => {
      await apiRequest('PATCH', `/api/alerts/${alertId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Alert Updated",
        description: "Alert status has been updated successfully.",
      });
      onAlertUpdate();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getAlertIcon = (type: string) => {
    const icons: Record<string, string> = {
      medical: 'fas fa-heartbeat',
      crowd: 'fas fa-users',
      safety: 'fas fa-shield-alt',
      security: 'fas fa-video',
      default: 'fas fa-exclamation-triangle'
    };
    return icons[type] || icons.default;
  };

  const getAlertColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-600',
      medium: 'bg-alert-orange',
      high: 'bg-alert-orange',
      critical: 'bg-danger-red'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'text-blue-600',
      medium: 'text-alert-orange',
      high: 'text-alert-orange',
      critical: 'text-danger-red'
    };
    return colors[severity] || colors.medium;
  };

  const getActionButtonColor = (type: string) => {
    const colors: Record<string, string> = {
      medical: 'bg-danger-red hover:bg-red-700',
      safety: 'bg-pink-600 hover:bg-pink-700',
      crowd: 'bg-alert-orange hover:bg-orange-600',
      default: 'bg-railway-blue hover:bg-blue-700'
    };
    return colors[type] || colors.default;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const alertTime = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - alertTime.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const canRespond = (alert: Alert) => {
    if (userRole === 'admin') return true;
    if (userRole === 'staff') return true;
    if (userRole === 'volunteer' && (alert.type === 'medical' || alert.type === 'safety')) return true;
    return false;
  };

  const handleRespond = (alertId: number) => {
    updateAlertMutation.mutate({ alertId, status: 'resolved' });
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h3>
        <div className="text-center text-gray-500 py-8">
          <i className="fas fa-check-circle text-4xl text-safe-green mb-4"></i>
          <p>No active alerts</p>
          <p className="text-sm mt-2">All systems operating normally</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
          <span className="bg-danger-red text-white text-xs px-2 py-1 rounded-full">
            {alerts.length} Active
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto custom-scrollbar">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 ${getAlertColor(alert.severity)} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`${getAlertIcon(alert.type)} text-white text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    {alert.description && (
                      <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      {alert.platformNumber && (
                        <span className="text-xs text-gray-500">Platform {alert.platformNumber}</span>
                      )}
                      {alert.coachNumber && (
                        <span className="text-xs text-gray-500">Coach {alert.coachNumber}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{formatTimeAgo(alert.createdAt)}</span>
                      <span className={`text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {canRespond(alert) && (
                    <Button
                      size="sm"
                      className={`text-xs px-3 py-1 ml-2 ${getActionButtonColor(alert.type)}`}
                      onClick={() => handleRespond(alert.id)}
                      disabled={updateAlertMutation.isPending}
                    >
                      {updateAlertMutation.isPending ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        'Respond'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200">
        <Button variant="link" className="w-full text-sm text-railway-blue">
          View All Alerts ({alerts.length + 6})
        </Button>
      </div>
    </div>
  );
}
