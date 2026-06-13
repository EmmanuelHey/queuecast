import { create } from "zustand";
import { mockConcerts } from "../data/mockConcerts";
import { Concert, LineEstimate, LineReport } from "../types/queue";

type QueueState = {
  concerts: Concert[];
  reportsSubmitted: number;
  submitReport: (report: LineReport) => void;
  getConcertById: (id: string) => Concert | undefined;
  getLineById: (lineId: string) => LineEstimate | undefined;
};

const nowLabel = () => "just now";

export const useQueueStore = create<QueueState>((set, get) => ({
  concerts: mockConcerts,
  reportsSubmitted: 0,
  submitReport: ({ lineId, waitMinutes, crowdLevel, inLine }) => {
    set((state) => ({
      reportsSubmitted: state.reportsSubmitted + 1,
      concerts: state.concerts.map((concert) => ({
        ...concert,
        lines: concert.lines.map((line) => {
          if (line.id !== lineId) {
            return line;
          }

          return {
            ...line,
            waitMinutes,
            crowdLevel,
            confidence: Math.min(96, line.confidence + (inLine ? 7 : 4)),
            lastUpdated: nowLabel(),
          };
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
