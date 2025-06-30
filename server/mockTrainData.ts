// Mock train data service for demonstration and fallback
export const mockTrainData = {
  "12951": {
    train_num: "12951",
    train_name: "Mumbai Rajdhani Express",
    from_stn: {
      stn_code: "MMCT",
      stn_name: "Mumbai Central",
      departure_time: "17:00"
    },
    to_stn: {
      stn_code: "NDLS", 
      stn_name: "New Delhi",
      arrival_time: "08:35"
    },
    running_on: "Daily",
    chart_prepared: true,
    current_location: {
      stn_code: "BRC",
      stn_name: "Vadodara Junction",
      delay: "15 min",
      updated_at: new Date().toISOString()
    },
    stations: [
      {
        stn_code: "MMCT",
        stn_name: "Mumbai Central",
        departure_time: "17:00",
        delay: "On Time"
      },
      {
        stn_code: "BRC",
        stn_name: "Vadodara Junction", 
        arrival_time: "19:42",
        departure_time: "19:47",
        delay: "15 min"
      },
      {
        stn_code: "RTM",
        stn_name: "Ratlam Junction",
        arrival_time: "22:45",
        departure_time: "22:50",
        delay: "10 min"
      }
    ]
  },
  
  "12301": {
    train_num: "12301",
    train_name: "Howrah Rajdhani Express",
    from_stn: {
      stn_code: "NDLS",
      stn_name: "New Delhi", 
      departure_time: "17:00"
    },
    to_stn: {
      stn_code: "HWH",
      stn_name: "Howrah Junction",
      arrival_time: "10:05"
    },
    running_on: "Daily except Sunday",
    chart_prepared: true,
    current_location: {
      stn_code: "PNBE",
      stn_name: "Patna Junction",
      delay: "On Time",
      updated_at: new Date().toISOString()
    },
    stations: [
      {
        stn_code: "NDLS",
        stn_name: "New Delhi",
        departure_time: "17:00",
        delay: "On Time"
      },
      {
        stn_code: "CNB",
        stn_name: "Kanpur Central",
        arrival_time: "22:10",
        departure_time: "22:15",
        delay: "On Time"
      },
      {
        stn_code: "PNBE",
        stn_name: "Patna Junction",
        arrival_time: "05:40",
        departure_time: "05:50",
        delay: "On Time"
      }
    ]
  },

  "12009": {
    train_num: "12009",
    train_name: "Shatabdi Express",
    from_stn: {
      stn_code: "NDLS",
      stn_name: "New Delhi",
      departure_time: "06:00"
    },
    to_stn: {
      stn_code: "UMB",
      stn_name: "Ambala Cantt",
      arrival_time: "09:30"
    },
    running_on: "Daily except Sunday",
    chart_prepared: true,
    current_location: {
      stn_code: "PNP",
      stn_name: "Panipat Junction",
      delay: "5 min",
      updated_at: new Date().toISOString()
    },
    stations: [
      {
        stn_code: "NDLS",
        stn_name: "New Delhi",
        departure_time: "06:00",
        delay: "On Time"
      },
      {
        stn_code: "PNP",
        stn_name: "Panipat Junction",
        arrival_time: "07:02",
        departure_time: "07:04",
        delay: "5 min"
      },
      {
        stn_code: "KUN",
        stn_name: "Karnal",
        arrival_time: "07:36",
        departure_time: "07:38",
        delay: "3 min"
      }
    ]
  },

  "12002": {
    train_num: "12002",
    train_name: "Bhopal Shatabdi",
    from_stn: {
      stn_code: "NDLS",
      stn_name: "New Delhi",
      departure_time: "06:15"
    },
    to_stn: {
      stn_code: "BPL",
      stn_name: "Bhopal Junction",
      arrival_time: "14:05"
    },
    running_on: "Daily except Sunday",
    chart_prepared: true,
    current_location: {
      stn_code: "GWL",
      stn_name: "Gwalior Junction",
      delay: "On Time",
      updated_at: new Date().toISOString()
    },
    stations: [
      {
        stn_code: "NDLS",
        stn_name: "New Delhi",
        departure_time: "06:15",
        delay: "On Time"
      },
      {
        stn_code: "AGC",
        stn_name: "Agra Cantt",
        arrival_time: "08:20",
        departure_time: "08:25",
        delay: "On Time"
      },
      {
        stn_code: "GWL",
        stn_name: "Gwalior Junction",
        arrival_time: "09:43",
        departure_time: "09:45",
        delay: "On Time"
      }
    ]
  },

  "22470": {
    train_num: "22470",
    train_name: "Vande Bharat Express",
    from_stn: {
      stn_code: "NDLS",
      stn_name: "New Delhi",
      departure_time: "06:00"
    },
    to_stn: {
      stn_code: "SRE",
      stn_name: "Saharanpur",
      arrival_time: "09:25"
    },
    running_on: "Daily except Monday",
    chart_prepared: true,
    current_location: {
      stn_code: "MTC",
      stn_name: "Meerut City",
      delay: "On Time",
      updated_at: new Date().toISOString()
    },
    stations: [
      {
        stn_code: "NDLS",
        stn_name: "New Delhi",
        departure_time: "06:00",
        delay: "On Time"
      },
      {
        stn_code: "GZB",
        stn_name: "Ghaziabad",
        arrival_time: "06:35",
        departure_time: "06:37",
        delay: "On Time"
      },
      {
        stn_code: "MTC",
        stn_name: "Meerut City",
        arrival_time: "07:40",
        departure_time: "07:42",
        delay: "On Time"
      }
    ]
  }
};

// Function to get randomized delays and update timestamps
export function getLiveTrainData(trainNumber: string) {
  const train = mockTrainData[trainNumber as keyof typeof mockTrainData];
  if (!train) return null;

  // Simulate realistic delays
  const possibleDelays = ["On Time", "5 min", "10 min", "15 min", "20 min"];
  const randomDelay = possibleDelays[Math.floor(Math.random() * possibleDelays.length)];

  return {
    ...train,
    current_location: {
      ...train.current_location,
      delay: randomDelay,
      updated_at: new Date().toISOString()
    }
  };
}