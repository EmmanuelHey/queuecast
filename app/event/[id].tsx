import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/EmptyState";
import { LineEstimateCard } from "../../components/LineEstimateCard";
import { Screen } from "../../components/Screen";
import { colors } from "../../constants/theme";
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

  const primaryLine = concert.lines.find((line) => line.type === "Entry") ?? concert.lines[0];

  return (
    <SafeAreaView className="flex-1 bg-ink">
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-28" showsVerticalScrollIndicator={false}>
        <View className="pb-6 pt-3">
          <View className="mb-5 h-2 w-24 rounded-full" style={{ backgroundColor: concert.accent }} />
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-sm font-bold uppercase tracking-[3px] text-primary-soft">{concert.date}</Text>
            <View className="rounded-full bg-primary/20 px-3 py-1.5">
              <Text className="text-xs font-black uppercase tracking-wider text-primary-soft">{concert.status}</Text>
            </View>
          </View>
          <Text className="mt-3 text-4xl font-black leading-tight text-white">{concert.artist}</Text>
          <Text className="mt-3 text-lg font-bold text-slate-200">{concert.venue}</Text>
          <Text className="mt-1 text-base text-slate-500">{concert.city}</Text>
          <Pressable onPress={() => router.push(`/venue/${concert.venueId}`)} className="mt-4 self-start rounded-full bg-white/10 px-4 py-2">
            <Text className="text-xs font-black uppercase tracking-wider text-slate-200">View venue</Text>
          </Pressable>
        </View>

        <View className="mb-5 rounded-2xl border border-white/10 bg-panel p-4">
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-xl bg-white/5 p-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</Text>
              <Text className="mt-1 text-base font-black text-white">{concert.date}</Text>
            </View>
            <View className="flex-1 rounded-xl bg-white/5 p-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Doors</Text>
              <Text className="mt-1 text-base font-black text-white">{concert.doorsTime}</Text>
            </View>
          </View>
          <View className="mt-3 flex-row gap-3">
            <View className="flex-1 rounded-xl bg-white/5 p-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Show</Text>
              <Text className="mt-1 text-base font-black text-white">{concert.showTime}</Text>
            </View>
            <View className="flex-1 rounded-xl bg-white/5 p-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Live lines</Text>
              <Text className="mt-1 text-base font-black text-white">{concert.lines.length}</Text>
            </View>
          </View>
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-black text-white">Line estimates</Text>
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Trust weighted</Text>
        </View>
        {concert.lines.map((line) => (
          <LineEstimateCard key={line.id} line={line} onReport={() => router.push(`/report/${line.id}`)} />
        ))}
      </ScrollView>

      <View className="absolute bottom-5 left-5 right-5">
        <Pressable
          onPress={() => router.push(`/report/${primaryLine.id}`)}
          className="rounded-2xl bg-primary py-5 shadow-lg active:opacity-90"
          style={{ shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }}
        >
          <Text className="text-center text-base font-black uppercase tracking-wider text-white">Report a Line</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
