import { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  className?: string;
}>;

export function Screen({ children, scroll = true, className = "" }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView className={`flex-1 bg-ink ${className}`}>
        <View className="flex-1 px-5">{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 bg-ink ${className}`}>
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
