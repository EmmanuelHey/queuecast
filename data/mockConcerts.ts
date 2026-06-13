import {
  ConfidenceLevel,
  Concert,
  CrowdLevel,
  EventStatus,
  LineEstimate,
  LineReport,
  LineType,
  ReporterStatus,
  Venue,
  VerificationStatus,
} from "../types/queue";

type SeedReport = {
  waitMinutes: number;
  crowdLevel: CrowdLevel;
  reporterStatus: ReporterStatus;
  isNearVenue: boolean;
  submittedMinutesAgo: number;
};

type LineSeed = {
  id: string;
  eventId: string;
  type: LineType;
  reports: SeedReport[];
};

type EventSeed = {
  id: string;
  venueId: string;
  artist: string;
  date: string;
  dayOffset: number;
  doorsTime: string;
  showTime: string;
  doorsMinutes: number;
  showMinutes: number;
  endMinutes: number;
  accent: string;
  lineWaits: Record<LineType, number[]>;
};

const MOCK_NOW_MINUTES = 19 * 60 + 10;

export const mockVenues: Venue[] = [
  {
    id: "american-airlines-center",
    name: "American Airlines Center",
    city: "Dallas",
    capacity: 20000,
    address: "2500 Victory Ave, Dallas, TX 75219",
    defaultLineTypes: ["Entry", "Merch", "Parking", "Food", "Bathrooms"],
    entryPointsCount: 6,
    bottleneckSeverity: "high",
    typicalBottleneckNotes: [
      "Victory Plaza entry stacks up closest to showtime.",
      "Parking queues build around the garage exits after 6 PM.",
      "Merch waits spike on the main concourse before the opener.",
    ],
  },
  {
    id: "dos-equis-pavilion",
    name: "Dos Equis Pavilion",
    city: "Dallas",
    capacity: 20000,
    address: "3839 S Fitzhugh Ave, Dallas, TX 75210",
    defaultLineTypes: ["Entry", "Merch", "Parking", "Food", "Bathrooms"],
    entryPointsCount: 4,
    bottleneckSeverity: "high",
    typicalBottleneckNotes: [
      "Fair Park parking can create long walk-in waves.",
      "Entry lines move fastest right after doors open.",
      "Food and drink stands bunch up between openers.",
    ],
  },
  {
    id: "toyota-music-factory",
    name: "Toyota Music Factory",
    city: "Irving",
    capacity: 8000,
    address: "316 W Las Colinas Blvd, Irving, TX 75039",
    defaultLineTypes: ["Entry", "Merch", "Parking", "Food", "Bathrooms"],
    entryPointsCount: 3,
    bottleneckSeverity: "medium",
    typicalBottleneckNotes: [
      "Garage traffic is the biggest pressure point.",
      "Restaurant foot traffic can slow the plaza entrance.",
      "Merch lines are usually compact but dense.",
    ],
  },
  {
    id: "house-of-blues-dallas",
    name: "House of Blues Dallas",
    city: "Dallas",
    capacity: 1625,
    address: "2200 N Lamar St, Dallas, TX 75202",
    defaultLineTypes: ["Entry", "Merch", "Parking", "Food", "Bathrooms"],
    entryPointsCount: 2,
    bottleneckSeverity: "medium",
    typicalBottleneckNotes: [
      "The main entrance line wraps quickly on sold-out club nights.",
      "Restaurant and music-hall traffic overlap near doors.",
      "Bathroom waits spike immediately after the headliner starts.",
    ],
  },
  {
    id: "the-factory-deep-ellum",
    name: "The Factory in Deep Ellum",
    city: "Deep Ellum",
    capacity: 4300,
    address: "2713 Canton St, Dallas, TX 75226",
    defaultLineTypes: ["Entry", "Merch", "Parking", "Food", "Bathrooms"],
    entryPointsCount: 3,
    bottleneckSeverity: "high",
    typicalBottleneckNotes: [
      "Deep Ellum street parking creates uneven arrival bursts.",
      "Entry gets tight when nearby venues let out.",
      "Merch lines tend to stay active after the main set.",
    ],
  },
];

const venueById = Object.fromEntries(mockVenues.map((venue) => [venue.id, venue]));

