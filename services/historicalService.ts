import { Concert, HistoricalEvent, HistoricalInsight, HistoricalTrend, HistoricalWaitAverages } from "../types/queue";

const artistCategories: Record<string, string[]> = {
  "stadium-rap": ["Drake", "Travis Scott", "Future", "Skyline Mode", "Neon Country Revival"],
  "alt-hip-hop": ["Tyler, The Creator", "Kendrick Lamar", "Solara Voss", "Luna Circuit"],
  country: ["Morgan Wallen", "Luke Combs", "Oak Cliff Soul Club"],
  "indie-electronic": ["Velvet Static", "Atlas Wave", "Midnight Tapes"],
};

export const historicalEvents: HistoricalEvent[] = [
  {
    id: "hist-travis-aac-2025",
    artist: "Travis Scott",
    venue: "American Airlines Center",
    date: "Oct 18, 2025",
    attendanceEstimate: 19800,
    monthlyListenersEstimate: 69000000,
    entryWaitPeak: 55,
    merchWaitPeak: 48,
    parkingWaitPeak: 44,
    averageEntryWait: 31,
    averageMerchWait: 28,
    averageParkingWait: 25,
    artistCategory: "stadium-rap",
  },
  {
    id: "hist-drake-aac-2025",
    artist: "Drake",
    venue: "American Airlines Center",
    date: "Sep 7, 2025",
    attendanceEstimate: 20100,
    monthlyListenersEstimate: 82000000,
    entryWaitPeak: 58,
    merchWaitPeak: 42,
    parkingWaitPeak: 47,
    averageEntryWait: 34,
    averageMerchWait: 24,
    averageParkingWait: 29,
    artistCategory: "stadium-rap",
  },
  {
    id: "hist-future-aac-2024",
    artist: "Future",
    venue: "American Airlines Center",
    date: "Aug 12, 2024",
    attendanceEstimate: 18500,
    monthlyListenersEstimate: 58000000,
    entryWaitPeak: 49,
    merchWaitPeak: 37,
    parkingWaitPeak: 41,
    averageEntryWait: 29,
    averageMerchWait: 22,
    averageParkingWait: 27,
    artistCategory: "stadium-rap",
  },
  {
    id: "hist-skyline-aac-2025",
    artist: "Skyline Mode",
    venue: "American Airlines Center",
    date: "May 2, 2025",
    attendanceEstimate: 16200,
    monthlyListenersEstimate: 9300000,
    entryWaitPeak: 43,
    merchWaitPeak: 31,
    parkingWaitPeak: 35,
    averageEntryWait: 24,
    averageMerchWait: 19,
    averageParkingWait: 22,
    artistCategory: "stadium-rap",
  },
  {
    id: "hist-neon-dos-2025",
    artist: "Neon Country Revival",
    venue: "Dos Equis Pavilion",
    date: "Jun 4, 2025",
    attendanceEstimate: 17400,
    monthlyListenersEstimate: 11500000,
    entryWaitPeak: 52,
    merchWaitPeak: 35,
    parkingWaitPeak: 50,
    averageEntryWait: 30,
    averageMerchWait: 21,
    averageParkingWait: 33,
    artistCategory: "stadium-rap",
  },
  {
    id: "hist-tyler-aac-2025",
    artist: "Tyler, The Creator",
    venue: "American Airlines Center",
    date: "Mar 22, 2025",
    attendanceEstimate: 19000,
    monthlyListenersEstimate: 33000000,
    entryWaitPeak: 46,
    merchWaitPeak: 54,
    parkingWaitPeak: 38,
    averageEntryWait: 26,
    averageMerchWait: 32,
    averageParkingWait: 22,
    artistCategory: "alt-hip-hop",
  },
  {
    id: "hist-kendrick-aac-2024",
    artist: "Kendrick Lamar",
    venue: "American Airlines Center",
    date: "Nov 9, 2024",
    attendanceEstimate: 19900,
    monthlyListenersEstimate: 65000000,
    entryWaitPeak: 51,
    merchWaitPeak: 39,
    parkingWaitPeak: 42,
    averageEntryWait: 30,
    averageMerchWait: 23,
    averageParkingWait: 25,
    artistCategory: "alt-hip-hop",
  },
  {
    id: "hist-solara-aac-2025",
    artist: "Solara Voss",
    venue: "American Airlines Center",
    date: "Apr 14, 2025",
    attendanceEstimate: 15100,
    monthlyListenersEstimate: 8400000,
    entryWaitPeak: 39,
    merchWaitPeak: 34,
    parkingWaitPeak: 31,
    averageEntryWait: 22,
    averageMerchWait: 20,
    averageParkingWait: 19,
    artistCategory: "alt-hip-hop",
  },
  {
    id: "hist-luna-hob-2025",
    artist: "Luna Circuit",
    venue: "House of Blues Dallas",
    date: "Feb 8, 2025",
    attendanceEstimate: 1450,
    monthlyListenersEstimate: 2100000,
    entryWaitPeak: 24,
    merchWaitPeak: 19,
    parkingWaitPeak: 18,
    averageEntryWait: 14,
    averageMerchWait: 11,
    averageParkingWait: 10,
    artistCategory: "alt-hip-hop",
  },
  {
    id: "hist-morgan-dos-2025",
    artist: "Morgan Wallen",
    venue: "Dos Equis Pavilion",
    date: "Jul 19, 2025",
    attendanceEstimate: 20200,
    monthlyListenersEstimate: 36000000,
    entryWaitPeak: 61,
    merchWaitPeak: 44,
    parkingWaitPeak: 58,
    averageEntryWait: 36,
    averageMerchWait: 27,
    averageParkingWait: 38,
    artistCategory: "country",
  },
  {
    id: "hist-luke-dos-2024",
    artist: "Luke Combs",
    venue: "Dos Equis Pavilion",
    date: "Sep 15, 2024",
    attendanceEstimate: 19600,
    monthlyListenersEstimate: 25000000,
    entryWaitPeak: 57,
    merchWaitPeak: 41,
    parkingWaitPeak: 54,
    averageEntryWait: 34,
    averageMerchWait: 25,
    averageParkingWait: 35,
    artistCategory: "country",
  },
  {
    id: "hist-oak-hob-2025",
    artist: "Oak Cliff Soul Club",
    venue: "House of Blues Dallas",
    date: "Jan 19, 2025",
    attendanceEstimate: 1250,
    monthlyListenersEstimate: 480000,
    entryWaitPeak: 18,
    merchWaitPeak: 12,
    parkingWaitPeak: 16,
    averageEntryWait: 10,
    averageMerchWait: 7,
    averageParkingWait: 9,
    artistCategory: "country",
  },
  {
    id: "hist-velvet-factory-2025",
    artist: "Velvet Static",
    venue: "The Factory in Deep Ellum",
    date: "May 23, 2025",
    attendanceEstimate: 3900,
    monthlyListenersEstimate: 3400000,
    entryWaitPeak: 33,
    merchWaitPeak: 27,
    parkingWaitPeak: 31,
    averageEntryWait: 19,
    averageMerchWait: 17,
    averageParkingWait: 20,
    artistCategory: "indie-electronic",
  },
  {
    id: "hist-atlas-tmf-2025",
    artist: "Atlas Wave",
    venue: "Toyota Music Factory",
    date: "Apr 26, 2025",
    attendanceEstimate: 6800,
    monthlyListenersEstimate: 5100000,
    entryWaitPeak: 36,
    merchWaitPeak: 24,
    parkingWaitPeak: 39,
    averageEntryWait: 21,
    averageMerchWait: 15,
    averageParkingWait: 24,
    artistCategory: "indie-electronic",
  },
  {
    id: "hist-midnight-factory-2024",
    artist: "Midnight Tapes",
    venue: "The Factory in Deep Ellum",
    date: "Dec 7, 2024",
    attendanceEstimate: 3600,
    monthlyListenersEstimate: 2800000,
    entryWaitPeak: 29,
    merchWaitPeak: 22,
    parkingWaitPeak: 28,
    averageEntryWait: 17,
    averageMerchWait: 14,
    averageParkingWait: 18,
    artistCategory: "indie-electronic",
  },
  {
    id: "hist-solara-factory-2024",
    artist: "Solara Voss",
    venue: "The Factory in Deep Ellum",
    date: "Oct 2, 2024",
    attendanceEstimate: 4100,
    monthlyListenersEstimate: 7600000,
    entryWaitPeak: 35,
    merchWaitPeak: 30,
    parkingWaitPeak: 28,
    averageEntryWait: 20,
    averageMerchWait: 18,
    averageParkingWait: 17,
    artistCategory: "alt-hip-hop",
  },
  {
    id: "hist-drake-dos-2024",
    artist: "Drake",
    venue: "Dos Equis Pavilion",
    date: "Jun 29, 2024",
    attendanceEstimate: 20000,
    monthlyListenersEstimate: 81000000,
    entryWaitPeak: 59,
    merchWaitPeak: 40,
    parkingWaitPeak: 56,
    averageEntryWait: 35,
    averageMerchWait: 24,
    averageParkingWait: 37,
    artistCategory: "stadium-rap",
  },
  {
    id: "hist-future-tmf-2025",
    artist: "Future",
    venue: "Toyota Music Factory",
    date: "Mar 9, 2025",
    attendanceEstimate: 7900,
    monthlyListenersEstimate: 59000000,
    entryWaitPeak: 42,
    merchWaitPeak: 29,
    parkingWaitPeak: 45,
    averageEntryWait: 25,
    averageMerchWait: 17,
    averageParkingWait: 29,
    artistCategory: "stadium-rap",
  },
  {
    id: "hist-kendrick-dos-2025",
    artist: "Kendrick Lamar",
    venue: "Dos Equis Pavilion",
    date: "May 31, 2025",
    attendanceEstimate: 18800,
    monthlyListenersEstimate: 65000000,
    entryWaitPeak: 53,
    merchWaitPeak: 36,
    parkingWaitPeak: 49,
    averageEntryWait: 32,
    averageMerchWait: 22,
    averageParkingWait: 31,
    artistCategory: "alt-hip-hop",
  },
  {
    id: "hist-luke-aac-2025",
    artist: "Luke Combs",
    venue: "American Airlines Center",
    date: "Feb 21, 2025",
    attendanceEstimate: 19700,
    monthlyListenersEstimate: 24500000,
    entryWaitPeak: 54,
    merchWaitPeak: 38,
    parkingWaitPeak: 43,
    averageEntryWait: 32,
    averageMerchWait: 24,
    averageParkingWait: 27,
    artistCategory: "country",
  },
  {
    id: "hist-atlas-factory-2024",
    artist: "Atlas Wave",
    venue: "The Factory in Deep Ellum",
    date: "Aug 3, 2024",
    attendanceEstimate: 3400,
    monthlyListenersEstimate: 4600000,
    entryWaitPeak: 27,
    merchWaitPeak: 20,
    parkingWaitPeak: 24,
    averageEntryWait: 16,
    averageMerchWait: 12,
    averageParkingWait: 15,
    artistCategory: "indie-electronic",
  },
  {
    id: "hist-velvet-hob-2024",
    artist: "Velvet Static",
    venue: "House of Blues Dallas",
    date: "Sep 11, 2024",
    attendanceEstimate: 1550,
    monthlyListenersEstimate: 3300000,
    entryWaitPeak: 21,
    merchWaitPeak: 17,
    parkingWaitPeak: 15,
    averageEntryWait: 12,
    averageMerchWait: 10,
    averageParkingWait: 9,
    artistCategory: "indie-electronic",
  },
];

