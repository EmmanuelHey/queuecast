export type LineType = "Entry" | "Merch" | "Parking" | "Food" | "Bathrooms";

export type CrowdLevel = "Light" | "Steady" | "Packed";

export type ReporterStatus = "in_line" | "on_the_way" | "inside" | "just_checking";

export type VerificationStatus = "verified_near_venue" | "unverified" | "on_the_way" | "inside_venue";

export type ConfidenceLevel = "Low" | "Medium" | "High";

export type ReporterLevel = "Guest Reporter" | "Bronze Reporter" | "Silver Reporter" | "Gold Reporter" | "Venue Expert";

export type EventStatus = "Tonight" | "Upcoming" | "Doors soon" | "Live now" | "Ended";

export type ArrivalOffset = 0 | 15 | 30 | 45 | 60;

export type BottleneckSeverity = "low" | "medium" | "high";

export type PredictionTrend = "rise" | "drop" | "steady";

export type PredictionResult = {
  lineId: string;
  currentWaitMinutes: number;
  predictedWaitMinutes: number;
  trend: PredictionTrend;
  trendLabel: string;
  arrivalOffset: ArrivalOffset;
};

export type HistoricalEvent = {
  id: string;
  artist: string;
  venue: string;
  date: string;
  attendanceEstimate: number;
  monthlyListenersEstimate: number;
  entryWaitPeak: number;
  merchWaitPeak: number;
  parkingWaitPeak: number;
  averageEntryWait: number;
  averageMerchWait: number;
  averageParkingWait: number;
  artistCategory: string;
};

export type HistoricalWaitAverages = {
  averageEntryWait: number;
  averageMerchWait: number;
  averageParkingWait: number;
  peakEntryWait: number;
  peakMerchWait: number;
  peakParkingWait: number;
  eventCount: number;
};

export type HistoricalTrend = "higher" | "average" | "lighter";

export type HistoricalInsight = {
  artist: string;
  venue: string;
  averageEntryWait: number;
  peakEntryWait: number;
  eventCount: number;
  similarArtistCount: number;
  trend: HistoricalTrend;
  trendLabel: string;
  statement: string;
  chartEvents: HistoricalEvent[];
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  capacity: number;
  address: string;
  defaultLineTypes: LineType[];
  entryPointsCount: number;
  bottleneckSeverity: BottleneckSeverity;
  typicalBottleneckNotes: string[];
};

export type LineReport = {
  id: string;
  lineId: string;
  waitMinutes: number;
  crowdLevel: CrowdLevel;
  reporterStatus: ReporterStatus;
  isNearVenue: boolean;
  submittedAt: number;
  submittedLabel: string;
  trustScore: number;
  verificationStatus: VerificationStatus;
};

export type LineEstimate = {
  id: string;
  eventId: string;
  type: LineType;
  waitMinutes: number;
  confidence: ConfidenceLevel;
  totalTrustScore: number;
  reportCount: number;
  verifiedReportCount: number;
  lastUpdated: string;
  crowdLevel: CrowdLevel;
  reports: LineReport[];
};

export type Concert = {
  id: string;
  venueId: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  doorsTime: string;
  showTime: string;
  doorsMinutes: number;
  showMinutes: number;
  endMinutes: number;
  dayOffset: number;
  status: EventStatus;
  accent: string;
  lines: LineEstimate[];
};

export type LineReportInput = {
  lineId: string;
  waitMinutes: number;
  crowdLevel: CrowdLevel;
  reporterStatus: ReporterStatus;
  isNearVenue: boolean;
};
