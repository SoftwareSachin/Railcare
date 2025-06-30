import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PNRStatus {
  pnr_num: string;
  train_num: string;
  train_name: string;
  journey_date: string;
  boarding_point: {
    stn_code: string;
    stn_name: string;
  };
  reservation_upto: {
    stn_code: string;
    stn_name: string;
  };
  chart_prepared: boolean;
  passengers: Array<{
    passenger_serial_number: number;
    booking_status: string;
    current_status: string;
    coach_position?: string;
    berth_number?: string;
  }>;
}

export default function PNRStatus() {
  const [pnrNumber, setPnrNumber] = useState("");
  const [searchedPNR, setSearchedPNR] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: pnrStatus, isLoading, error } = useQuery<PNRStatus>({
    queryKey: ["/api/live/pnr", searchedPNR],
    enabled: !!searchedPNR,
  });

  const handleSearch = () => {
    if (!pnrNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a PNR number",
        variant: "destructive"
      });
      return;
    }
    
    // Validate PNR format (10 digits)
    if (!/^\d{10}$/.test(pnrNumber.trim())) {
      toast({
        title: "Invalid PNR",
        description: "PNR number should be 10 digits",
        variant: "destructive"
      });
      return;
    }
    
    setSearchedPNR(pnrNumber.trim());
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus.includes("confirmed") || normalizedStatus.includes("cnf")) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Confirmed</Badge>;
    }
    if (normalizedStatus.includes("waiting") || normalizedStatus.includes("wl")) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Waiting List</Badge>;
    }
    if (normalizedStatus.includes("rac")) {
      return <Badge variant="outline" className="border-orange-300 text-orange-700">RAC</Badge>;
    }
    if (normalizedStatus.includes("can") || normalizedStatus.includes("cancelled")) {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    
    return <Badge variant="outline">{status}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-ticket-alt text-irctc-orange"></i>
            <span>PNR Status Check</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter 10-digit PNR number"
                value={pnrNumber}
                onChange={(e) => setPnrNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                maxLength={10}
                pattern="\d{10}"
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
              Check Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Failed to fetch PNR status. Please check the PNR number and try again.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PNR Results */}
      {pnrStatus && (
        <div className="space-y-4">
          {/* Journey Header */}
          <Card className="bg-gradient-to-r from-irctc-navy to-irctc-navy/80 text-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{pnrStatus.train_name}</h2>
                  <p className="text-white/80">Train #{pnrStatus.train_num}</p>
                  <p className="text-sm text-white/70">
                    PNR: {pnrStatus.pnr_num}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/80">
                    Journey Date: {formatDate(pnrStatus.journey_date)}
                  </div>
                  <div className="mt-2">
                    Chart Status: 
                    <Badge 
                      variant={pnrStatus.chart_prepared ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {pnrStatus.chart_prepared ? "Prepared" : "Not Prepared"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Journey Details */}
          <Card>
            <CardHeader>
              <CardTitle>Journey Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Boarding Point</h4>
                  <p className="font-medium">{pnrStatus.boarding_point.stn_name}</p>
                  <p className="text-sm text-gray-600">{pnrStatus.boarding_point.stn_code}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Destination</h4>
                  <p className="font-medium">{pnrStatus.reservation_upto.stn_name}</p>
                  <p className="text-sm text-gray-600">{pnrStatus.reservation_upto.stn_code}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passenger Details */}
          <Card>
            <CardHeader>
              <CardTitle>Passenger Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pnrStatus.passengers.map((passenger, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-irctc-navy text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                        {passenger.passenger_serial_number}
                      </div>
                      <div>
                        <p className="font-medium">Passenger #{passenger.passenger_serial_number}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>Booking: {passenger.booking_status}</span>
                          {passenger.coach_position && (
                            <span>Coach: {passenger.coach_position}</span>
                          )}
                          {passenger.berth_number && (
                            <span>Berth: {passenger.berth_number}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(passenger.current_status)}
                    </div>
                  </div>
                ))}
              </div>
              
              {pnrStatus.passengers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-users text-4xl mb-4 opacity-50"></i>
                  <p>No passenger information available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}