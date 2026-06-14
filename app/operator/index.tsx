import { Text, View } from "react-native";
import { LineEstimate, PredictionResult } from "../../types/queue";
import { predictEventLines } from "../../services/predictionService";
import { Screen } from "../../components/Screen";
import { useQueueStore } from "../../store/useQueueStore";

const trendLabel = (trend: PredictionResult["trend"]) => {
  if (trend === "rise") {
    return "rising";
  }

  if (trend === "drop") {
    return "dropping";
  }

  return "steady";
};

const actionForLine = (line: LineEstimate, prediction?: PredictionResult) => {
  if (prediction?.trend !== "rise") {
    return "Keep monitoring";
  }

  const actions: Record<LineEstimate["type"], string> = {
    Entry: "Open another entry lane",
    Merch: "Send additional staff to merch",
    Parking: "Push parking alert to attendees",
    Food: "Shift staff to concessions",
    Bathrooms: "Increase restroom monitoring",
  };

  return actions[line.type];
};

const riskForEvent = (predictions: PredictionResult[]) => {
  const maxPredictedWait = Math.max(...predictions.map((prediction) => prediction.predictedWaitMinutes));
  const risingCount = predictions.filter((prediction) => prediction.trend === "rise").length;

  if (maxPredictedWait >= 45 || risingCount >= 3) {
    return "High";
  }

  if (maxPredictedWait >= 25 || risingCount >= 1) {
    return "Medium";
  }

  return "Low";
};

export default function OperatorDashboardScreen() {
  const concerts = useQueueStore((state) => state.concerts);
  const venues = useQueueStore((state) => state.venues);
  const activeEvent =
    concerts.find((concert) => concert.status === "Live now") ??
    concerts.find((concert) => concert.status === "Doors soon") ??
    concerts.find((concert) => concert.status === "Tonight") ??
    concerts[0];
  const venue = venues.find((item) => item.id === activeEvent.venueId) ?? venues[0];
  const predictions = predictEventLines(activeEvent, venue, 30);
  const predictionByLineId = Object.fromEntries(predictions.map((prediction) => [prediction.lineId, prediction]));
  const totalReports = activeEvent.lines.reduce((sum, line) => sum + line.reportCount, 0);
  const verifiedReports = activeEvent.lines.reduce((sum, line) => sum + line.verifiedReportCount, 0);
  const crowdRisk = riskForEvent(predictions);
  const entryPrediction = predictions.find((prediction) => prediction.lineId.includes("entry"));
  const parkingLine = activeEvent.lines.find((line) => line.type === "Parking");
  const merchLine = activeEvent.lines.find((line) => line.type === "Merch");

  const alerts = [
    entryPrediction && entryPrediction.predictedWaitMinutes >= 45
      ? `Entry wait expected to exceed ${entryPrediction.predictedWaitMinutes} minutes in 30 minutes`
      : "Entry waits are below the critical threshold for the next 30 minutes",
    parkingLine ? `Parking reports increased by 35% near ${venue.name}` : "Parking line data unavailable",
    merchLine && merchLine.confidence === "Low"
      ? "Merch line confidence is low, needs more reports"
      : "Merch line confidence has enough trusted reports",
  ];

  return (
    <Screen>
      <View className="pb-5 pt-3">
        <Text className="text-sm font-bold uppercase tracking-[3px] text-primary-soft">Venue Operator Demo</Text>
        <Text className="mt-3 text-4xl font-black leading-tight text-white">Crowd flow command center</Text>
        <Text className="mt-3 text-base leading-6 text-slate-400">
          A mock view of how QueueCast could help venues manage staffing and line pressure before problems build.
        </Text>
      </View>

      <View className="mb-5 rounded-2xl border border-white/10 bg-panel p-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-primary-soft">Active event</Text>
            <Text className="mt-2 text-2xl font-black text-white">{activeEvent.artist}</Text>
            <Text className="mt-1 text-sm font-semibold text-slate-300">{venue.name}</Text>
          </View>
          <View
            className={`rounded-full px-3 py-1.5 ${
              crowdRisk === "High" ? "bg-red-500/20" : crowdRisk === "Medium" ? "bg-yellow-400/20" : "bg-emerald-500/20"
            }`}
          >
            <Text
              className={`text-xs font-black uppercase tracking-wider ${
                crowdRisk === "High" ? "text-red-200" : crowdRisk === "Medium" ? "text-yellow-200" : "text-emerald-300"
              }`}
            >
              {crowdRisk} risk
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-white/5 p-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Doors</Text>
            <Text className="mt-1 text-lg font-black text-white">{activeEvent.doorsTime}</Text>
          </View>
          <View className="flex-1 rounded-xl bg-white/5 p-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Show</Text>
            <Text className="mt-1 text-lg font-black text-white">{activeEvent.showTime}</Text>
          </View>
        </View>

        <View className="mt-3 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-white/5 p-3">
            <Text className="text-2xl font-black text-white">{totalReports}</Text>
            <Text className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">active reports</Text>
          </View>
          <View className="flex-1 rounded-xl bg-white/5 p-3">
            <Text className="text-2xl font-black text-white">{verifiedReports}</Text>
            <Text className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">verified</Text>
          </View>
        </View>
      </View>

      <Text className="mb-3 text-lg font-black text-white">Line operations</Text>
      {activeEvent.lines.map((line) => {
        const prediction = predictionByLineId[line.id];

        return (
          <View key={line.id} className="mb-3 rounded-2xl border border-white/10 bg-panel p-4">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-lg font-black text-white">{line.type}</Text>
                <Text className="mt-1 text-sm text-slate-400">{actionForLine(line, prediction)}</Text>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-black text-white">{line.waitMinutes}m</Text>
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">current</Text>
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              <View className="rounded-full bg-primary/20 px-3 py-1.5">
                <Text className="text-xs font-bold text-primary-soft">{prediction?.predictedWaitMinutes ?? line.waitMinutes}m in 30</Text>
              </View>
              <View className="rounded-full bg-white/10 px-3 py-1.5">
                <Text className="text-xs font-bold text-slate-200">{line.confidence} confidence</Text>
              </View>
              <View className="rounded-full bg-emerald-500/15 px-3 py-1.5">
                <Text className="text-xs font-bold text-emerald-300">{line.verifiedReportCount} verified</Text>
              </View>
              <View className="rounded-full bg-white/10 px-3 py-1.5">
                <Text className="text-xs font-bold text-slate-300">{trendLabel(prediction?.trend ?? "steady")}</Text>
              </View>
            </View>
          </View>
        );
      })}

      <Text className="mb-3 mt-2 text-lg font-black text-white">Alerts</Text>
      <View className="mb-5 rounded-2xl border border-white/10 bg-panel p-4">
        {alerts.map((alert) => (
          <View key={alert} className="mb-3 flex-row gap-3 last:mb-0">
            <View className="mt-2 h-2 w-2 rounded-full bg-primary" />
            <Text className="flex-1 text-sm leading-6 text-slate-300">{alert}</Text>
          </View>
        ))}
      </View>

      <View className="rounded-2xl border border-primary/30 bg-primary/15 p-5">
        <Text className="text-2xl font-black text-white">QueueCast helps venues see crowd pressure before it becomes a problem.</Text>
        <Text className="mt-3 text-sm leading-6 text-slate-300">
          The operator view turns fan reports and arrival predictions into staffing actions, alerts, and confidence signals for the venue team.
        </Text>
      </View>
    </Screen>
  );
}
