export type LineType = "Entry" | "Merch" | "Parking" | "Food" | "Bathrooms";

export type CrowdLevel = "Light" | "Steady" | "Packed";

export type ReporterStatus = "in_line" | "on_the_way" | "inside" | "just_checking";

export type VerificationStatus = "verified_near_venue" | "unverified" | "on_the_way" | "inside_venue";

export type ConfidenceLevel = "Low" | "Medium" | "High";

export type ReporterLevel = "Guest Reporter" | "Bronze Reporter" | "Silver Reporter" | "Gold Reporter" | "Venue Expert";

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
  artist: string;
  venue: string;
  city: string;
  date: string;
  doorsTime: string;
  showTime: string;
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
