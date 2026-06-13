import { Pressable, Text, View } from "react-native";
import { Concert } from "../types/queue";

type EventCardProps = {
  concert: Concert;
  onPress: () => void;
};

export function EventCard({ concert, onPress }: EventCardProps) {
  const entryLine = concert.lines.find((line) => line.type === "Entry");

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-panel active:scale-[0.99]"
    >
      <View className="h-1.5" style={{ backgroundColor: concert.accent }} />
      <View className="p-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary-soft">{concert.date}</Text>
            <Text className="mt-2 text-2xl font-black text-white">{concert.artist}</Text>
            <Text className="mt-1 text-sm font-medium text-slate-300">{concert.venue}</Text>
            <Text className="mt-1 text-sm text-slate-500">{concert.city}</Text>
          </View>
          <View className="items-center rounded-xl bg-white/10 px-3 py-3">
            <Text className="text-2xl font-black text-white">{entryLine?.waitMinutes ?? 0}</Text>
            <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">min entry</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
