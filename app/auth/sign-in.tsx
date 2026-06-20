import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/Screen";
import { useAuth } from "../../hooks/useAuth";

export default function SignInScreen() {
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    const result = await signIn(email.trim(), password);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.replace("/(tabs)/profile");
  };

  return (
    <Screen>
      <View className="pb-6 pt-4">
        <Text className="text-sm font-bold uppercase tracking-[3px] text-primary-soft">QueueCast account</Text>
        <Text className="mt-3 text-4xl font-black text-white">Welcome back</Text>
        <Text className="mt-2 text-base leading-6 text-slate-400">Sign in to submit trusted venue line reports.</Text>
      </View>

      <View className="rounded-2xl border border-white/10 bg-panel p-5">
        <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor="#7C708C"
          className="mt-2 rounded-xl border border-white/10 bg-ink px-4 py-4 text-base text-white"
        />

        <Text className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoComplete="current-password"
          secureTextEntry
          placeholder="Your password"
          placeholderTextColor="#7C708C"
          className="mt-2 rounded-xl border border-white/10 bg-ink px-4 py-4 text-base text-white"
        />

        {error ? <Text className="mt-4 text-sm font-semibold text-red-300">{error}</Text> : null}
        {!isConfigured ? <Text className="mt-4 text-sm text-yellow-200">Supabase environment variables are missing.</Text> : null}

        <Pressable
          onPress={handleSignIn}
          disabled={isSubmitting || !email.trim() || !password || !isConfigured}
          className={`mt-6 rounded-xl py-4 ${isSubmitting || !email.trim() || !password || !isConfigured ? "bg-primary/40" : "bg-primary"}`}
        >
          <Text className="text-center text-sm font-black uppercase tracking-wider text-white">
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.replace("/auth/sign-up")} className="mt-5 py-3">
        <Text className="text-center text-sm font-bold text-primary-soft">New to QueueCast? Create an account</Text>
      </Pressable>
    </Screen>
  );
}
