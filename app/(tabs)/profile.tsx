import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { Screen } from "../../components/Screen";
import { useQueueStore } from "../../store/useQueueStore";
import { ReporterLevel } from "../../types/queue";

const getReporterLevel = (reportsSubmitted: number): ReporterLevel => {
  if (reportsSubmitted >= 10) {
    return "Venue Expert";
  }

  if (reportsSubmitted >= 6) {
    return "Gold Reporter";
  }

  if (reportsSubmitted >= 3) {
    return "Silver Reporter";
  }

  if (reportsSubmitted >= 1) {
    return "Bronze Reporter";
  }

  return "Guest Reporter";
};

export default function ProfileScreen() {
  const reportsSubmitted = useQueueStore((state) => state.reportsSubmitted);
  const verifiedReportsSubmitted = useQueueStore((state) => state.verifiedReportsSubmitted);
  const reporterLevel = getReporterLevel(reportsSubmitted);
  const helpfulScore = reportsSubmitted ? Math.round((verifiedReportsSubmitted / reportsSubmitted) * 100) : 0;

  return (
    <Screen>
      <View className="pb-5 pt-3">
        <Text className="text-3xl font-black text-white">Profile</Text>
        <Text className="mt-2 text-base text-slate-400">Your concert line signal.</Text>
      </View>

      <View className="rounded-2xl border border-white/10 bg-panel p-5">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <Text className="text-2xl font-black text-white">QC</Text>
        </View>
        <Text className="mt-4 text-2xl font-black text-white">{reporterLevel}</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-400">
          Trust grows when your reports come from stronger statuses and mock venue verification.
        </Text>
      </View>

      <Pressable onPress={() => router.push("/operator")} className="mt-5 rounded-2xl border border-primary/30 bg-primary/15 p-5 active:opacity-80">
        <Text className="text-xl font-black text-white">Venue Operator Demo</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-300">
          See how QueueCast could help venues monitor line pressure, alerts, and staffing actions.
        </Text>
      </Pressable>

      {reportsSubmitted === 0 ? (
        <EmptyState
          title="Start as a Guest Reporter"
          body="Submit your first line report to unlock a reporter level, verified report count, and helpful score."
          actionLabel="Find a Dallas show"
          onAction={() => router.push("/search")}
        />
      ) : null}

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-white/10 bg-panel-soft p-4">
          <Text className="text-3xl font-black text-white">{reportsSubmitted}</Text>
          <Text className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">reports</Text>
        </View>
        <View className="flex-1 rounded-2xl border border-white/10 bg-panel-soft p-4">
          <Text className="text-3xl font-black text-white">{verifiedReportsSubmitted}</Text>
          <Text className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">verified</Text>
        </View>
      </View>

      <View className="mt-3 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-white/10 bg-panel-soft p-4">
          <Text className="text-3xl font-black text-white">{helpfulScore}%</Text>
          <Text className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">helpful score</Text>
        </View>
        <View className="flex-1 rounded-2xl border border-white/10 bg-panel-soft p-4">
          <Text className="text-xl font-black text-white">{reporterLevel.replace(" Reporter", "")}</Text>
          <Text className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">level</Text>
        </View>
      </View>
    </Screen>
  );
}