export function getEventStatus(seed: Pick<EventSeed, "dayOffset" | "doorsMinutes" | "showMinutes" | "endMinutes">): EventStatus {
  if (seed.dayOffset < 0 || (seed.dayOffset === 0 && MOCK_NOW_MINUTES > seed.endMinutes)) {
    return "Ended";
  }

  if (seed.dayOffset > 0) {
    return "Upcoming";
  }

  if (MOCK_NOW_MINUTES >= seed.showMinutes && MOCK_NOW_MINUTES <= seed.endMinutes) {
    return "Live now";
  }

  if (MOCK_NOW_MINUTES >= seed.doorsMinutes - 60 && MOCK_NOW_MINUTES < seed.showMinutes) {
    return "Doors soon";
  }

  return "Tonight";
}

export function getVerificationStatus(reporterStatus: ReporterStatus, isNearVenue: boolean): VerificationStatus {
  if (reporterStatus === "on_the_way") {
    return "on_the_way";
  }

  if (reporterStatus === "inside") {
    return "inside_venue";
  }

  if (isNearVenue) {
    return "verified_near_venue";
  }

  return "unverified";
}

export function getTrustScore(reporterStatus: ReporterStatus, isNearVenue: boolean, submittedAt: number, now = Date.now()) {
  const statusScore = reporterStatus === "in_line" ? 3 : reporterStatus === "on_the_way" || reporterStatus === "inside" ? 1 : 0;
  const locationScore = isNearVenue ? 3 : 0;
  const recentScore = now - submittedAt <= 10 * 60 * 1000 ? 2 : 0;

  return statusScore + locationScore + recentScore;
}

export function getConfidenceLevel(totalTrustScore: number): ConfidenceLevel {
  if (totalTrustScore >= 9) {
    return "High";
  }

  if (totalTrustScore >= 4) {
    return "Medium";
  }

  return "Low";
}

export function getVerificationLabel(status: VerificationStatus) {
  const labels: Record<VerificationStatus, string> = {
    verified_near_venue: "Verified near venue",
    unverified: "Unverified",
    on_the_way: "On the way",
    inside_venue: "Inside venue",
  };

  return labels[status];
}

export function getReporterStatusLabel(status: ReporterStatus) {
  const labels: Record<ReporterStatus, string> = {
    in_line: "In line",
    on_the_way: "On the way",
    inside: "Already inside",
    just_checking: "Just checking",
  };

  return labels[status];
}

const submittedLabel = (minutesAgo: number) => (minutesAgo <= 0 ? "just now" : `${minutesAgo} min ago`);

export function createReport(lineId: string, seed: SeedReport, index: number, now = Date.now()): LineReport {
  const submittedAt = now - seed.submittedMinutesAgo * 60 * 1000;

  return {
    id: `${lineId}-report-${index + 1}`,
    lineId,
    waitMinutes: seed.waitMinutes,
    crowdLevel: seed.crowdLevel,
    reporterStatus: seed.reporterStatus,
    isNearVenue: seed.isNearVenue,
    submittedAt,
    submittedLabel: submittedLabel(seed.submittedMinutesAgo),
    trustScore: getTrustScore(seed.reporterStatus, seed.isNearVenue, submittedAt, now),
    verificationStatus: getVerificationStatus(seed.reporterStatus, seed.isNearVenue),
  };
}

export function createLineEstimate(seed: LineSeed, now = Date.now()): LineEstimate {
  const reports = seed.reports.map((report, index) => createReport(seed.id, report, index, now));
  return recalculateLineEstimate({
    id: seed.id,
    eventId: seed.eventId,
    type: seed.type,
    waitMinutes: 0,
    confidence: "Low",
    totalTrustScore: 0,
    reportCount: 0,
    verifiedReportCount: 0,
    lastUpdated: "No reports",
    crowdLevel: "Light",
    reports,
  });
}

