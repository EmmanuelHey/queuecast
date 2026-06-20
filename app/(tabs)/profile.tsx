import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { Screen } from "../../components/Screen";
import { useAuth } from "../../hooks/useAuth";
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
  const { user, isLoading, signOut } = useAuth();
  const reportsSubmitted = useQueueStore((state) => state.reportsSubmitted);
  const verifiedReportsSubmitted = useQueueStore((state) => state.verifiedReportsSubmitted);
  const reporterLevel = getReporterLevel(reportsSubmitted);
  const helpfulScore = reportsSubmitted ? Math.round((verifiedReportsSubmitted / reportsSubmitted) * 100) : 0;

  if (isLoading) {
    return (
      <Screen>
        <View className="pb-5 pt-3">
          <Text className="text-3xl font-black text-white">Profile</Text>
        </View>
        <LoadingSkeleton count={2} />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <View className="pb-5 pt-3">
          <Text className="text-3xl font-black text-white">Profile</Text>
          <Text className="mt-2 text-base text-slate-400">Sign in to build your QueueCast reporter reputation.</Text>
        </View>

        <View className="rounded-2xl border border-white/10 bg-panel p-6">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary/30">
            <Text className="text-2xl font-black text-primary-soft">QC</Text>
          </View>
          <Text className="mt-4 text-2xl font-black text-white">Your reporter profile starts here</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-400">
            Browsing concerts stays public. An account is only required when you contribute a line report.
          </Text>
          <Pressable onPress={() => router.push("/auth/sign-in")} className="mt-6 rounded-xl bg-primary py-4 active:opacity-80">
            <Text className="text-center text-sm font-black uppercase tracking-wider text-white">Sign In</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/auth/sign-up")}
            className="mt-3 rounded-xl border border-white/15 bg-white/5 py-4 active:opacity-80"
          >
            <Text className="text-center text-sm font-black uppercase tracking-wider text-slate-200">Create Account</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push("/operator")} className="mt-5 rounded-2xl border border-primary/30 bg-primary/15 p-5 active:opacity-80">
          <Text className="text-xl font-black text-white">Venue Operator Demo</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-300">Preview QueueCast crowd-flow operations without signing in.</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="pb-5 pt-3">
        <Text className="text-3xl font-black text-white">Profile</Text>
        <Text className="mt-2 text-base text-slate-400">Your concert line signal.</Text>
      </View>

      <View className="rounded-2xl border border-white/10 bg-panel p-5">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <Text className="text-2xl font-black uppercase text-white">{user.email?.slice(0, 2) ?? "QC"}</Text>
        </View>
        <Text className="mt-4 text-2xl font-black text-white">{reporterLevel}</Text>
        <Text className="mt-1 text-sm font-semibold text-primary-soft">{user.email}</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-400">
          Trust grows when your reports come from stronger statuses and venue verification.
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
          title="No reports yet"
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

      <Pressable
        onPress={async () => {
          await signOut();
        }}
        className="mt-6 rounded-xl border border-white/15 bg-white/5 py-4 active:opacity-80"
      >
        <Text className="text-center text-sm font-black uppercase tracking-wider text-slate-300">Sign Out</Text>
      </Pressable>
    </Screen>
  );
}
