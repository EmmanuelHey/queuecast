import { Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  body: string;
};

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View className="mt-10 rounded-2xl border border-white/10 bg-panel p-6">
      <Text className="text-xl font-black text-white">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-400">{body}</Text>
    </View>
  );
}