const average = (values: number[]) => (values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0);

const getArtistCategory = (artist: string) =>
  Object.entries(artistCategories).find(([, artists]) => artists.includes(artist))?.[0];

const getAverages = (events: HistoricalEvent[]): HistoricalWaitAverages => ({
  averageEntryWait: average(events.map((event) => event.averageEntryWait)),
  averageMerchWait: average(events.map((event) => event.averageMerchWait)),
  averageParkingWait: average(events.map((event) => event.averageParkingWait)),
  peakEntryWait: Math.max(0, ...events.map((event) => event.entryWaitPeak)),
  peakMerchWait: Math.max(0, ...events.map((event) => event.merchWaitPeak)),
  peakParkingWait: Math.max(0, ...events.map((event) => event.parkingWaitPeak)),
  eventCount: events.length,
});

const getTrend = (currentEntryWait: number, averageEntryWait: number): HistoricalTrend => {
  if (currentEntryWait >= averageEntryWait + 8) {
    return "higher";
  }

  if (currentEntryWait <= averageEntryWait - 8) {
    return "lighter";
  }

  return "average";
};

const getTrendLabel = (trend: HistoricalTrend) => {
  if (trend === "higher") {
    return "Higher than normal";
  }

  if (trend === "lighter") {
    return "Lighter than usual";
  }

  return "About average";
};

