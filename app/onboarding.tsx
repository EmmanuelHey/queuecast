import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Screen } from "../components/Screen";

const slides = [
  {
    title: "See live venue lines",
    body: "Track entry, merch, parking, food, and bathroom waits at Dallas concert venues before you leave.",
  },
  {
    title: "Report what you see",
    body: "Share quick line reports with reporter status and mock venue verification so better reports carry more weight.",
  },
  {
    title: "Predict waits before you arrive",
    body: "Compare current waits with arrival-based predictions using doors time, show time, and venue bottlenecks.",
  },
];

export default function OnboardingScreen() {
  return (
    <Screen>
      <View className="pb-6 pt-4">
        <Text className="text-sm font-bold uppercase tracking-[3px] text-primary-soft">Welcome to QueueCast</Text>
        <Text className="mt-3 text-4xl font-black leading-tight text-white">Know the line before you get there</Text>
      </View>

      {slides.map((slide, index) => (
        <View key={slide.title} className="mb-4 rounded-2xl border border-white/10 bg-panel p-5">
          <View className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Text className="font-black text-white">{index + 1}</Text>
          </View>
          <Text className="text-xl font-black text-white">{slide.title}</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-400">{slide.body}</Text>
        </View>
      ))}

      <Pressable onPress={() => router.replace("/(tabs)")} className="mt-2 rounded-2xl bg-primary py-5 active:opacity-80">
        <Text className="text-center text-base font-black uppercase tracking-wider text-white">Get Started</Text>
      </Pressable>
    </Screen>
  );
}
