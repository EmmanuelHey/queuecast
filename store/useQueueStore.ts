import { create } from "zustand";
import { getTrustScore, getVerificationStatus, mockConcerts, mockVenues, recalculateLineEstimate } from "../data/mockConcerts";
import { Concert, LineEstimate, LineReport, LineReportInput, Venue } from "../types/queue";

type QueueState = {
  concerts: Concert[];
  venues: Venue[];
  reportsSubmitted: number;
  verifiedReportsSubmitted: number;
  isNearVenue: boolean;
  submitReport: (report: LineReportInput) => void;
  getConcertById: (id: string) => Concert | undefined;
  getLineById: (lineId: string) => LineEstimate | undefined;
  getVenueById: (id: string) => Venue | undefined;
};

const nowLabel = () => "just now";
const createSubmittedReport = (report: LineReportInput, index: number): LineReport => {
  const submittedAt = Date.now();
  const verificationStatus = getVerificationStatus(report.reporterStatus, report.isNearVenue);

  return {
    id: `${report.lineId}-local-report-${index + 1}`,
    lineId: report.lineId,
    waitMinutes: report.waitMinutes,
    crowdLevel: report.crowdLevel,
    reporterStatus: report.reporterStatus,
    isNearVenue: report.isNearVenue,
    isRealLocationVerified: report.isRealLocationVerified,
    submittedAt,
    submittedLabel: nowLabel(),
    trustScore: getTrustScore(report.reporterStatus, report.isNearVenue, submittedAt, Date.now(), report.isRealLocationVerified),
    verificationStatus,
  };
};

export const useQueueStore = create<QueueState>((set, get) => ({
  concerts: mockConcerts,
  venues: mockVenues,
  reportsSubmitted: 0,
  verifiedReportsSubmitted: 0,
  isNearVenue: true,
  submitReport: (reportInput) => {
    set((state) => ({
      reportsSubmitted: state.reportsSubmitted + 1,
      verifiedReportsSubmitted:
        reportInput.isNearVenue && reportInput.reporterStatus !== "on_the_way" && reportInput.reporterStatus !== "inside"
          ? state.verifiedReportsSubmitted + 1
          : state.verifiedReportsSubmitted,
      concerts: state.concerts.map((concert) => ({
        ...concert,
        lines: concert.lines.map((line) => {
          if (line.id !== reportInput.lineId) {
            return line;
          }

          const nextReport = createSubmittedReport(reportInput, line.reports.length);

          return recalculateLineEstimate({
            ...line,
            reports: [nextReport, ...line.reports],
          });
        }),
      })),
    }));
  },
  getConcertById: (id) => get().concerts.find((concert) => concert.id === id),
  getLineById: (lineId) =>
    get()
      .concerts.flatMap((concert) => concert.lines)
      .find((line) => line.id === lineId),
  getVenueById: (id) => get().venues.find((venue) => venue.id === id),
}));
