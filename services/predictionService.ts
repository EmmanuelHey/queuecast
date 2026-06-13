import { ArrivalOffset, Concert, LineEstimate, LineType, PredictionResult, PredictionTrend, Venue } from "../types/queue";

const MOCK_NOW_MINUTES = 19 * 60 + 10;

const severityMultiplier = {
  low: 0.8,
  medium: 1,
  high: 1.25,
};

const clampWait = (minutes: number) => Math.max(0, Math.min(120, Math.round(minutes)));

const getTrend = (currentWait: number, predictedWait: number): PredictionTrend => {
  if (predictedWait >= currentWait + 4) {
    return "rise";
  }

  if (predictedWait <= currentWait - 4) {
    return "drop";
  }

  return "steady";
};

const trendLabel = (trend: PredictionTrend) => {
  if (trend === "rise") {
    return "Expected to rise";
  }

  if (trend === "drop") {
    return "Expected to drop";
  }

  return "Expected to stay steady";
};

const getTimingAdjustment = (lineType: LineType, event: Concert, arrivalOffset: ArrivalOffset, venue: Venue) => {
  const arrivalMinute = MOCK_NOW_MINUTES + arrivalOffset;
  const minutesUntilDoors = event.doorsMinutes - arrivalMinute;
  const minutesUntilShow = event.showMinutes - arrivalMinute;
  const severity = severityMultiplier[venue.bottleneckSeverity];
  let adjustment = 0;

  if (minutesUntilDoors > 0 && minutesUntilDoors <= 60) {
    adjustment += lineType === "Parking" ? 8 : lineType === "Entry" ? 10 : 3;
  }

  if (minutesUntilDoors <= 0 && minutesUntilShow > 0) {
    adjustment += lineType === "Entry" ? 8 : lineType === "Merch" ? 7 : lineType === "Parking" ? 5 : 2;
  }

  if (minutesUntilShow <= 30 && minutesUntilShow > -15) {
    adjustment += lineType === "Merch" ? 8 : lineType === "Food" ? 4 : lineType === "Bathrooms" ? 3 : 0;
  }

  if (minutesUntilShow <= 0) {
    adjustment += lineType === "Entry" ? -10 : lineType === "Parking" ? -12 : 0;
    adjustment += lineType === "Merch" ? 6 : lineType === "Food" || lineType === "Bathrooms" ? 7 : 0;
  }

  if (event.status === "Doors soon") {
    adjustment += lineType === "Entry" || lineType === "Parking" ? 5 : 1;
  }

  if (event.status === "Live now") {
    adjustment += lineType === "Entry" || lineType === "Parking" ? -6 : 4;
  }

  if (event.status === "Ended") {
    adjustment += lineType === "Parking" ? 6 : -8;
  }

  return adjustment * severity;
};

export function predictLineWait(line: LineEstimate, event: Concert, venue: Venue, arrivalOffset: ArrivalOffset): PredictionResult {
  const baseWait = line.waitMinutes;
  const arrivalPressure = arrivalOffset >= 45 ? 5 : arrivalOffset >= 30 ? 3 : arrivalOffset >= 15 ? 1 : 0;
  const lineTypePressure =
    line.type === "Entry" || line.type === "Parking"
      ? arrivalPressure
      : line.type === "Merch"
        ? Math.max(0, arrivalPressure - 1)
        : Math.max(0, arrivalPressure - 2);
  const predictedWaitMinutes = clampWait(baseWait + getTimingAdjustment(line.type, event, arrivalOffset, venue) + lineTypePressure);
  const trend = getTrend(baseWait, predictedWaitMinutes);

  return {
    lineId: line.id,
    currentWaitMinutes: baseWait,
    predictedWaitMinutes,
    trend,
    trendLabel: trendLabel(trend),
    arrivalOffset,
  };
}

export function predictEventLines(event: Concert, venue: Venue, arrivalOffset: ArrivalOffset) {
  return event.lines.map((line) => predictLineWait(line, event, venue, arrivalOffset));
}
