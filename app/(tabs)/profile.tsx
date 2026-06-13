import { Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { useQueueStore } from "../../store/useQueueStore";

export default function ProfileScreen() {
  const reportsSubmitted = useQueueStore((state) => state.reportsSubmitted);

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
        <Text className="mt-4 text-2xl font-black text-white">Guest Reporter</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-400">
          QueueCast is running frontend-only with mock data. Your reports update local app state during this session.
        </Text>
      </View>

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 rounded-2xl border border-white/10 bg-panel-soft p-4">
          <Text className="text-3xl font-black text-white">{reportsSubmitted}</Text>
          <Text className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">reports</Text>
        </View>
        <View className="flex-1 rounded-2xl border border-white/10 bg-panel-soft p-4">
          <Text className="text-3xl font-black text-white">92%</Text>
          <Text className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">helpful score</Text>
        </View>
      </View>
    </Screen>
  );
}
