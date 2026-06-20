import { mockConcerts, mockVenues, recalculateLineEstimate } from "../data/mockConcerts";
import {
  Concert,
  CrowdLevel,
  EventStatus,
  LineEstimate,
  LineReport,
  LineReportInput,
  LineType,
  ReporterStatus,
  Venue,
  VerificationStatus,
} from "../types/queue";
import { isSupabaseConfigured, supabase } from "./supabaseClient";

export type SupabaseReadStatus = "connected" | "mock_fallback" | "query_failed";

let supabaseReadStatus: SupabaseReadStatus = "mock_fallback";
let hasSupabaseQueryFailed = false;

class EmptySupabaseResultError extends Error {
  constructor(resource: string) {
    super(`Supabase returned no ${resource}.`);
    this.name = "EmptySupabaseResultError";
  }
}

type VenueRow = {
  id: string;
  name: string;
  city: string;
  address: string | null;
  capacity: number | null;
  latitude: number | null;
  longitude: number | null;
  entry_points_count: number | null;
  bottleneck_severity: "low" | "medium" | "high" | null;
  typical_bottleneck_notes: string | null;
};

type EventRow = {
  id: string;
  venue_id: string;
  artist: string;
  city: string;
  event_date: string;
  doors_time: string | null;
  show_time: string | null;
  status: "tonight" | "upcoming" | "doors_soon" | "live_now" | "ended";
};

type LineRow = {
  id: string;
  event_id: string;
  line_type: "entry" | "merch" | "parking" | "food" | "bathrooms";
  label: string;
};

type ReportRow = {
  id: string;
  line_id: string;
  wait_minutes: number;
  crowd_level: "light" | "moderate" | "heavy" | "packed";
  reporter_status: "in_line" | "on_the_way" | "already_inside" | "just_checking";
  verification_status:
    | "verified_near_venue"
    | "unverified"
    | "on_the_way"
    | "inside_venue"
    | "too_far"
    | "location_denied"
    | "location_unavailable";
  trust_score: number;
  distance_from_venue_meters: number | null;
  is_real_location_verified: boolean;
  created_at: string;
};

export type CreateLineReportInput = LineReportInput & {
  userId: string;
  trustScore: number;
  verificationStatus: VerificationStatus;
  distanceFromVenueMeters: number | null;
};

export type UserReportStats = {
  reportsSubmitted: number;
  verifiedReports: number;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string | undefined | null): value is string {
  return Boolean(value && uuidPattern.test(value));
}

const lineTypeLabels: Record<LineRow["line_type"], LineType> = {
  entry: "Entry",
  merch: "Merch",
  parking: "Parking",
  food: "Food",
  bathrooms: "Bathrooms",
};

const lineOrder: LineType[] = ["Entry", "Merch", "Parking", "Food", "Bathrooms"];

const statusLabels: Record<EventRow["status"], EventStatus> = {
  tonight: "Tonight",
  upcoming: "Upcoming",
  doors_soon: "Doors soon",
  live_now: "Live now",
  ended: "Ended",
};

const accents = ["#8B5CF6", "#22C55E", "#F472B6", "#06B6D4", "#FBBF24", "#A78BFA", "#FB7185", "#34D399"];

const fallbackConcertById = (id: string) => mockConcerts.find((concert) => concert.id === id);
const fallbackVenueById = (id: string) => mockVenues.find((venue) => venue.id === id);

export function getSupabaseReadStatus(): SupabaseReadStatus {
  if (!isSupabaseConfigured) {
    return "mock_fallback";
  }

  if (hasSupabaseQueryFailed) {
    return "query_failed";
  }

  return supabaseReadStatus;
}

function markSupabaseConnected() {
  if (!hasSupabaseQueryFailed) {
    supabaseReadStatus = "connected";
  }
}

function markSupabaseEmptyFallback(source: string) {
  supabaseReadStatus = "mock_fallback";

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[QueueCast] Supabase returned 0 ${source}. Using mock fallback.`);
  }
}

function markSupabaseFallback(source: string, error: unknown) {
  hasSupabaseQueryFailed = true;
  supabaseReadStatus = "query_failed";

  if (process.env.NODE_ENV !== "production") {
    console.error(`[QueueCast] Supabase ${source} query failed. Using mock fallback.`, error);
  }
}

function logMockIdFallback(resource: string, id: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[QueueCast] ${resource} received mock id "${id}". Skipping Supabase UUID query.`);
  }
}