export function recalculateLineEstimate(lineEstimate: LineEstimate): LineEstimate {
  const { reports } = lineEstimate;

  if (!reports.length) {
    return {
      ...lineEstimate,
      waitMinutes: 0,
      confidence: "Low",
      totalTrustScore: 0,
      reportCount: 0,
      verifiedReportCount: 0,
      lastUpdated: "No reports",
    };
  }

  const totalTrustScore = reports.reduce((sum, report) => sum + report.trustScore, 0);
  const weightForReport = (report: LineReport) => (totalTrustScore > 0 ? report.trustScore : 1);
  const weightedWaitTotal = reports.reduce((sum, report) => sum + report.waitMinutes * weightForReport(report), 0);
  const weightedTrustTotal = reports.reduce((sum, report) => sum + weightForReport(report), 0);
  const latestReport = reports.reduce((latest, report) => (report.submittedAt > latest.submittedAt ? report : latest), reports[0]);
  const crowdTotals = reports.reduce<Record<CrowdLevel, number>>(
    (totals, report) => ({
      ...totals,
      [report.crowdLevel]: totals[report.crowdLevel] + weightForReport(report),
    }),
    { Light: 0, Steady: 0, Packed: 0 },
  );
  const crowdLevel = (Object.keys(crowdTotals) as CrowdLevel[]).reduce((best, level) =>
    crowdTotals[level] > crowdTotals[best] ? level : best,
  );

  return {
    ...lineEstimate,
    waitMinutes: Math.round(weightedWaitTotal / weightedTrustTotal),
    confidence: getConfidenceLevel(totalTrustScore),
    totalTrustScore,
    reportCount: reports.length,
    verifiedReportCount: reports.filter((report) => report.verificationStatus === "verified_near_venue").length,
    lastUpdated: latestReport.submittedLabel,
    crowdLevel,
    reports,
  };
}

const reportSet = (baseWait: number): Record<LineType, SeedReport[]> => ({
  Entry: [
    { waitMinutes: baseWait, crowdLevel: baseWait >= 25 ? "Packed" : "Steady", reporterStatus: "in_line", isNearVenue: true, submittedMinutesAgo: 4 },
    { waitMinutes: Math.max(4, baseWait - 4), crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 9 },
  ],
  Merch: [
    { waitMinutes: Math.max(6, baseWait - 2), crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 11 },
    { waitMinutes: baseWait + 3, crowdLevel: "Packed", reporterStatus: "just_checking", isNearVenue: false, submittedMinutesAgo: 18 },
  ],
  Parking: [
    { waitMinutes: baseWait + 8, crowdLevel: "Packed", reporterStatus: "on_the_way", isNearVenue: true, submittedMinutesAgo: 7 },
    { waitMinutes: baseWait + 2, crowdLevel: "Steady", reporterStatus: "just_checking", isNearVenue: false, submittedMinutesAgo: 21 },
  ],
  Food: [
    { waitMinutes: Math.max(5, baseWait - 10), crowdLevel: "Light", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 6 },
  ],
  Bathrooms: [
    { waitMinutes: Math.max(4, baseWait - 13), crowdLevel: "Light", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 5 },
  ],
});

const createLines = (eventId: string, waits: Record<LineType, number[]>): LineEstimate[] =>
  (Object.keys(waits) as LineType[]).map((type) =>
    createLineEstimate({
      id: `${eventId}-${type.toLowerCase()}`,
      eventId,
      type,
      reports: waits[type].map((waitMinutes, index) => ({
        waitMinutes,
        crowdLevel: waitMinutes >= 25 ? "Packed" : waitMinutes >= 12 ? "Steady" : "Light",
        reporterStatus: index === 0 ? "in_line" : index === 1 ? "inside" : "just_checking",
        isNearVenue: index !== 2,
        submittedMinutesAgo: [3, 8, 16][index] ?? 20,
      })),
    }),
  );

const createEvent = (seed: EventSeed): Concert => {
  const venue = venueById[seed.venueId];

  return {
    id: seed.id,
    venueId: seed.venueId,
    artist: seed.artist,
    venue: venue.name,
    city: venue.city,
    date: seed.date,
    doorsTime: seed.doorsTime,
    showTime: seed.showTime,
    doorsMinutes: seed.doorsMinutes,
    showMinutes: seed.showMinutes,
    endMinutes: seed.endMinutes,
    dayOffset: seed.dayOffset,
    status: getEventStatus(seed),
    accent: seed.accent,
    lines: createLines(seed.id, seed.lineWaits),
  };
};

