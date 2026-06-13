import { create } from "zustand";
import { getTrustScore, getVerificationStatus, mockConcerts, recalculateLineEstimate } from "../data/mockConcerts";
import { Concert, LineEstimate, LineReport, LineReportInput } from "../types/queue";

type QueueState = {
  concerts: Concert[];
  reportsSubmitted: number;
  verifiedReportsSubmitted: number;
  isNearVenue: boolean;
  submitReport: (report: LineReportInput) => void;
  getConcertById: (id: string) => Concert | undefined;
  getLineById: (lineId: string) => LineEstimate | undefined;
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
    submittedAt,
    submittedLabel: nowLabel(),
    trustScore: getTrustScore(report.reporterStatus, report.isNearVenue, submittedAt),
    verificationStatus,
  };
};

export const useQueueStore = create<QueueState>((set, get) => ({
  concerts: mockConcerts,
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
}));
