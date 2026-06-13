import { Pressable, Text, View } from "react-native";
import { LineEstimate } from "../types/queue";

type LineEstimateCardProps = {
  line: LineEstimate;
  onReport?: () => void;
};

export function LineEstimateCard({ line, onReport }: LineEstimateCardProps) {
  return (
    <View className="mb-3 rounded-2xl border border-white/10 bg-panel-soft p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-extrabold text-white">{line.type}</Text>
          <Text className="mt-1 text-xs font-medium text-slate-400">Updated {line.lastUpdated}</Text>
        </View>
        <View className="items-end">
          <Text className="text-3xl font-black text-white">{line.waitMinutes}</Text>
          <Text className="text-xs font-bold uppercase tracking-wider text-primary-soft">minutes</Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row gap-2">
          <View className="rounded-full bg-white/10 px-3 py-1.5">
            <Text className="text-xs font-bold text-slate-200">{line.confidence}% confidence</Text>
          </View>
          <View className="rounded-full bg-primary/20 px-3 py-1.5">
            <Text className="text-xs font-bold text-primary-soft">{line.crowdLevel}</Text>
          </View>
        </View>
        {onReport ? (
          <Pressable onPress={onReport} className="rounded-full bg-primary px-4 py-2 active:opacity-80">
            <Text className="text-xs font-black uppercase tracking-wider text-white">Report</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
