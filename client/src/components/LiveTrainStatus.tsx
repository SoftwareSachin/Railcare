import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface TrainStatus {
  train_num: string;
  train_name: string;
  from_stn: {
    stn_code: string;
    stn_name: string;
    departure_time: string;
  };
  to_stn: {
    stn_code: string;
    stn_name: string;
    arrival_time: string;
  };
  running_on: string;
  chart_prepared: boolean;
  current_location?: {
    stn_code: string;
    stn_name: string;
    arrival_time?: string;
    departure_time?: string;
    delay?: string;
    updated_at: string;
  };
  stations: Array<{
    stn_code: string;
    stn_name: string;
    arrival_time?: string;
    departure_time?: string;
    halt_time?: string;
    distance?: string;
    delay?: string;
    platform?: string;
  }>;
}

export default function LiveTrainStatus() {
  const [trainNumber, setTrainNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchedTrain, setSearchedTrain] = useState<string | null>(null);
  const { toast } = useToast();

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const { data: trainStatus, isLoading, error, refetch } = useQuery<TrainStatus>({
    queryKey: ["/api/live/train", searchedTrain, "status", selectedDate],
    enabled: !!searchedTrain,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleSearch = () => {
    if (!trainNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a train number",
        variant: "destructive"
      });
      return;
    }
    setSearchedTrain(trainNumber.trim());
  };

  const getDelayStatus = (delay?: string) => {
    if (!delay || delay === "0" || delay === "On Time") {
      return { status: "On Time", variant: "default" as const, color: "text-green-600" };
    }
    const delayMinutes = parseInt(delay);
    if (delayMinutes <= 15) {
      return { status: `${delay} late`, variant: "secondary" as const, color: "text-yellow-600" };
    }
    return { status: `${delay} late`, variant: "destructive" as const, color: "text-red-600" };
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
            <i className="fas fa-train text-irctc-orange"></i>
            <span>Live Train Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter train number (e.g., 12345)"
                value={trainNumber}
                onChange={(e) => setTrainNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="w-full sm:w-auto">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-40"
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
        </CardContent>
      </Card>

      {/* Results Section */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Failed to fetch train status. Please check the train number and try again.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {trainStatus && (
        <div className="space-y-4">
          {/* Train Header Info */}
          <Card className="bg-gradient-to-r from-irctc-navy to-irctc-navy/80 text-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{trainStatus.train_name}</h2>
                  <p className="text-white/80">Train #{trainStatus.train_num}</p>
                  <p className="text-sm text-white/70">
                    Running on: {trainStatus.running_on}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/80">
                    Chart Status: 
                    <Badge 
                      variant={trainStatus.chart_prepared ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {trainStatus.chart_prepared ? "Prepared" : "Not Prepared"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Info */}
          <Card>
            <CardHeader>
              <CardTitle>Route Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Origin</h4>
                  <p className="font-medium">{trainStatus.from_stn.stn_name}</p>
                  <p className="text-sm text-gray-600">{trainStatus.from_stn.stn_code}</p>
                  <p className="text-sm">Departure: {formatTime(trainStatus.from_stn.departure_time)}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Destination</h4>
                  <p className="font-medium">{trainStatus.to_stn.stn_name}</p>
                  <p className="text-sm text-gray-600">{trainStatus.to_stn.stn_code}</p>
                  <p className="text-sm">Arrival: {formatTime(trainStatus.to_stn.arrival_time)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Location */}
          {trainStatus.current_location && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-map-marker-alt text-blue-600"></i>
                  <span>Current Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold">{trainStatus.current_location.stn_name}</p>
                    <p className="text-sm text-gray-600">{trainStatus.current_location.stn_code}</p>
                  </div>
                  <div>
                    <p className="text-sm">
                      {trainStatus.current_location.arrival_time && (
                        <>Arrival: {formatTime(trainStatus.current_location.arrival_time)}</>
                      )}
                      {trainStatus.current_location.departure_time && (
                        <>Departure: {formatTime(trainStatus.current_location.departure_time)}</>
                      )}
                    </p>
                  </div>
                  <div>
                    {trainStatus.current_location.delay && (
                      <Badge variant={getDelayStatus(trainStatus.current_location.delay).variant}>
                        {getDelayStatus(trainStatus.current_location.delay).status}
                      </Badge>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Updated: {new Date(trainStatus.current_location.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Station List */}
          <Card>
            <CardHeader>
              <CardTitle>Station Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {trainStatus.stations.map((station, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      station.stn_code === trainStatus.current_location?.stn_code 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{station.stn_name}</span>
                        <span className="text-sm text-gray-600">({station.stn_code})</span>
                        {station.stn_code === trainStatus.current_location?.stn_code && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {station.arrival_time && (
                          <span className="mr-4">Arr: {formatTime(station.arrival_time)}</span>
                        )}
                        {station.departure_time && (
                          <span className="mr-4">Dep: {formatTime(station.departure_time)}</span>
                        )}
                        {station.halt_time && (
                          <span className="mr-4">Halt: {station.halt_time}</span>
                        )}
                        {station.distance && (
                          <span>Distance: {station.distance} km</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {station.platform && (
                        <p className="text-sm text-gray-600">Platform: {station.platform}</p>
                      )}
                      {station.delay && (
                        <Badge 
                          variant={getDelayStatus(station.delay).variant}
                          className="mt-1"
                        >
                          {getDelayStatus(station.delay).status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}