import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LiveTrainData {
  train_num: string;
  train_name: string;
  current_location?: {
    stn_name: string;
    stn_code: string;
    delay?: string;
    updated_at: string;
  };
  from_stn: {
    stn_name: string;
    stn_code: string;
  };
  to_stn: {
    stn_name: string;
    stn_code: string;
  };
}

export default function LiveTrainDashboard() {
  const [featuredTrains] = useState([
    "12951", // Mumbai Rajdhani
    "12301", // Howrah Rajdhani  
    "12009", // Shatabdi Express
    "12002", // Bhopal Shatabdi
    "22470"  // Vande Bharat
  ]);

  const [refreshInterval, setRefreshInterval] = useState(30000);

  // Query for multiple trains
  const trainQueries = featuredTrains.map(trainNum => 
    useQuery<LiveTrainData>({
      queryKey: ["/api/live/train", trainNum, "status"],
      enabled: true,
      refetchInterval: refreshInterval,
      retry: 1
    })
  );

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

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-train text-irctc-orange"></i>
            <span>Live Train Tracking</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <i className="fas fa-broadcast-tower mr-1"></i>
              Live
            </Badge>
            <span className="text-xs text-gray-500">
              Updates every {refreshInterval/1000}s
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trainQueries.map((query, index) => {
            const trainNum = featuredTrains[index];
            const { data: train, isLoading, error } = query;

            return (
              <div 
                key={trainNum} 
                className="p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-shadow"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-pulse bg-gray-200 rounded w-16 h-4"></div>
                    <div className="animate-pulse bg-gray-200 rounded w-32 h-4"></div>
                    <div className="ml-auto animate-pulse bg-gray-200 rounded w-20 h-6"></div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Train #{trainNum}</p>
                      <p className="text-sm text-gray-500">Unable to fetch live data</p>
                    </div>
                    <Badge variant="outline" className="text-gray-500">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      No Data
                    </Badge>
                  </div>
                ) : train ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-lg">{train.train_name}</h4>
                          <Badge variant="outline">#{train.train_num}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {train.from_stn.stn_name} → {train.to_stn.stn_name}
                        </p>
                      </div>
                      {train.current_location?.delay && getDelayBadge(train.current_location.delay)}
                    </div>

                    {train.current_location && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-blue-900">
                              <i className="fas fa-map-marker-alt mr-2 text-blue-600"></i>
                              {train.current_location.stn_name}
                            </p>
                            <p className="text-sm text-blue-600">
                              {train.current_location.stn_code}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-blue-600">
                              Updated: {formatTime(train.current_location.updated_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <i className="fas fa-train text-2xl mb-2 opacity-50"></i>
                    <p className="text-sm">No data available</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Action Button */}
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.href = '/inforeach'}
            >
              <i className="fas fa-search mr-2"></i>
              Search Any Train Status
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}