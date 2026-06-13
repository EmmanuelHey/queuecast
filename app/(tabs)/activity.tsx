import { useMemo } from "react";
import { router } from "expo-router";
import { Text, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { Screen } from "../../components/Screen";
import { getReporterStatusLabel, getVerificationLabel } from "../../data/mockConcerts";
import { useQueueStore } from "../../store/useQueueStore";

export default function ActivityScreen() {
  const reportsSubmitted = useQueueStore((state) => state.reportsSubmitted);
  const concerts = useQueueStore((state) => state.concerts);
  const recentReports = useMemo(
    () =>
      concerts
        .flatMap((concert) =>
          concert.lines.flatMap((line) =>
            line.reports.map((report) => ({
              ...report,
              artist: concert.artist,
              lineType: line.type,
            })),
          ),
        )
        .sort((a, b) => b.submittedAt - a.submittedAt)
        .slice(0, 12),
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

      {reportsSubmitted === 0 ? (
        <EmptyState
          title="No reports from you yet"
          body="Submit a quick line report during the demo to see your report appear here with trust and verification details."
          actionLabel="Find a show"
          onAction={() => router.push("/search")}
        />
      ) : recentReports.length ? (
        recentReports.map((report) => (
          <View key={report.id} className="mb-3 rounded-2xl border border-white/10 bg-panel p-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-base font-black text-white">{report.artist}</Text>
                <Text className="mt-1 text-sm text-slate-400">{report.lineType} line reported {report.submittedLabel}</Text>
              </View>
              <Text className="text-xl font-black text-primary-soft">{report.waitMinutes}m</Text>
            </View>
            <View className="mt-3 flex-row flex-wrap gap-2">
              <View className="rounded-full bg-white/10 px-3 py-1.5">
                <Text className="text-xs font-bold text-slate-200">{getReporterStatusLabel(report.reporterStatus)}</Text>
              </View>
              <View className="rounded-full bg-primary/20 px-3 py-1.5">
                <Text className="text-xs font-bold text-primary-soft">{getVerificationLabel(report.verificationStatus)}</Text>
              </View>
              <View className="rounded-full bg-white/10 px-3 py-1.5">
                <Text className="text-xs font-bold text-slate-300">{report.trustScore} trust</Text>
              </View>
            </View>
          </View>
        ))
      ) : (
        <EmptyState title="No activity yet" body="Submit a line report to start building the live feed." />
      )}
    </Screen>
  );
}