const formatTime = (value: string | null) => {
  if (!value) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatDate = (value: string, status: EventStatus) => {
  if (status === "Tonight") {
    return "Tonight";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
};

const minutesFromTime = (value: string | null) => {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
};

const dayOffsetFromDate = (value: string) => {
  const eventDate = new Date(`${value}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Math.round((eventDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
};

const submittedLabel = (createdAt: string) => {
  const minutesAgo = Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / (60 * 1000)));

  if (minutesAgo < 1) {
    return "just now";
  }

  if (minutesAgo < 60) {
    return `${minutesAgo} min ago`;
  }

  const hoursAgo = Math.round(minutesAgo / 60);
  return `${hoursAgo} hr ago`;
};

const mapVenue = (row: VenueRow): Venue => ({
  id: row.id,
  name: row.name,
  city: row.city,
  capacity: row.capacity ?? 0,
  address: row.address ?? "Address TBD",
  coordinates: {
    latitude: row.latitude ?? 0,
    longitude: row.longitude ?? 0,
  },
  defaultLineTypes: ["Entry", "Merch", "Parking", "Food", "Bathrooms"],
  entryPointsCount: row.entry_points_count ?? 0,
  bottleneckSeverity: row.bottleneck_severity ?? "medium",
  typicalBottleneckNotes: row.typical_bottleneck_notes
    ? row.typical_bottleneck_notes.split(".").map((note) => note.trim()).filter(Boolean)
    : ["Wait patterns will be learned as QueueCast receives more venue reports."],
});

const mapCrowdLevel = (level: ReportRow["crowd_level"]): CrowdLevel => {
  if (level === "light") {
    return "Light";
  }

  if (level === "moderate") {
    return "Steady";
  }

  return "Packed";
};

const mapReporterStatus = (status: ReportRow["reporter_status"]): ReporterStatus => {
  if (status === "already_inside") {
    return "inside";
  }

  return status;
};

const mapVerificationStatus = (status: ReportRow["verification_status"]): VerificationStatus => {
  if (status === "verified_near_venue" || status === "on_the_way" || status === "inside_venue") {
    return status;
  }

  return "unverified";
};

const crowdLevelValues: Record<CrowdLevel, ReportRow["crowd_level"]> = {
  Light: "light",
  Steady: "moderate",
  Packed: "packed",
};

const reporterStatusValues: Record<ReporterStatus, ReportRow["reporter_status"]> = {
  in_line: "in_line",
  on_the_way: "on_the_way",
  inside: "already_inside",
  just_checking: "just_checking",
};

const mapReport = (row: ReportRow): LineReport => ({
  id: row.id,
  lineId: row.line_id,
  waitMinutes: row.wait_minutes,
  crowdLevel: mapCrowdLevel(row.crowd_level),
  reporterStatus: mapReporterStatus(row.reporter_status),
  isNearVenue: row.verification_status === "verified_near_venue",
  isRealLocationVerified: row.is_real_location_verified,
  submittedAt: new Date(row.created_at).getTime(),
  submittedLabel: submittedLabel(row.created_at),
  trustScore: row.trust_score,
  verificationStatus: mapVerificationStatus(row.verification_status),
});

const emptyLineEstimate = (row: LineRow, reports: LineReport[]): LineEstimate =>
  recalculateLineEstimate({
    id: row.id,
    eventId: row.event_id,
    type: lineTypeLabels[row.line_type],
    waitMinutes: 0,
    confidence: "Low",
    totalTrustScore: 0,
    reportCount: 0,
    verifiedReportCount: 0,
    lastUpdated: "No reports",
    crowdLevel: "Light",
    reports,
  });

const mapEvent = (row: EventRow, venue: Venue, lines: LineEstimate[], index = 0): Concert => {
  const status = statusLabels[row.status];
  const doorsMinutes = minutesFromTime(row.doors_time);
  const showMinutes = minutesFromTime(row.show_time);

  return {
    id: row.id,
    venueId: row.venue_id,
    artist: row.artist,
    venue: venue.name,
    city: row.city || venue.city,
    date: formatDate(row.event_date, status),
    doorsTime: formatTime(row.doors_time),
    showTime: formatTime(row.show_time),
    doorsMinutes,
    showMinutes,
    endMinutes: showMinutes + 180,
    dayOffset: dayOffsetFromDate(row.event_date),
    status,
    accent: accents[index % accents.length],
    lines,
  };
};

async function getSupabaseOrThrow() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

async function fetchVenueRows() {
  const client = await getSupabaseOrThrow();
  const { data, error } = await client.from("venues").select("*").order("name");

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[QueueCast] Supabase venues query error:", error);
    }
    throw error;
  }

  const rows = (data ?? []) as VenueRow[];

  if (process.env.NODE_ENV !== "production") {
    console.log(`[QueueCast] Supabase venues query count: ${rows.length}`);
  }

  return rows;
}

async function fetchEventRows() {
  const client = await getSupabaseOrThrow();
  const { data, error } = await client.from("events").select("*").order("event_date");

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[QueueCast] Supabase events query error:", error);
    }
    throw error;
  }

  const rows = (data ?? []) as EventRow[];

  if (process.env.NODE_ENV !== "production") {
    console.log(`[QueueCast] Supabase events query count: ${rows.length}`);
  }

  return rows;
}

async function fetchLineRowsForEvent(eventId: string) {
  if (!isUuid(eventId)) {
    logMockIdFallback("Lines lookup", eventId);
    return [];
  }

  const client = await getSupabaseOrThrow();
  const { data, error } = await client.from("lines").select("*").eq("event_id", eventId).order("line_type");

  if (error) {
    throw error;
  }

  return (data ?? []) as LineRow[];
}

async function fetchReportRowsForLine(lineId: string) {
  if (!isUuid(lineId)) {
    logMockIdFallback("Reports lookup", lineId);
    return [];
  }

  const client = await getSupabaseOrThrow();
  const { data, error } = await client.from("line_reports").select("*").eq("line_id", lineId).order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ReportRow[];
}

async function buildLineEstimate(row: LineRow) {
  const reports = (await fetchReportRowsForLine(row.id)).map(mapReport);
  return emptyLineEstimate(row, reports);
}

async function buildEvent(row: EventRow, venue: Venue, index = 0) {
  const lineRows = await fetchLineRowsForEvent(row.id);
  const lines = await Promise.all(lineRows.map(buildLineEstimate));

  return mapEvent(
    row,
    venue,
    lines.sort((first, second) => lineOrder.indexOf(first.type) - lineOrder.indexOf(second.type)),
    index,
  );
}

export async function getEvents(): Promise<Concert[]> {
  try {
    const [venueRows, eventRows] = await Promise.all([fetchVenueRows(), fetchEventRows()]);

    if (!eventRows.length) {
      throw new EmptySupabaseResultError("events");
    }

    if (!venueRows.length) {
      throw new EmptySupabaseResultError("venues required to map events");
    }

    const venuesById = Object.fromEntries(venueRows.map((venue) => [venue.id, mapVenue(venue)]));

    const events = await Promise.all(
      eventRows.map((event, index) => {
        const venue = venuesById[event.venue_id];

        if (!venue) {
          throw new Error(`Missing venue for event ${event.id}`);
        }

        return buildEvent(event, venue, index);
      }),
    );

    markSupabaseConnected();
    return events;
  } catch (error) {
    if (error instanceof EmptySupabaseResultError) {
      markSupabaseEmptyFallback("events");
      return mockConcerts;
    }

    markSupabaseFallback("events", error);
    return mockConcerts;
  }
}

export async function getVenues(): Promise<Venue[]> {
  try {
    const venues = (await fetchVenueRows()).map(mapVenue);

    if (!venues.length) {
      throw new EmptySupabaseResultError("venues");
    }

    markSupabaseConnected();
    return venues;
  } catch (error) {
    if (error instanceof EmptySupabaseResultError) {
      markSupabaseEmptyFallback("venues");
      return mockVenues;
    }

    markSupabaseFallback("venues", error);
    return mockVenues;
  }
}

export async function getEventById(id: string): Promise<Concert | undefined> {
  if (!isUuid(id)) {
    logMockIdFallback("Event lookup", id);
    return fallbackConcertById(id);
  }

  try {
    const client = await getSupabaseOrThrow();
    const { data: event, error: eventError } = await client.from("events").select("*").eq("id", id).single();

    if (eventError || !event) {
      throw eventError ?? new Error("Event not found.");
    }

    const venue = await getVenueById((event as EventRow).venue_id);

    if (!venue) {
      throw new Error("Venue not found.");
    }

    const mappedEvent = await buildEvent(event as EventRow, venue);
    markSupabaseConnected();
    return mappedEvent;
  } catch (error) {
    markSupabaseFallback(`event ${id}`, error);
    return fallbackConcertById(id);
  }
}

export async function getVenueById(id: string): Promise<Venue | undefined> {
  if (!isUuid(id)) {
    logMockIdFallback("Venue lookup", id);
    return fallbackVenueById(id);
  }

  try {
    const client = await getSupabaseOrThrow();
    const { data, error } = await client.from("venues").select("*").eq("id", id).single();

    if (error || !data) {
      throw error ?? new Error("Venue not found.");
    }

    const venue = mapVenue(data as VenueRow);
    markSupabaseConnected();
    return venue;
  } catch (error) {
    markSupabaseFallback(`venue ${id}`, error);
    return fallbackVenueById(id);
  }
}

export async function getLinesForEvent(eventId: string): Promise<LineEstimate[]> {
  if (!isUuid(eventId)) {
    logMockIdFallback("Lines lookup", eventId);
    return fallbackConcertById(eventId)?.lines ?? [];
  }

  try {
    const lines = await fetchLineRowsForEvent(eventId);
    const estimates = await Promise.all(lines.map(buildLineEstimate));
    markSupabaseConnected();
    return estimates;
  } catch (error) {
    markSupabaseFallback(`lines for event ${eventId}`, error);
    return fallbackConcertById(eventId)?.lines ?? [];
  }
}

export async function getReportsForLine(lineId: string): Promise<LineReport[]> {
  if (!isUuid(lineId)) {
    logMockIdFallback("Reports lookup", lineId);
    return mockConcerts.flatMap((concert) => concert.lines).find((line) => line.id === lineId)?.reports ?? [];
  }

  try {
    const reports = (await fetchReportRowsForLine(lineId)).map(mapReport);
    markSupabaseConnected();
    return reports;
  } catch (error) {
    markSupabaseFallback(`reports for line ${lineId}`, error);
    return mockConcerts.flatMap((concert) => concert.lines).find((line) => line.id === lineId)?.reports ?? [];
  }
}

export async function createLineReport(input: CreateLineReportInput): Promise<LineReport | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  if (!isUuid(input.lineId)) {
    logMockIdFallback("Report insert", input.lineId);
    return null;
  }

  const insertPayload = {
    line_id: input.lineId,
    user_id: input.userId,
    wait_minutes: input.waitMinutes,
    crowd_level: crowdLevelValues[input.crowdLevel],
    reporter_status: reporterStatusValues[input.reporterStatus],
    verification_status: input.verificationStatus,
    trust_score: input.trustScore,
    distance_from_venue_meters: input.distanceFromVenueMeters,
    is_real_location_verified: input.isRealLocationVerified,
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("[QueueCast] Supabase line report insert payload:", insertPayload);
  }

  const { data, error } = await supabase
    .from("line_reports")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[QueueCast] Supabase line report insert error:", error);
    }

    throw new Error(error.message);
  }

  return mapReport(data as ReportRow);
}

export async function getUserReportStats(userId: string): Promise<UserReportStats | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  if (!isUuid(userId)) {
    logMockIdFallback("User report stats lookup", userId);
    return null;
  }

  const { data, error } = await supabase.from("line_reports").select("verification_status").eq("user_id", userId);

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[QueueCast] Supabase user report stats query error:", error);
    }

    return null;
  }

  const reports = data ?? [];

  return {
    reportsSubmitted: reports.length,
    verifiedReports: reports.filter((report) => report.verification_status === "verified_near_venue").length,
  };
}
