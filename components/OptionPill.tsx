import { Pressable, Text } from "react-native";

type OptionPillProps<T extends string | number> = {
  label: string;
  value: T;
  selected: boolean;
  onSelect: (value: T) => void;
};

export function OptionPill<T extends string | number>({ label, value, selected, onSelect }: OptionPillProps<T>) {
  return (
    <Pressable
      onPress={() => onSelect(value)}
      className={`mb-3 mr-3 rounded-full border px-4 py-3 active:opacity-80 ${
        selected ? "border-primary bg-primary" : "border-white/10 bg-panel-soft"
      }`}
    >
      <Text className={`font-extrabold ${selected ? "text-white" : "text-slate-300"}`}>{label}</Text>
    </Pressable>
  );
}
