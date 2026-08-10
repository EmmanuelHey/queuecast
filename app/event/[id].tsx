import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../components/EmptyState";
import { LineEstimateCard } from "../../components/LineEstimateCard";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { Screen } from "../../components/Screen";
import { WaitTrendChart } from "../../components/WaitTrendChart";
import { colors } from "../../constants/theme";
import { getHistoricalInsightForEvent } from "../../services/historicalService";
import { predictEventLines } from "../../services/predictionService";
import { getEventById, getLinesForEvent, getVenueById, isUuid } from "../../services/supabaseQueueService";
import { isSupabaseConfigured } from "../../services/supabaseClient";
import { useQueueStore } from "../../store/useQueueStore";
import { ArrivalOffset } from "../../types/queue";

const arrivalOptions: Array<{ label: string; value: ArrivalOffset }> = [
  { label: "Now", value: 0 },
  { label: "In 15 minutes", value: 15 },
  { label: "In 30 minutes", value: 30 },
  { label: "In 45 minutes", value: 45 },
  { label: "In 60 minutes", value: 60 },
];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const fallbackConcert = useQueueStore((state) => state.concerts.find((item) => item.id === id));
  const fallbackVenues = useQueueStore((state) => state.venues);
  const [arrivalOffset, setArrivalOffset] = useState<ArrivalOffset>(30);
  const eventQuery = useQuery({
    queryKey: ["supabase", "event", id],
    queryFn: () => getEventById(id),
    enabled: isSupabaseConfigured && isUuid(id),
  });
  const linesQuery = useQuery({
    queryKey: ["supabase", "event-lines", id],
    queryFn: () => getLinesForEvent(id),
    enabled: isSupabaseConfigured && isUuid(id),
  });
  const supabaseConcert =
    eventQuery.data && linesQuery.data?.length
      ? {
          ...eventQuery.data,
          lines: linesQuery.data,
        }
      : eventQuery.data;
  const concert = supabaseConcert ?? fallbackConcert;
  const fallbackVenue = fallbackVenues.find((item) => item.id === concert?.venueId);
  const venueQuery = useQuery({
    queryKey: ["supabase", "venue", concert?.venueId],
    queryFn: () => getVenueById(concert?.venueId ?? ""),
    enabled: isSupabaseConfigured && isUuid(concert?.venueId),
  });
  const venue = venueQuery.data ?? fallbackVenue;
  const isLoading = eventQuery.isLoading || linesQuery.isLoading || venueQuery.isLoading;
  const hasLines = Boolean(concert?.lines.length);
  const eventSource = eventQuery.data ? "supabase" : "mock";
  const predictions = useMemo(
    () => (concert && venue && concert.lines.length ? predictEventLines(concert, venue, arrivalOffset) : []),
    [arrivalOffset, concert, venue],
  );
  const predictionByLineId = Object.fromEntries(predictions.map((prediction) => [prediction.lineId, prediction]));
  const historicalInsight = useMemo(() => (concert ? getHistoricalInsightForEvent(concert) : null), [concert]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.log("[QueueCast] Event detail line state:", {
        eventId: id,
        linesCount: concert?.lines.length ?? 0,
        source: eventSource,
        linesLoading: linesQuery.isLoading,
      });
    }
  }, [concert?.lines.length, eventSource, id, linesQuery.isLoading]);

  if (!concert || !venue) {
    if (isLoading) {
      return (
        <Screen>
          <LoadingSkeleton />
        </Screen>
      );
    }

    return (
      <Screen>
        <EmptyState
          title="Event not found"
          body="This event is not part of the Dallas demo schedule. Head back to Search to pick a launch event."
          actionLabel="Search Dallas shows"
          onAction={() => router.replace("/search")}
        />
      </Screen>
    );
  }

  const primaryLine = concert.lines.find((line) => line.type === "Entry") ?? concert.lines[0];
  const entryPrediction = primaryLine ? predictionByLineId[primaryLine.id] : undefined;

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

        <View className="mb-5 rounded-2xl border border-white/10 bg-panel p-4">
          <Text className="text-lg font-black text-white">When are you arriving?</Text>
          <Text className="mt-1 text-sm leading-5 text-slate-400">
            QueueCast predicts line waits using doors time, show time, venue bottlenecks, and your arrival.
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {arrivalOptions.map((option) => {
              const selected = arrivalOffset === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setArrivalOffset(option.value)}
                  className={`rounded-full border px-4 py-2 ${selected ? "border-primary bg-primary" : "border-white/10 bg-panel-soft"}`}
                >
                  <Text className={`text-xs font-black uppercase tracking-wider ${selected ? "text-white" : "text-slate-300"}`}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {entryPrediction ? (
            <View className="mt-4 rounded-2xl bg-white/5 p-4">
              <Text className="text-sm leading-6 text-slate-300">
                Entry is <Text className="font-black text-white">{entryPrediction.currentWaitMinutes} minutes</Text> now, but based on doors
                time, venue bottleneck, and arrival time, it will likely be{" "}
                <Text className="font-black text-primary-soft">{entryPrediction.predictedWaitMinutes} minutes</Text> when you get there.
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-black text-white">Line estimates</Text>
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Trust weighted</Text>
        </View>
        {linesQuery.isLoading ? (
          <LoadingSkeleton count={2} />
        ) : hasLines ? (
          concert.lines.map((line) => (
            <LineEstimateCard
              key={line.id}
              line={line}
              prediction={predictionByLineId[line.id]}
              onReport={() => router.push(`/report/${line.id}`)}
            />
          ))
        ) : (
          <EmptyState
            title="No lines found for this event yet"
            body="Line data may still be loading or has not been seeded."
          />
        )}

        {historicalInsight ? (
          <View className="mt-5 rounded-2xl border border-white/10 bg-panel p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text className="text-lg font-black text-white">Historical Insights</Text>
                <Text className="mt-2 text-sm leading-6 text-slate-400">{historicalInsight.statement}</Text>
              </View>
              <View
                className={`rounded-full px-3 py-1.5 ${
                  historicalInsight.trend === "higher"
                    ? "bg-red-500/20"
                    : historicalInsight.trend === "lighter"
                      ? "bg-emerald-500/20"
                      : "bg-yellow-400/20"
                }`}
              >
                <Text
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    historicalInsight.trend === "higher"
                      ? "text-red-200"
                      : historicalInsight.trend === "lighter"
                        ? "text-emerald-300"
                        : "text-yellow-200"
                  }`}
                >
                  {historicalInsight.trendLabel}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row gap-3">
              <View className="flex-1 rounded-xl bg-white/5 p-3">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Average entry wait</Text>
                <Text className="mt-1 text-2xl font-black text-white">{historicalInsight.averageEntryWait}m</Text>
              </View>
              <View className="flex-1 rounded-xl bg-white/5 p-3">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Peak entry wait</Text>
                <Text className="mt-1 text-2xl font-black text-white">{historicalInsight.peakEntryWait}m</Text>
              </View>
            </View>

            <View className="mt-4 rounded-2xl bg-white/5 p-4">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Based on</Text>
              <Text className="mt-2 text-sm font-bold text-slate-200">
                {historicalInsight.eventCount} past concerts · {historicalInsight.similarArtistCount} similar artists
              </Text>
            </View>

            <WaitTrendChart events={historicalInsight.chartEvents} />
          </View>
        ) : null}
      </ScrollView>

      {primaryLine ? (
        <View className="absolute bottom-5 left-5 right-5">
          <Pressable
            onPress={() => router.push(`/report/${primaryLine.id}`)}
            className="rounded-2xl bg-primary py-5 shadow-lg active:opacity-90"
            style={{ shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }}
          >
            <Text className="text-center text-base font-black uppercase tracking-wider text-white">Report a Line</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
