import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { EmptyState } from "../../components/EmptyState";
import { OptionPill } from "../../components/OptionPill";
import { Screen } from "../../components/Screen";
import { colors, lineWaitOptions } from "../../constants/theme";
import { useQueueStore } from "../../store/useQueueStore";
import { CrowdLevel } from "../../types/queue";

const crowdLevels: CrowdLevel[] = ["Light", "Steady", "Packed"];

export default function ReportScreen() {
  const { lineId } = useLocalSearchParams<{ lineId: string }>();
  const queryClient = useQueryClient();
  const concerts = useQueueStore((state) => state.concerts);
  const submitReport = useQueueStore((state) => state.submitReport);
  const lineContext = useMemo(() => {
    const concert = concerts.find((item) => item.lines.some((line) => line.id === lineId));
    return {
      concert,
      line: concert?.lines.find((line) => line.id === lineId),
    };
  }, [concerts, lineId]);
  const [waitMinutes, setWaitMinutes] = useState(lineContext.line?.waitMinutes ?? 15);
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>(lineContext.line?.crowdLevel ?? "Steady");
  const [inLine, setInLine] = useState(true);

  if (!lineContext.line || !lineContext.concert) {
    return (
      <Screen>
        <EmptyState title="Line unavailable" body="This line is not in the current mock schedule." />
      </Screen>
    );
  }

  const { concert, line } = lineContext;

  const handleSubmit = () => {
    submitReport({ lineId: line.id, waitMinutes, crowdLevel, inLine });
    queryClient.invalidateQueries({ queryKey: ["concerts"] });
    queryClient.invalidateQueries({ queryKey: ["concert", concert.id] });
    router.back();
  };

  return (
    <Screen>
      <View className="pb-5 pt-3">
        <Text className="text-sm font-bold uppercase tracking-[3px] text-primary-soft">Report wait</Text>
        <Text className="mt-3 text-3xl font-black text-white">{line.type} line</Text>
        <Text className="mt-2 text-base text-slate-400">
          {concert.artist} at {concert.venue}
        </Text>
      </View>

      <View className="mb-6 rounded-2xl border border-white/10 bg-panel p-5">
        <Text className="mb-4 text-lg font-black text-white">How long is the wait?</Text>
        <View className="flex-row flex-wrap">
          {lineWaitOptions.map((option) => (
            <OptionPill
              key={option}
              label={`${option} min`}
              value={option}
              selected={waitMinutes === option}
              onSelect={setWaitMinutes}
            />
          ))}
        </View>
      </View>

      <View className="mb-6 rounded-2xl border border-white/10 bg-panel p-5">
        <Text className="mb-4 text-lg font-black text-white">Crowd level</Text>
        <View className="flex-row flex-wrap">
          {crowdLevels.map((level) => (
            <OptionPill key={level} label={level} value={level} selected={crowdLevel === level} onSelect={setCrowdLevel} />
          ))}
        </View>
      </View>

      <View className="mb-6 flex-row items-center justify-between rounded-2xl border border-white/10 bg-panel p-5">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-black text-white">Currently in line</Text>
          <Text className="mt-1 text-sm leading-5 text-slate-400">Reports from the line get a confidence boost.</Text>
        </View>
        <Switch
          value={inLine}
          onValueChange={setInLine}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={inLine ? colors.text : colors.muted}
        />
      </View>

      <Pressable onPress={handleSubmit} className="rounded-2xl bg-primary py-5 active:opacity-80">
        <Text className="text-center text-base font-black uppercase tracking-wider text-white">Submit report</Text>
      </Pressable>
    </Screen>
  );
}
