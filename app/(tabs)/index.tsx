import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { EventCard } from "../../components/EventCard";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { Screen } from "../../components/Screen";
import { VenueCard } from "../../components/VenueCard";
import { getEvents, getVenues } from "../../services/supabaseQueueService";
import { isSupabaseConfigured } from "../../services/supabaseClient";
import { useQueueStore } from "../../store/useQueueStore";

export default function HomeScreen() {
  const fallbackConcerts = useQueueStore((state) => state.concerts);
  const fallbackVenues = useQueueStore((state) => state.venues);
  const eventsQuery = useQuery({ queryKey: ["supabase", "events"], queryFn: getEvents, enabled: isSupabaseConfigured });
  const venuesQuery = useQuery({ queryKey: ["supabase", "venues"], queryFn: getVenues, enabled: isSupabaseConfigured });
  const concerts = eventsQuery.data ?? fallbackConcerts;
  const venues = venuesQuery.data ?? fallbackVenues;
  const isLoading = eventsQuery.isLoading || venuesQuery.isLoading;
  const highlightedEvent = concerts.find((concert) => concert.status === "Live now") ?? concerts.find((concert) => concert.status === "Doors soon") ?? concerts[0];
  const averageEntryWait = concerts.length
    ? Math.round(concerts.reduce((sum, concert) => sum + (concert.lines[0]?.waitMinutes ?? 0), 0) / concerts.length)
    : 0;

  return (
    <Screen>
      <View className="pb-5 pt-3">
        <Text className="text-sm font-bold uppercase tracking-[3px] text-primary-soft">QueueCast</Text>
        <Text className="mt-3 text-4xl font-black leading-tight text-white">Dallas concert lines, live</Text>
        <Text className="mt-3 text-base leading-6 text-slate-400">
          Check Dallas-area entry, merch, parking, food, and bathroom waits before the opener starts.
        </Text>
      </View>

      <View className="mb-5 rounded-2xl border border-primary/30 bg-primary/15 p-5">
        <Text className="text-2xl font-black text-white">Going to a show tonight?</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-300">
          Check entry, merch, parking, food, and bathroom waits before you arrive.
        </Text>
        <Pressable onPress={() => router.push("/search")} className="mt-5 self-start rounded-full bg-primary px-5 py-3 active:opacity-80">
          <Text className="text-xs font-black uppercase tracking-wider text-white">Find Dallas shows</Text>
        </Pressable>
      </View>

      <View className="mb-4 flex-row rounded-2xl border border-white/10 bg-panel p-4">
        <View className="flex-1">
          <Text className="text-2xl font-black text-white">{concerts.length}</Text>
          <Text className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">tracked events</Text>
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-black text-white">{averageEntryWait}</Text>
          <Text className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">avg entry min</Text>
        </View>
      </View>

      {highlightedEvent ? (
        <>
          <Text className="mb-3 text-lg font-black text-white">Tonight in Dallas</Text>
          <EventCard concert={highlightedEvent} onPress={() => router.push(`/event/${highlightedEvent.id}`)} />
        </>
      ) : null}

      <Text className="mb-3 text-lg font-black text-white">Nearby Dallas Venues</Text>
      {isLoading ? <LoadingSkeleton count={2} /> : venues.map((venue) => (
        <VenueCard
          key={venue.id}
          venue={venue}
          eventCount={concerts.filter((concert) => concert.venueId === venue.id).length}
          onPress={() => router.push(`/venue/${venue.id}`)}
        />
      ))}

      <Text className="mb-3 mt-3 text-lg font-black text-white">{isLoading ? "Tuning in..." : "Dallas launch events"}</Text>
      {isLoading ? <LoadingSkeleton /> : concerts.map((concert) => (
        <EventCard key={concert.id} concert={concert} onPress={() => router.push(`/event/${concert.id}`)} />
      ))}
    </Screen>
  );
}
