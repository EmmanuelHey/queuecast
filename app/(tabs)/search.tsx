import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { EventCard } from "../../components/EventCard";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { Screen } from "../../components/Screen";
import { getEvents } from "../../services/supabaseQueueService";
import { isSupabaseConfigured } from "../../services/supabaseClient";
import { useQueueStore } from "../../store/useQueueStore";

const quickFilters = [
  { label: "Dallas", value: "dallas" },
  { label: "Irving", value: "irving" },
  { label: "Deep Ellum", value: "deep ellum" },
  { label: "AAC", value: "american airlines center" },
  { label: "Dos Equis", value: "dos equis" },
  { label: "Tonight", value: "tonight" },
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const fallbackConcerts = useQueueStore((state) => state.concerts);
  const eventsQuery = useQuery({ queryKey: ["supabase", "events"], queryFn: getEvents, enabled: isSupabaseConfigured });
  const concerts = eventsQuery.data ?? fallbackConcerts;
  const isLoading = eventsQuery.isLoading;
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return concerts;
    }

    return concerts.filter((concert) =>
      [concert.artist, concert.venue, concert.city, concert.status].some((field) => field.toLowerCase().includes(normalized)),
    );
  }, [concerts, query]);

  return (
    <Screen>
      <View className="pb-5 pt-3">
        <Text className="text-3xl font-black text-white">Search</Text>
        <Text className="mt-2 text-base text-slate-400">Find a Dallas artist, venue, city, or tonight's shows.</Text>
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search artist, venue, or city"
        placeholderTextColor="#7C708C"
        className="mb-4 rounded-2xl border border-white/10 bg-panel px-4 py-4 text-base font-semibold text-white"
      />
      <View className="mb-5 flex-row flex-wrap gap-2">
        {quickFilters.map((filter) => {
          const selected = query.toLowerCase() === filter.value;

          return (
            <Pressable
              key={filter.value}
              onPress={() => setQuery(selected ? "" : filter.value)}
              className={`rounded-full border px-4 py-2 ${selected ? "border-primary bg-primary" : "border-white/10 bg-panel-soft"}`}
            >
              <Text className={`text-xs font-black uppercase tracking-wider ${selected ? "text-white" : "text-slate-300"}`}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {isLoading ? (
        <LoadingSkeleton />
      ) : results.length ? (
        results.map((concert) => (
          <EventCard key={concert.id} concert={concert} onPress={() => router.push(`/event/${concert.id}`)} />
        ))
      ) : (
        <EmptyState
          title="No Dallas shows found"
          body="Try Dallas, Irving, Deep Ellum, AAC, Dos Equis, or Tonight from the launch schedule."
          actionLabel="Clear search"
          onAction={() => setQuery("")}
        />
      )}
    </Screen>
  );
}
