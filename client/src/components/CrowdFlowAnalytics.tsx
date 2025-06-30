import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { CrowdflowData } from "@/types";

interface CrowdFlowAnalyticsProps {
  stationId?: number;
}

export default function CrowdFlowAnalytics({ stationId }: CrowdFlowAnalyticsProps) {
  const { data: crowdData } = useQuery<CrowdflowData[]>({
    queryKey: ["/api/crowdflow", stationId || 1], // Default to station 1 if no station selected
    enabled: !!stationId,
    refetchInterval: 30000, // Update every 30 seconds
  });

  // Calculate average occupancy
  const averageOccupancy = crowdData ? 
    Math.round(crowdData.reduce((sum, data) => sum + data.occupancyPercentage, 0) / crowdData.length) || 67
    : 67;

  // Mock forecast data - in production this would come from AI/ML predictions
  const forecastOccupancy = Math.min(averageOccupancy + 23, 100);
  const forecastTime = 35; // minutes

  // Mock average wait time
  const avgWaitTime = 4.2;

  const getOccupancyColor = (percentage: number) => {
    if (percentage < 60) return 'text-safe-green';
    if (percentage < 85) return 'text-alert-orange';
    return 'text-danger-red';
  };

  const getOccupancyStroke = (percentage: number) => {
    if (percentage < 60) return '#2E7D32';
    if (percentage < 85) return '#F57C00';
    return '#D32F2F';
  };

  const CircularProgress = ({ percentage, color }: { percentage: number; color: string }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center w-24 h-24">
        <svg className="transform -rotate-90 w-24 h-24">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <span className="absolute text-xl font-bold text-gray-900">{percentage}%</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">CrowdFlow Analytics</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Occupancy */}
          <div className="text-center">
            <CircularProgress 
              percentage={averageOccupancy} 
              color={getOccupancyStroke(averageOccupancy)} 
            />
            <p className="text-sm font-medium text-gray-700 mt-2">Current Occupancy</p>
            <p className="text-xs text-gray-500">
              {Math.round((averageOccupancy / 100) * 4250).toLocaleString()} passengers
            </p>
          </div>
          
          {/* Peak Forecast */}
          <div className="text-center">
            <CircularProgress 
              percentage={forecastOccupancy} 
              color={getOccupancyStroke(forecastOccupancy)} 
            />
            <p className="text-sm font-medium text-gray-700 mt-2">Peak Forecast</p>
            <p className="text-xs text-gray-500">In {forecastTime} minutes</p>
          </div>
          
          {/* Average Wait Time */}
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">{avgWaitTime}</div>
            <p className="text-sm font-medium text-gray-700">Avg Wait Time</p>
            <p className="text-xs text-gray-500">minutes</p>
          </div>
        </div>
        
        {/* Platform Status */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { platform: '1-2', occupancy: 45, status: 'Normal' },
            { platform: '3-4', occupancy: 72, status: 'Moderate' },
            { platform: '5-6', occupancy: 91, status: 'Critical' },
          ].map((platform) => (
            <div key={platform.platform} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Platform {platform.platform}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  platform.occupancy < 60 ? 'bg-green-100 text-green-800' :
                  platform.occupancy < 85 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {platform.status}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    platform.occupancy < 60 ? 'bg-safe-green' :
                    platform.occupancy < 85 ? 'bg-alert-orange' :
                    'bg-danger-red'
                  }`}
                  style={{ width: `${platform.occupancy}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{platform.occupancy}% capacity</p>
            </div>
          ))}
        </div>
        
        {/* Quick Actions */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="bg-alert-orange hover:bg-orange-600 text-white">
            <i className="fas fa-broadcast-tower mr-2"></i>
            Send Crowd Alert
          </Button>
          <Button className="bg-railway-blue hover:bg-blue-700 text-white">
            <i className="fas fa-route mr-2"></i>
            Redirect Flow
          </Button>
          <Button variant="outline">
            <i className="fas fa-chart-line mr-2"></i>
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
