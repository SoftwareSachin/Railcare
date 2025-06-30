import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ModuleConfig } from "@/types";

interface ModuleCardsProps {
  userRole: string;
}

const moduleConfigs: ModuleConfig[] = [
  {
    id: 'crowdflow',
    name: 'CrowdFlow',
    icon: 'fas fa-users',
    color: 'text-blue-600',
    description: 'Real-time crowd monitoring and density alerts',
    roles: ['passenger', 'staff', 'admin'],
    path: '/crowdflow'
  },
  {
    id: 'medilink',
    name: 'MediLink',
    icon: 'fas fa-heartbeat',
    color: 'text-red-600',
    description: 'Emergency medical assistance and SOS alerts',
    roles: ['passenger', 'volunteer', 'staff', 'admin'],
    path: '/medilink'
  },
  {
    id: 'inforeach',
    name: 'InfoReach',
    icon: 'fas fa-broadcast-tower',
    color: 'text-green-600',
    description: 'Train information and passenger updates',
    roles: ['passenger', 'staff', 'admin'],
    path: '/inforeach'
  },
  {
    id: 'safeher',
    name: 'SafeHer',
    icon: 'fas fa-shield-alt',
    color: 'text-pink-600',
    description: 'Women safety features and escort services',
    roles: ['passenger', 'volunteer', 'staff', 'admin'],
    path: '/safeher'
  },
  {
    id: 'safeserve',
    name: 'SafeServe',
    icon: 'fas fa-utensils',
    color: 'text-orange-600',
    description: 'Food and water quality verification',
    roles: ['passenger', 'staff', 'admin'],
    path: '/safeserve'
  },
  {
    id: 'flexifare',
    name: 'FlexiFare',
    icon: 'fas fa-ticket-alt',
    color: 'text-indigo-600',
    description: 'Dynamic pricing and ticket management',
    roles: ['passenger', 'admin'],
    path: '/flexifare'
  },
  {
    id: 'trackguard',
    name: 'TrackGuard',
    icon: 'fas fa-video',
    color: 'text-purple-600',
    description: 'CCTV monitoring and security alerts',
    roles: ['staff', 'admin'],
    path: '/trackguard'
  },
  {
    id: 'homeid',
    name: 'HomeID',
    icon: 'fas fa-home',
    color: 'text-teal-600',
    description: 'Platform dweller identification and support',
    roles: ['volunteer', 'staff', 'admin'],
    path: '/homeid'
  }
];

export default function ModuleCards({ userRole }: ModuleCardsProps) {
  const availableModules = moduleConfigs.filter(module => 
    module.roles.includes(userRole) || userRole === 'admin'
  );

  const getQuickActions = (moduleId: string) => {
    const actions: Record<string, { label: string; action: string; color: string }[]> = {
      crowdflow: [
        { label: 'View Live Map', action: 'view-map', color: 'bg-blue-600' },
        { label: 'Check Capacity', action: 'check-capacity', color: 'bg-blue-500' }
      ],
      medilink: [
        { label: 'Emergency SOS', action: 'sos', color: 'bg-red-600' },
        { label: 'Find Medical Help', action: 'medical-help', color: 'bg-red-500' }
      ],
      inforeach: [
        { label: 'Train Status', action: 'train-status', color: 'bg-green-600' },
        { label: 'Platform Info', action: 'platform-info', color: 'bg-green-500' }
      ],
      safeher: [
        { label: 'Panic Button', action: 'panic', color: 'bg-pink-600' },
        { label: 'Request Escort', action: 'escort', color: 'bg-pink-500' }
      ],
      safeserve: [
        { label: 'Scan QR Code', action: 'scan-qr', color: 'bg-orange-600' },
        { label: 'Report Issue', action: 'report', color: 'bg-orange-500' }
      ],
      flexifare: [
        { label: 'Book Ticket', action: 'book', color: 'bg-indigo-600' },
        { label: 'Check Fares', action: 'fares', color: 'bg-indigo-500' }
      ]
    };
    return actions[moduleId] || [];
  };

  const getModuleStatus = (moduleId: string) => {
    // Mock status for demonstration
    const statuses: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      crowdflow: { label: 'Normal', variant: 'default' },
      medilink: { label: 'Active', variant: 'destructive' },
      inforeach: { label: 'Live', variant: 'default' },
      safeher: { label: 'Available', variant: 'default' },
      safeserve: { label: 'Online', variant: 'default' },
      flexifare: { label: 'Active', variant: 'default' }
    };
    return statuses[moduleId] || { label: 'Available', variant: 'default' as const };
  };

  if (availableModules.length === 0) {
    return (
      <div className="text-center py-8">
        <i className="fas fa-lock text-4xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">No services available for your role</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {availableModules.map((module) => {
        const status = getModuleStatus(module.id);
        const actions = getQuickActions(module.id);
        
        return (
          <Card key={module.id} className="hover:shadow-lg transition-shadow duration-200 border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3`}>
                  <i className={`${module.icon} ${module.color} text-xl`}></i>
                </div>
                <Badge variant={status.variant} className="text-xs">
                  {status.label}
                </Badge>
              </div>
              <CardTitle className="text-lg font-semibold">{module.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {module.description}
              </p>
              
              {actions.length > 0 && (
                <div className="space-y-2">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      className={`w-full text-xs ${action.color} hover:opacity-90 text-white`}
                      onClick={() => {
                        // Handle action click - in production this would navigate or trigger actions
                        console.log(`${module.id}: ${action.action}`);
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
              
              {userRole === 'passenger' && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Last used</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
