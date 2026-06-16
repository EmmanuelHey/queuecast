import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { EventCard } from "../../components/EventCard";
import { LineEstimateCard } from "../../components/LineEstimateCard";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { Screen } from "../../components/Screen";
import { getEvents, getVenueById } from "../../services/supabaseQueueService";
import { isSupabaseConfigured } from "../../services/supabaseClient";
import { useQueueStore } from "../../store/useQueueStore";

const activeStatuses = ["Doors soon", "Live now"];

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const fallbackVenue = useQueueStore((state) => state.venues.find((item) => item.id === id));
  const fallbackConcerts = useQueueStore((state) => state.concerts);
  const venueQuery = useQuery({
    queryKey: ["supabase", "venue", id],
    queryFn: () => getVenueById(id),
    enabled: isSupabaseConfigured && Boolean(id),
  });
  const eventsQuery = useQuery({ queryKey: ["supabase", "events"], queryFn: getEvents, enabled: isSupabaseConfigured });
  const venue = venueQuery.data ?? fallbackVenue;
  const concerts = eventsQuery.data ?? fallbackConcerts;
  const isLoading = venueQuery.isLoading || eventsQuery.isLoading;

  if (!venue) {
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
          title="Venue not found"
          body="This venue is not part of the Dallas demo launch list yet."
          actionLabel="Back to Home"
          onAction={() => router.replace("/(tabs)")}
        />
      </Screen>
    );
  }

  const venueEvents = concerts.filter((concert) => concert.venueId === venue.id);
  const activeEvent = venueEvents.find((concert) => activeStatuses.includes(concert.status));

  return (
    <Screen>
      <View className="pb-5 pt-3">
        <Text className="text-sm font-bold uppercase tracking-[3px] text-primary-soft">Dallas venue</Text>
        <Text className="mt-3 text-4xl font-black leading-tight text-white">{venue.name}</Text>
        <Text className="mt-2 text-lg font-bold text-slate-300">{venue.city}</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-500">{venue.address}</Text>
      </View>

      <View className="mb-5 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-white/10 bg-panel p-4">
          <Text className="text-2xl font-black text-white">{venue.capacity.toLocaleString()}</Text>
          <Text className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">capacity</Text>
        </View>
        <View className="flex-1 rounded-2xl border border-white/10 bg-panel p-4">
          <Text className="text-2xl font-black text-white">{venue.entryPointsCount}</Text>
          <Text className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">entry points</Text>
        </View>
      </View>

      <View className="mb-5 rounded-2xl border border-white/10 bg-panel p-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Bottleneck severity</Text>
        <Text className="mt-1 text-2xl font-black capitalize text-white">{venue.bottleneckSeverity}</Text>
      </View>

      <Text className="mb-3 text-lg font-black text-white">Typical wait patterns</Text>
      <View className="mb-6 rounded-2xl border border-white/10 bg-panel p-4">
        {venue.typicalBottleneckNotes.map((note) => (
          <View key={note} className="mb-3 flex-row gap-3 last:mb-0">
            <View className="mt-2 h-2 w-2 rounded-full bg-primary" />
            <Text className="flex-1 text-sm leading-6 text-slate-300">{note}</Text>
          </View>
        ))}
      </View>

      {activeEvent ? (
        <>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-black text-white">Current active lines</Text>
            <Text className="text-xs font-bold uppercase tracking-wider text-primary-soft">{activeEvent.status}</Text>
          </View>
          {activeEvent.lines.map((line) => (
            <LineEstimateCard key={line.id} line={line} onReport={() => router.push(`/report/${line.id}`)} />
          ))}
        </>
      ) : null}

      <Text className="mb-3 mt-2 text-lg font-black text-white">Upcoming events</Text>
      {venueEvents.length ? (
        venueEvents.map((concert) => (
          <EventCard key={concert.id} concert={concert} onPress={() => router.push(`/event/${concert.id}`)} />
        ))
      ) : (
        <EmptyState title="No events yet" body="This venue does not have mock events scheduled in the Dallas launch data." />
      )}
    </Screen>
  );
}
