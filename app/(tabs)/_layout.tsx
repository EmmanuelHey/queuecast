import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../constants/theme";

const tabIcon = (label: string, focused: boolean) => (
  <Text className={`text-lg font-black ${focused ? "text-primary-soft" : "text-slate-500"}`}>{label}</Text>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.panel,
          borderTopColor: colors.border,
          height: 84,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primarySoft,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ focused }) => tabIcon("Q", focused) }} />
      <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: ({ focused }) => tabIcon("S", focused) }} />
      <Tabs.Screen name="activity" options={{ title: "Activity", tabBarIcon: ({ focused }) => tabIcon("A", focused) }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ focused }) => tabIcon("P", focused) }} />
    </Tabs>
  );
}
