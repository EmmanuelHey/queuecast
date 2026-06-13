import { Pressable, Text, View } from "react-native";

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="mt-10 rounded-2xl border border-white/10 bg-panel p-6">
      <Text className="text-xl font-black text-white">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-400">{body}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="mt-5 self-start rounded-full bg-primary px-5 py-3 active:opacity-80">
          <Text className="text-xs font-black uppercase tracking-wider text-white">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
