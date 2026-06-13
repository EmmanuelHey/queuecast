import { useMemo } from "react";
import { Text, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { Screen } from "../../components/Screen";
import { useQueueStore } from "../../store/useQueueStore";

export default function ActivityScreen() {
  const reportsSubmitted = useQueueStore((state) => state.reportsSubmitted);
  const concerts = useQueueStore((state) => state.concerts);
  const recentLines = useMemo(
    () => concerts.flatMap((concert) => concert.lines.map((line) => ({ ...line, artist: concert.artist }))),
    [concerts],
  );

  return (
    <Screen>
      <View className="pb-5 pt-3">
        <Text className="text-3xl font-black text-white">Activity</Text>
        <Text className="mt-2 text-base text-slate-400">Recent crowd-sourced updates across QueueCast.</Text>
      </View>

      <View className="mb-5 rounded-2xl border border-primary/30 bg-primary/15 p-5">
        <Text className="text-4xl font-black text-white">{reportsSubmitted}</Text>
        <Text className="mt-1 text-sm font-bold uppercase tracking-wider text-primary-soft">reports submitted this session</Text>
      </View>

      {recentLines.length ? (
        recentLines.slice(0, 8).map((line) => (
          <View key={line.id} className="mb-3 rounded-2xl border border-white/10 bg-panel p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-black text-white">{line.artist}</Text>
                <Text className="mt-1 text-sm text-slate-400">
                  {line.type} line updated {line.lastUpdated}
                </Text>
              </View>
              <Text className="text-xl font-black text-primary-soft">{line.waitMinutes}m</Text>
            </View>
          </View>
        ))
      ) : (
        <EmptyState title="No activity yet" body="Submit a line report to start building the live feed." />
      )}
    </Screen>
  );
}
