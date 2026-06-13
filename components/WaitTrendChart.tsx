import { DimensionValue, Text, View } from "react-native";
import { HistoricalEvent } from "../types/queue";

type WaitTrendChartProps = {
  events: HistoricalEvent[];
};

export function WaitTrendChart({ events }: WaitTrendChartProps) {
  const maxPeak = Math.max(1, ...events.map((event) => event.entryWaitPeak));

  return (
    <View className="mt-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Past event</Text>
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Peak wait</Text>
      </View>
      {events.map((event) => {
        const widthPercent = `${Math.max(12, Math.round((event.entryWaitPeak / maxPeak) * 100))}%` as DimensionValue;

        return (
          <View key={event.id} className="mb-3">
            <View className="mb-1 flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-sm font-bold text-white" numberOfLines={1}>
                {event.artist}
              </Text>
              <Text className="text-sm font-black text-primary-soft">{event.entryWaitPeak} min</Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-white/10">
              <View className="h-2 rounded-full bg-primary" style={{ width: widthPercent }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
