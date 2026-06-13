import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { LineEstimateCard } from "../../components/LineEstimateCard";
import { Screen } from "../../components/Screen";
import { fetchConcertById } from "../../services/queueService";
import { useQueueStore } from "../../store/useQueueStore";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const concert = useQueueStore((state) => state.concerts.find((item) => item.id === id));
  useQuery({ queryKey: ["concert", id], queryFn: () => fetchConcertById(id), enabled: Boolean(id) });

  if (!concert) {
    return (
      <Screen>
        <EmptyState title="Event unavailable" body="This concert is not in the current mock schedule." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="pb-6 pt-3">
        <View className="mb-5 h-2 w-24 rounded-full" style={{ backgroundColor: concert.accent }} />
        <Text className="text-sm font-bold uppercase tracking-[3px] text-primary-soft">{concert.date}</Text>
        <Text className="mt-3 text-4xl font-black leading-tight text-white">{concert.artist}</Text>
        <Text className="mt-3 text-lg font-bold text-slate-200">{concert.venue}</Text>
        <Text className="mt-1 text-base text-slate-500">{concert.city}</Text>
      </View>

      <View className="mb-5 flex-row rounded-2xl border border-white/10 bg-panel p-4">
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Doors</Text>
          <Text className="mt-1 text-xl font-black text-white">{concert.doorsTime}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Live lines</Text>
          <Text className="mt-1 text-xl font-black text-white">{concert.lines.length}</Text>
        </View>
      </View>

      <Text className="mb-3 text-lg font-black text-white">Line estimates</Text>
      {concert.lines.map((line) => (
        <LineEstimateCard key={line.id} line={line} onReport={() => router.push(`/report/${line.id}`)} />
      ))}
    </Screen>
  );
}
