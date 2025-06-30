import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface StationInfo {
  stn_code: string;
  stn_name: string;
  state: string;
  zone: string;
  latitude?: number;
  longitude?: number;
  trains?: Array<{
    train_num: string;
    train_name: string;
    arrival_time?: string;
    departure_time?: string;
    delay?: string;
    platform?: string;
  }>;
}

export default function LiveStationInfo() {
  const [stationCode, setStationCode] = useState("");
  const [searchedStation, setSearchedStation] = useState<string | null>(null);
  const [hours, setHours] = useState("2");
  const { toast } = useToast();

  const { data: stationInfo, isLoading, error } = useQuery<StationInfo>({
    queryKey: ["/api/live/station", searchedStation],
    enabled: !!searchedStation,
  });

  const { data: trainsAtStation, isLoading: trainsLoading } = useQuery<StationInfo>({
    queryKey: ["/api/live/station", searchedStation, "trains", hours],
    enabled: !!searchedStation,
    refetchInterval: 60000, // Refresh every minute
  });

  const handleSearch = () => {
    if (!stationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a station code",
        variant: "destructive"
      });
      return;
    }
    setSearchedStation(stationCode.trim().toUpperCase());
  };

  const getDelayBadge = (delay?: string) => {
    if (!delay || delay === "0" || delay === "On Time") {
      return <Badge variant="default" className="bg-green-100 text-green-800">On Time</Badge>;
    }
    const delayMinutes = parseInt(delay);
    if (delayMinutes <= 15) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{delay} late</Badge>;
    }
    return <Badge variant="destructive">{delay} late</Badge>;
  };

  const formatTime = (time?: string) => {
    if (!time) return "N/A";
    return time;
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-building text-irctc-orange"></i>
            <span>Live Station Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter station code (e.g., NDLS, BCT, MAS)"
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-full sm:w-32">
              <Input
                type="number"
                placeholder="Hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                min="1"
                max="24"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="bg-irctc-orange hover:bg-irctc-orange/90"
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-search mr-2"></i>
              )}
              Search
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Enter station code and hours to view trains arriving/departing within that time window
          </p>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Failed to fetch station information. Please check the station code and try again.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Station Information */}
      {stationInfo && (
        <Card className="bg-gradient-to-r from-irctc-navy to-irctc-navy/80 text-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-2xl font-bold">{stationInfo.stn_name}</h2>
                <p className="text-white/80">Station Code: {stationInfo.stn_code}</p>
                <p className="text-sm text-white/70">
                  {stationInfo.state} • {stationInfo.zone} Zone
                </p>
              </div>
              {stationInfo.latitude && stationInfo.longitude && (
                <div className="text-right">
                  <p className="text-sm text-white/80">Coordinates:</p>
                  <p className="text-xs text-white/70">
                    {stationInfo.latitude}°N, {stationInfo.longitude}°E
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trains at Station */}
      {trainsAtStation?.trains && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Trains at {stationInfo?.stn_name}</span>
              <Badge variant="outline">
                Next {hours} hours
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trainsLoading ? (
              <div className="flex items-center justify-center py-8">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                <span>Loading trains...</span>
              </div>
            ) : trainsAtStation.trains.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {trainsAtStation.trains.map((train, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-lg">{train.train_name}</h4>
                          <Badge variant="outline">#{train.train_num}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {train.arrival_time && (
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-arrow-down text-green-600"></i>
                              <span>Arrival: {formatTime(train.arrival_time)}</span>
                            </div>
                          )}
                          {train.departure_time && (
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-arrow-up text-red-600"></i>
                              <span>Departure: {formatTime(train.departure_time)}</span>
                            </div>
                          )}
                          {train.platform && (
                            <div className="flex items-center space-x-2">
                              <i className="fas fa-map-signs text-blue-600"></i>
                              <span>Platform: {train.platform}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {getDelayBadge(train.delay)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-train text-4xl mb-4 opacity-50"></i>
                <p>No trains found for the selected time window</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}