import {
  ConfidenceLevel,
  Concert,
  CrowdLevel,
  LineEstimate,
  LineReport,
  LineType,
  ReporterStatus,
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

const line = (id: string, eventId: string, type: LineType, reports: SeedReport[]): LineEstimate =>
  createLineEstimate({ id, eventId, type, reports });

export const mockConcerts: Concert[] = [
  {
    id: "solara",
    artist: "Solara Voss",
    venue: "The Anthem",
    city: "Washington, DC",
    date: "Sat, Jun 20",
    doorsTime: "6:30 PM",
    showTime: "8:00 PM",
    accent: "#8B5CF6",
    lines: [
      line("solara-entry", "solara", "Entry", [
        { waitMinutes: 18, crowdLevel: "Steady", reporterStatus: "in_line", isNearVenue: true, submittedMinutesAgo: 4 },
        { waitMinutes: 22, crowdLevel: "Packed", reporterStatus: "on_the_way", isNearVenue: false, submittedMinutesAgo: 12 },
        { waitMinutes: 15, crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 8 },
      ]),
      line("solara-merch", "solara", "Merch", [
        { waitMinutes: 24, crowdLevel: "Packed", reporterStatus: "in_line", isNearVenue: true, submittedMinutesAgo: 8 },
        { waitMinutes: 18, crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 16 },
      ]),
      line("solara-parking", "solara", "Parking", [
        { waitMinutes: 14, crowdLevel: "Steady", reporterStatus: "on_the_way", isNearVenue: true, submittedMinutesAgo: 11 },
        { waitMinutes: 20, crowdLevel: "Packed", reporterStatus: "just_checking", isNearVenue: false, submittedMinutesAgo: 19 },
      ]),
      line("solara-food", "solara", "Food", [
        { waitMinutes: 9, crowdLevel: "Light", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 6 },
        { waitMinutes: 11, crowdLevel: "Steady", reporterStatus: "just_checking", isNearVenue: true, submittedMinutesAgo: 14 },
      ]),
      line("solara-bathrooms", "solara", "Bathrooms", [
        { waitMinutes: 6, crowdLevel: "Light", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 3 },
        { waitMinutes: 8, crowdLevel: "Light", reporterStatus: "just_checking", isNearVenue: false, submittedMinutesAgo: 17 },
      ]),
    ],
  },
  {
    id: "neon-pines",
    artist: "Neon Pines",
    venue: "Red Rocks Amphitheatre",
    city: "Morrison, CO",
    date: "Fri, Jun 26",
    doorsTime: "5:45 PM",
    showTime: "7:15 PM",
    accent: "#06B6D4",
    lines: [
      line("neon-entry", "neon-pines", "Entry", [
        { waitMinutes: 32, crowdLevel: "Packed", reporterStatus: "in_line", isNearVenue: true, submittedMinutesAgo: 2 },
        { waitMinutes: 38, crowdLevel: "Packed", reporterStatus: "on_the_way", isNearVenue: true, submittedMinutesAgo: 7 },
      ]),
      line("neon-merch", "neon-pines", "Merch", [
        { waitMinutes: 17, crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 10 },
        { waitMinutes: 21, crowdLevel: "Packed", reporterStatus: "just_checking", isNearVenue: false, submittedMinutesAgo: 23 },
      ]),
      line("neon-parking", "neon-pines", "Parking", [
        { waitMinutes: 41, crowdLevel: "Packed", reporterStatus: "on_the_way", isNearVenue: true, submittedMinutesAgo: 5 },
        { waitMinutes: 35, crowdLevel: "Packed", reporterStatus: "in_line", isNearVenue: false, submittedMinutesAgo: 18 },
      ]),
      line("neon-food", "neon-pines", "Food", [
        { waitMinutes: 12, crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 12 },
      ]),
      line("neon-bathrooms", "neon-pines", "Bathrooms", [
        { waitMinutes: 7, crowdLevel: "Light", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 7 },
      ]),
    ],
  },
  {
    id: "velvet-static",
    artist: "Velvet Static",
    venue: "Brooklyn Steel",
    city: "Brooklyn, NY",
    date: "Sun, Jun 28",
    doorsTime: "7:00 PM",
    showTime: "8:30 PM",
    accent: "#F472B6",
    lines: [
      line("velvet-entry", "velvet-static", "Entry", [
        { waitMinutes: 11, crowdLevel: "Light", reporterStatus: "in_line", isNearVenue: true, submittedMinutesAgo: 5 },
        { waitMinutes: 13, crowdLevel: "Steady", reporterStatus: "just_checking", isNearVenue: false, submittedMinutesAgo: 15 },
      ]),
      line("velvet-merch", "velvet-static", "Merch", [
        { waitMinutes: 19, crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 13 },
      ]),
      line("velvet-parking", "velvet-static", "Parking", [
        { waitMinutes: 8, crowdLevel: "Light", reporterStatus: "on_the_way", isNearVenue: false, submittedMinutesAgo: 15 },
      ]),
      line("velvet-food", "velvet-static", "Food", [
        { waitMinutes: 15, crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 9 },
      ]),
      line("velvet-bathrooms", "velvet-static", "Bathrooms", [
        { waitMinutes: 10, crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 4 },
      ]),
    ],
  },
  {
    id: "atlas-wave",
    artist: "Atlas Wave",
    venue: "Moody Center",
    city: "Austin, TX",
    date: "Thu, Jul 2",
    doorsTime: "6:00 PM",
    showTime: "7:30 PM",
    accent: "#34D399",
    lines: [
      line("atlas-entry", "atlas-wave", "Entry", [
        { waitMinutes: 25, crowdLevel: "Packed", reporterStatus: "in_line", isNearVenue: true, submittedMinutesAgo: 3 },
        { waitMinutes: 29, crowdLevel: "Packed", reporterStatus: "on_the_way", isNearVenue: true, submittedMinutesAgo: 6 },
      ]),
      line("atlas-merch", "atlas-wave", "Merch", [
        { waitMinutes: 12, crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 16 },
      ]),
      line("atlas-parking", "atlas-wave", "Parking", [
        { waitMinutes: 29, crowdLevel: "Packed", reporterStatus: "on_the_way", isNearVenue: true, submittedMinutesAgo: 6 },
      ]),
      line("atlas-food", "atlas-wave", "Food", [
        { waitMinutes: 7, crowdLevel: "Light", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 8 },
      ]),
      line("atlas-bathrooms", "atlas-wave", "Bathrooms", [
        { waitMinutes: 5, crowdLevel: "Light", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 6 },
      ]),
    ],
  },
  {
    id: "luna-circuit",
    artist: "Luna Circuit",
    venue: "Hollywood Bowl",
    city: "Los Angeles, CA",
    date: "Sat, Jul 11",
    doorsTime: "5:30 PM",
    showTime: "7:00 PM",
    accent: "#FBBF24",
    lines: [
      line("luna-entry", "luna-circuit", "Entry", [
        { waitMinutes: 22, crowdLevel: "Steady", reporterStatus: "in_line", isNearVenue: true, submittedMinutesAgo: 1 },
        { waitMinutes: 26, crowdLevel: "Packed", reporterStatus: "just_checking", isNearVenue: false, submittedMinutesAgo: 18 },
      ]),
      line("luna-merch", "luna-circuit", "Merch", [
        { waitMinutes: 28, crowdLevel: "Packed", reporterStatus: "in_line", isNearVenue: true, submittedMinutesAgo: 9 },
      ]),
      line("luna-parking", "luna-circuit", "Parking", [
        { waitMinutes: 36, crowdLevel: "Packed", reporterStatus: "on_the_way", isNearVenue: true, submittedMinutesAgo: 4 },
      ]),
      line("luna-food", "luna-circuit", "Food", [
        { waitMinutes: 13, crowdLevel: "Steady", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 7 },
      ]),
      line("luna-bathrooms", "luna-circuit", "Bathrooms", [
        { waitMinutes: 9, crowdLevel: "Light", reporterStatus: "inside", isNearVenue: true, submittedMinutesAgo: 10 },
      ]),
    ],
  },
];
