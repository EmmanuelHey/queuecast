import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

type AuthRequiredCardProps = {
  title?: string;
  body?: string;
};

export function AuthRequiredCard({
  title = "Sign in to report a line",
  body = "QueueCast keeps reports tied to trusted community accounts. Browsing events and live waits remains public.",
}: AuthRequiredCardProps) {
  return (
    <View className="mt-10 rounded-2xl border border-primary/30 bg-primary/15 p-6">
      <Text className="text-xs font-black uppercase tracking-[3px] text-primary-soft">Account required</Text>
      <Text className="mt-3 text-2xl font-black text-white">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-300">{body}</Text>
      <View className="mt-5 flex-row gap-3">
        <Pressable onPress={() => router.push("/auth/sign-in")} className="flex-1 rounded-xl bg-primary px-4 py-3.5 active:opacity-80">
          <Text className="text-center text-xs font-black uppercase tracking-wider text-white">Sign In</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/auth/sign-up")}
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 active:opacity-80"
        >
          <Text className="text-center text-xs font-black uppercase tracking-wider text-slate-200">Create Account</Text>
        </Pressable>
      </View>
    </View>
  );
}
