import { Pressable, Text, View } from "react-native";
import { LineEstimate } from "../types/queue";

type LineEstimateCardProps = {
  line: LineEstimate;
  onReport?: () => void;
};

const waitColor = (minutes: number) => {
  if (minutes >= 30) {
    return "#EF4444";
  }

  if (minutes >= 15) {
    return "#FBBF24";
  }

  return "#22C55E";
};

export function LineEstimateCard({ line, onReport }: LineEstimateCardProps) {
  const statusColor = waitColor(line.waitMinutes);

  return (
    <View className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-panel-soft">
      <View className="h-1.5" style={{ backgroundColor: statusColor }} />
      <View className="p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-extrabold text-white">{line.type}</Text>
          <Text className="mt-1 text-xs font-medium text-slate-400">Updated {line.lastUpdated}</Text>
        </View>
        <View className="items-end">
          <Text className="text-3xl font-black" style={{ color: statusColor }}>
            {line.waitMinutes}
          </Text>
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">min wait</Text>
        </View>
      </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          <View className="rounded-full bg-white/10 px-3 py-1.5">
            <Text className="text-xs font-bold text-slate-200">{line.confidence} confidence</Text>
          </View>
          <View className="rounded-full bg-primary/20 px-3 py-1.5">
            <Text className="text-xs font-bold text-primary-soft">{line.reportCount} reports</Text>
          </View>
          <View className="rounded-full bg-emerald-500/15 px-3 py-1.5">
            <Text className="text-xs font-bold text-emerald-300">{line.verifiedReportCount} verified</Text>
          </View>
          <View className="rounded-full bg-white/10 px-3 py-1.5">
            <Text className="text-xs font-bold text-slate-300">{line.totalTrustScore} trust</Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">{line.crowdLevel} crowd</Text>
          {onReport ? (
            <Pressable onPress={onReport} className="rounded-full bg-primary px-4 py-2 active:opacity-80">
              <Text className="text-xs font-black uppercase tracking-wider text-white">Report</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