const waits = (baseWait: number) => {
  const reports = reportSet(baseWait);
  return {
    Entry: reports.Entry.map((report) => report.waitMinutes),
    Merch: reports.Merch.map((report) => report.waitMinutes),
    Parking: reports.Parking.map((report) => report.waitMinutes),
    Food: reports.Food.map((report) => report.waitMinutes),
    Bathrooms: reports.Bathrooms.map((report) => report.waitMinutes),
  };
};

export const mockConcerts: Concert[] = [
  createEvent({
    id: "aac-skyline-mode",
    venueId: "american-airlines-center",
    artist: "Skyline Mode",
    date: "Tonight",
    dayOffset: 0,
    doorsTime: "6:30 PM",
    showTime: "8:00 PM",
    doorsMinutes: 18 * 60 + 30,
    showMinutes: 20 * 60,
    endMinutes: 23 * 60,
    accent: "#8B5CF6",
    lineWaits: waits(22),
  }),
  createEvent({
    id: "dos-equis-neon-country",
    venueId: "dos-equis-pavilion",
    artist: "Neon Country Revival",
    date: "Tonight",
    dayOffset: 0,
    doorsTime: "5:30 PM",
    showTime: "7:00 PM",
    doorsMinutes: 17 * 60 + 30,
    showMinutes: 19 * 60,
    endMinutes: 22 * 60 + 30,
    accent: "#22C55E",
    lineWaits: waits(31),
  }),
  createEvent({
    id: "hob-luna-circuit",
    venueId: "house-of-blues-dallas",
    artist: "Luna Circuit",
    date: "Tonight",
    dayOffset: 0,
    doorsTime: "8:00 PM",
    showTime: "9:00 PM",
    doorsMinutes: 20 * 60,
    showMinutes: 21 * 60,
    endMinutes: 23 * 60 + 30,
    accent: "#F472B6",
    lineWaits: waits(9),
  }),
  createEvent({
    id: "factory-velvet-static",
    venueId: "the-factory-deep-ellum",
    artist: "Velvet Static",
    date: "Tonight",
    dayOffset: 0,
    doorsTime: "6:00 PM",
    showTime: "7:15 PM",
    doorsMinutes: 18 * 60,
    showMinutes: 19 * 60 + 15,
    endMinutes: 22 * 60 + 15,
    accent: "#06B6D4",
    lineWaits: waits(18),
  }),
  createEvent({
    id: "tmf-atlas-wave",
    venueId: "toyota-music-factory",
    artist: "Atlas Wave",
    date: "Fri, Jun 27",
    dayOffset: 1,
    doorsTime: "6:00 PM",
    showTime: "7:30 PM",
    doorsMinutes: 18 * 60,
    showMinutes: 19 * 60 + 30,
    endMinutes: 22 * 60 + 30,
    accent: "#FBBF24",
    lineWaits: waits(16),
  }),
  createEvent({
    id: "aac-solara-voss",
    venueId: "american-airlines-center",
    artist: "Solara Voss",
    date: "Sat, Jun 28",
    dayOffset: 2,
    doorsTime: "6:00 PM",
    showTime: "7:45 PM",
    doorsMinutes: 18 * 60,
    showMinutes: 19 * 60 + 45,
    endMinutes: 22 * 60 + 45,
    accent: "#A78BFA",
    lineWaits: waits(24),
  }),
  createEvent({
    id: "deep-ellum-midnight-tapes",
    venueId: "the-factory-deep-ellum",
    artist: "Midnight Tapes",
    date: "Sun, Jun 29",
    dayOffset: 3,
    doorsTime: "7:00 PM",
    showTime: "8:30 PM",
    doorsMinutes: 19 * 60,
    showMinutes: 20 * 60 + 30,
    endMinutes: 23 * 60,
    accent: "#FB7185",
    lineWaits: waits(13),
  }),
  createEvent({
    id: "hob-oak-cliff-soul",
    venueId: "house-of-blues-dallas",
    artist: "Oak Cliff Soul Club",
    date: "Yesterday",
    dayOffset: -1,
    doorsTime: "6:30 PM",
    showTime: "8:00 PM",
    doorsMinutes: 18 * 60 + 30,
    showMinutes: 20 * 60,
    endMinutes: 22 * 60 + 30,
    accent: "#34D399",
    lineWaits: waits(7),
  }),
];
