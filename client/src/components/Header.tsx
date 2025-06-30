import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User, Station } from "@/types";

interface HeaderProps {
  user: User;
  selectedStationId?: number;
  onStationChange: (stationId: number | undefined) => void;
}

export default function Header({ user, selectedStationId, onStationChange }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const { data: stations } = useQuery<Station[]>({
    queryKey: ["/api/stations"],
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getStationName = () => {
    if (!selectedStationId || !stations) return 'All Stations';
    const station = stations.find(s => s.id === selectedStationId);
    return station ? `${station.name} (${station.code})` : 'Unknown Station';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Operations Dashboard</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <i className="fas fa-clock"></i>
            <span>{formatTime(currentTime)}</span>
            <span className="mx-2">•</span>
            <span>{getStationName()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Station Selector (for staff and admin) */}
          {(user.role === 'staff' || user.role === 'admin') && stations && (
            <Select
              value={selectedStationId?.toString() || 'all'}
              onValueChange={(value) => onStationChange(value === 'all' ? undefined : parseInt(value))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Station" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stations</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id.toString()}>
                    {station.name} ({station.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Global Search */}
          <div className="relative">
            <Input
              type="text"
              placeholder="Search PNR, Train, Emergency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <i className="fas fa-bell text-xl"></i>
            <span className="absolute -top-1 -right-1 bg-danger-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              6
            </span>
          </Button>
          
          {/* Emergency Button */}
          <Button className="bg-danger-red hover:bg-red-700 text-white">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Emergency
          </Button>
        </div>
      </div>
    </header>
  );
}
