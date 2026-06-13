import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { EventCard } from "../../components/EventCard";
import { Screen } from "../../components/Screen";
import { useQueueStore } from "../../store/useQueueStore";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const concerts = useQueueStore((state) => state.concerts);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return concerts;
    }

    return concerts.filter((concert) =>
      [concert.artist, concert.venue, concert.city].some((field) => field.toLowerCase().includes(normalized)),
    );
  }, [concerts, query]);

  return (
    <Screen>
      <View className="pb-5 pt-3">
        <Text className="text-3xl font-black text-white">Search</Text>
        <Text className="mt-2 text-base text-slate-400">Find an artist, venue, or city.</Text>
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search concerts"
        placeholderTextColor="#7C708C"
        className="mb-5 rounded-2xl border border-white/10 bg-panel px-4 py-4 text-base font-semibold text-white"
      />
      {results.length ? (
        results.map((concert) => (
          <EventCard key={concert.id} concert={concert} onPress={() => router.push(`/event/${concert.id}`)} />
        ))
      ) : (
        <EmptyState title="No shows found" body="Try another artist, venue, or city from the current mock schedule." />
      )}
    </Screen>
  );
}
