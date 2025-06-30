import { z } from "zod";

// Base URL for Indian Rail API
const INDIAN_RAIL_API_BASE = "https://indianrailapi.com/api/v2";

// API schemas for type safety
const TrainStatusSchema = z.object({
  train_num: z.string(),
  train_name: z.string(),
  from_stn: z.object({
    stn_code: z.string(),
    stn_name: z.string(),
    arrival_time: z.string().optional(),
    departure_time: z.string(),
  }),
  to_stn: z.object({
    stn_code: z.string(),
    stn_name: z.string(),
    arrival_time: z.string(),
    departure_time: z.string().optional(),
  }),
  running_on: z.string(),
  chart_prepared: z.boolean(),
  current_location: z.object({
    stn_code: z.string(),
    stn_name: z.string(),
    arrival_time: z.string().optional(),
    departure_time: z.string().optional(),
    delay: z.string().optional(),
    updated_at: z.string(),
  }).optional(),
  stations: z.array(z.object({
    stn_code: z.string(),
    stn_name: z.string(),
    arrival_time: z.string().optional(),
    departure_time: z.string().optional(),
    halt_time: z.string().optional(),
    distance: z.string().optional(),
    delay: z.string().optional(),
    platform: z.string().optional(),
  })),
});

const StationInfoSchema = z.object({
  stn_code: z.string(),
  stn_name: z.string(),
  state: z.string(),
  zone: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  trains: z.array(z.object({
    train_num: z.string(),
    train_name: z.string(),
    arrival_time: z.string().optional(),
    departure_time: z.string().optional(),
    delay: z.string().optional(),
    platform: z.string().optional(),
  })).optional(),
});

const PNRStatusSchema = z.object({
  pnr_num: z.string(),
  train_num: z.string(),
  train_name: z.string(),
  journey_date: z.string(),
  boarding_point: z.object({
    stn_code: z.string(),
    stn_name: z.string(),
  }),
  reservation_upto: z.object({
    stn_code: z.string(),
    stn_name: z.string(),
  }),
  chart_prepared: z.boolean(),
  passengers: z.array(z.object({
    passenger_serial_number: z.number(),
    booking_status: z.string(),
    current_status: z.string(),
    coach_position: z.string().optional(),
    berth_number: z.string().optional(),
  })),
});

export type TrainStatus = z.infer<typeof TrainStatusSchema>;
export type StationInfo = z.infer<typeof StationInfoSchema>;
export type PNRStatus = z.infer<typeof PNRStatusSchema>;

class IndianRailAPIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.INDIAN_RAIL_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('INDIAN_RAIL_API_KEY environment variable is required');
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${INDIAN_RAIL_API_BASE}${endpoint}`);
    url.searchParams.append('apikey', this.apiKey);
    
    // Add additional parameters
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Indian Rail API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getTrainStatus(trainNumber: string, date?: string): Promise<TrainStatus> {
    const params: Record<string, string> = { train_num: trainNumber };
    if (date) {
      params.date = date; // Format: YYYY-MM-DD
    }

    const data = await this.makeRequest('/LiveTrainStatus', params);
    return TrainStatusSchema.parse(data);
  }

  async getStationInfo(stationCode: string): Promise<StationInfo> {
    const data = await this.makeRequest('/StationDetails', { stn_code: stationCode });
    return StationInfoSchema.parse(data);
  }

  async getTrainsAtStation(stationCode: string, hours: number = 2): Promise<StationInfo> {
    const data = await this.makeRequest('/TrainsAtStation', { 
      stn_code: stationCode,
      hours: hours.toString()
    });
    return StationInfoSchema.parse(data);
  }

  async getPNRStatus(pnrNumber: string): Promise<PNRStatus> {
    const data = await this.makeRequest('/PNRStatus', { pnr_num: pnrNumber });
    return PNRStatusSchema.parse(data);
  }

  async searchTrains(from: string, to: string, date?: string): Promise<TrainStatus[]> {
    const params: Record<string, string> = { 
      from_stn_code: from,
      to_stn_code: to
    };
    if (date) {
      params.date = date;
    }

    const data = await this.makeRequest('/TrainBetweenStations', params);
    return z.array(TrainStatusSchema).parse(data);
  }

  async getTrainRoute(trainNumber: string): Promise<TrainStatus> {
    const data = await this.makeRequest('/TrainRoute', { train_num: trainNumber });
    return TrainStatusSchema.parse(data);
  }

  async getAllStations(): Promise<StationInfo[]> {
    const data = await this.makeRequest('/AllStations');
    return z.array(StationInfoSchema).parse(data);
  }
}

export const indianRailAPI = new IndianRailAPIService();