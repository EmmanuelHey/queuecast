import "../global.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "nativewind";
import { useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { colors } from "../constants/theme";

const nativeWindStyleSheet = StyleSheet as typeof StyleSheet & {
  setFlag: (name: "darkMode", value: "class") => void;
};

nativeWindStyleSheet.setFlag("darkMode", "class");

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.ink }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.ink },
            headerTintColor: colors.text,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.ink },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="event/[id]" options={{ title: "Event" }} />
          <Stack.Screen name="report/[lineId]" options={{ title: "Report a line" }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
