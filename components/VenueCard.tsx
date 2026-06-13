import { Pressable, Text, View } from "react-native";
import { Venue } from "../types/queue";

type VenueCardProps = {
  venue: Venue;
  eventCount?: number;
  onPress: () => void;
};

export function VenueCard({ venue, eventCount = 0, onPress }: VenueCardProps) {
  return (
    <Pressable onPress={onPress} className="mb-3 rounded-2xl border border-white/10 bg-panel p-4 active:scale-[0.99]">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-lg font-black text-white">{venue.name}</Text>
          <Text className="mt-1 text-sm font-semibold text-slate-300">{venue.city}</Text>
          <Text className="mt-2 text-xs leading-5 text-slate-500">{venue.address}</Text>
        </View>
        <View className="items-end rounded-xl bg-white/10 px-3 py-3">
          <Text className="text-xl font-black text-white">{eventCount}</Text>
          <Text className="text-[10px] font-bold uppercase tracking-wider text-slate-400">events</Text>
        </View>
      </View>
      <View className="mt-4 flex-row gap-2">
        <View className="rounded-full bg-primary/20 px-3 py-1.5">
          <Text className="text-xs font-bold text-primary-soft">{venue.capacity.toLocaleString()} cap</Text>
        </View>
        <View className="rounded-full bg-white/10 px-3 py-1.5">
          <Text className="text-xs font-bold text-slate-300">{venue.entryPointsCount} entries</Text>
        </View>
      </View>
    </Pressable>
  );
}