export function getHistoricalEventsForArtist(artist: string) {
  return historicalEvents.filter((event) => event.artist === artist);
}

export function getHistoricalEventsForVenue(venue: string) {
  return historicalEvents.filter((event) => event.venue === venue);
}

export function getSimilarArtists(artist: string) {
  const category = getArtistCategory(artist);
  if (!category) {
    return [];
  }

  return artistCategories[category].filter((similarArtist) => similarArtist !== artist);
}

export function getAverageWaitByArtist(artist: string) {
  return getAverages(getHistoricalEventsForArtist(artist));
}

export function getAverageWaitByVenue(venue: string) {
  return getAverages(getHistoricalEventsForVenue(venue));
}

export function getHistoricalInsightForEvent(event: Concert): HistoricalInsight {
  const artistHistory = getHistoricalEventsForArtist(event.artist);
  const similarArtists = getSimilarArtists(event.artist);
  const similarHistory = historicalEvents.filter((historicalEvent) => similarArtists.includes(historicalEvent.artist));
  const venueHistory = getHistoricalEventsForVenue(event.venue);
  const combinedHistory = artistHistory.length >= 3 ? artistHistory : [...artistHistory, ...similarHistory, ...venueHistory];
  const uniqueHistory = Array.from(new Map(combinedHistory.map((historicalEvent) => [historicalEvent.id, historicalEvent])).values());
  const averages = getAverages(uniqueHistory);
  const currentEntryWait = event.lines.find((line) => line.type === "Entry")?.waitMinutes ?? 0;
  const trend = getTrend(currentEntryWait, averages.averageEntryWait);
  const statementArtist = artistHistory.length ? event.artist : similarArtists[0] ?? event.artist;

  return {
    artist: event.artist,
    venue: event.venue,
    averageEntryWait: averages.averageEntryWait,
    peakEntryWait: averages.peakEntryWait,
    eventCount: uniqueHistory.length,
    similarArtistCount: similarArtists.filter((artist) => uniqueHistory.some((historicalEvent) => historicalEvent.artist === artist)).length,
    trend,
    trendLabel: getTrendLabel(trend),
    statement: `Entry lines for ${statementArtist} concerts at ${event.venue} typically peak around ${averages.peakEntryWait} minutes.`,
    chartEvents: uniqueHistory.slice(0, 5),
  };
}
