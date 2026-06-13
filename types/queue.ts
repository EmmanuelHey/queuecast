export type LineType = "Entry" | "Merch" | "Parking" | "Food" | "Bathroom";

export type CrowdLevel = "Light" | "Steady" | "Packed";

export type LineEstimate = {
  id: string;
  eventId: string;
  type: LineType;
  waitMinutes: number;
  confidence: number;
  lastUpdated: string;
  crowdLevel: CrowdLevel;
};

export type Concert = {
  id: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  doorsTime: string;
  accent: string;
  lines: LineEstimate[];
};

export type LineReport = {
  lineId: string;
  waitMinutes: number;
  crowdLevel: CrowdLevel;
  inLine: boolean;
};
