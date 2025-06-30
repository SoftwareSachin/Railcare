import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/types";

interface SidebarProps {
  user: User;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: string[];
  color?: string;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'fas fa-tachometer-alt',
    path: '/',
    roles: ['passenger', 'volunteer', 'staff', 'admin'],
  },
  {
    id: 'crowdflow',
    label: 'CrowdFlow',
    icon: 'fas fa-users',
    path: '/crowdflow',
    roles: ['staff', 'admin'],
    color: 'text-blue-600',
  },
  {
    id: 'medilink',
    label: 'MediLink',
    icon: 'fas fa-heartbeat',
    path: '/medilink',
    roles: ['volunteer', 'staff', 'admin'],
    color: 'text-red-600',
  },
  {
    id: 'safeher',
    label: 'SafeHer',
    icon: 'fas fa-shield-alt',
    path: '/safeher',
    roles: ['passenger', 'volunteer', 'staff', 'admin'],
    color: 'text-pink-600',
  },
  {
    id: 'trackguard',
    label: 'TrackGuard',
    icon: 'fas fa-video',
    path: '/trackguard',
    roles: ['staff', 'admin'],
    color: 'text-purple-600',
  },
  {
    id: 'inforeach',
    label: 'InfoReach',
    icon: 'fas fa-broadcast-tower',
    path: '/inforeach',
    roles: ['passenger', 'staff', 'admin'],
    color: 'text-green-600',
  },
  {
    id: 'safeserve',
    label: 'SafeServe',
    icon: 'fas fa-utensils',
    path: '/safeserve',
    roles: ['passenger', 'staff', 'admin'],
    color: 'text-orange-600',
  },
  {
    id: 'flexifare',
    label: 'FlexiFare',
    icon: 'fas fa-ticket-alt',
    path: '/flexifare',
    roles: ['passenger', 'admin'],
    color: 'text-indigo-600',
  },
  {
    id: 'homeid',
    label: 'HomeID',
    icon: 'fas fa-home',
    path: '/homeid',
    roles: ['volunteer', 'staff', 'admin'],
    color: 'text-teal-600',
  },
];

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  const [language, setLanguage] = useState('en');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const canAccess = (roles: string[]) => {
    return roles.includes(user.role) || user.role === 'admin';
  };

  const safetyItems = navigationItems.filter(item => 
    ['crowdflow', 'medilink', 'safeher', 'trackguard'].includes(item.id) && canAccess(item.roles)
  );

  const serviceItems = navigationItems.filter(item => 
    ['inforeach', 'safeserve', 'flexifare', 'homeid'].includes(item.id) && canAccess(item.roles)
  );

  const getUserInitials = () => {
    const names = user.name.split(' ');
    return names.map(name => name[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleDisplay = () => {
    const roleMap = {
      passenger: 'Passenger',
      volunteer: 'Volunteer',
      staff: 'Station Staff',
      admin: 'Administrator'
    };
    return roleMap[user.role] || 'User';
  };

  return (
    <div className="bg-irctc-navy shadow-lg w-80 flex-shrink-0 overflow-y-auto custom-scrollbar">
      {/* User Profile Section - IRCTC Style */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.profileImageUrl} alt={user.name} className="object-cover" />
            <AvatarFallback className="bg-irctc-orange text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{user.name}</h3>
            <p className="text-sm text-white/80">{getRoleDisplay()}</p>
            {user.aadhaarNumber && (
              <p className="text-xs text-white/60 font-mono">
                ID: {user.aadhaarNumber.slice(0, 4)}****{user.aadhaarNumber.slice(-4)}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-24 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
              <SelectItem value="bn">বাংলা</SelectItem>
              <SelectItem value="ta">தமிழ்</SelectItem>
              <SelectItem value="te">తెలుగు</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-white hover:bg-white/10"
          >
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <div className="space-y-2">
          {/* Dashboard */}
          <Link href="/">
            <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              location === '/' ? 'bg-irctc-orange text-white' : 'text-white/80 hover:bg-white/10'
            }`}>
              <i className="fas fa-tachometer-alt w-5"></i>
              <span>Dashboard</span>
            </div>
          </Link>

          {/* Safety & Operations Group */}
          {safetyItems.length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Safety & Operations
              </h4>
              {safetyItems.map((item) => (
                <Link key={item.id} href={item.path}>
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location === item.path ? 'bg-irctc-orange text-white' : 'text-white/80 hover:bg-white/10'
                  }`}>
                    <i className={`${item.icon} w-5 text-white`}></i>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-irctc-orange text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Information & Services Group */}
          {serviceItems.length > 0 && (
            <div className="pt-4">
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Information & Services
              </h4>
              {serviceItems.map((item) => (
                <Link key={item.id} href={item.path}>
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location === item.path ? 'bg-irctc-orange text-white' : 'text-white/80 hover:bg-white/10'
                  }`}>
                    <i className={`${item.icon} w-5 text-white`}></i>
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
