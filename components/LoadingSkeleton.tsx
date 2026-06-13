import { View } from "react-native";

type LoadingSkeletonProps = {
  count?: number;
};

export function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} className="mb-4 rounded-2xl border border-white/10 bg-panel p-5">
          <View className="h-3 w-24 rounded-full bg-white/10" />
          <View className="mt-4 h-6 w-3/4 rounded-full bg-white/10" />
          <View className="mt-3 h-4 w-1/2 rounded-full bg-white/10" />
        </View>
      ))}
    </View>
  );
}
