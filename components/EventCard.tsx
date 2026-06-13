import { Pressable, Text, View } from "react-native";
import { Concert } from "../types/queue";

type EventCardProps = {
  concert: Concert;
  onPress: () => void;
};

export function EventCard({ concert, onPress }: EventCardProps) {
  const entryLine = concert.lines.find((line) => line.type === "Entry");
  const statusTone =
    concert.status === "Live now"
      ? "bg-emerald-500/20 text-emerald-300"
      : concert.status === "Doors soon"
        ? "bg-yellow-400/20 text-yellow-200"
        : concert.status === "Ended"
          ? "bg-slate-500/20 text-slate-300"
          : "bg-primary/20 text-primary-soft";

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-panel active:scale-[0.99]"
    >
      <View className="h-1.5" style={{ backgroundColor: concert.accent }} />
      <View className="p-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-primary-soft">{concert.date}</Text>
              <View className={`rounded-full px-2.5 py-1 ${statusTone.split(" ")[0]}`}>
                <Text className={`text-[10px] font-black uppercase tracking-wider ${statusTone.split(" ")[1]}`}>{concert.status}</Text>
              </View>
            </View>
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
