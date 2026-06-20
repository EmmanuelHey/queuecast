import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Screen } from "../../components/Screen";
import { useAuth } from "../../hooks/useAuth";

export default function SignUpScreen() {
  const { signUp, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    const result = await signUp(email.trim(), password);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setMessage("Check your email to confirm your QueueCast account, then sign in.");
      return;
    }

    router.replace("/(tabs)/profile");
  };

  return (
    <Screen>
      <View className="pb-6 pt-4">
        <Text className="text-sm font-bold uppercase tracking-[3px] text-primary-soft">Join QueueCast</Text>
        <Text className="mt-3 text-4xl font-black text-white">Create an account</Text>
        <Text className="mt-2 text-base leading-6 text-slate-400">Build reporter trust by sharing accurate line conditions.</Text>
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
          autoComplete="new-password"
          secureTextEntry
          placeholder="At least 6 characters"
          placeholderTextColor="#7C708C"
          className="mt-2 rounded-xl border border-white/10 bg-ink px-4 py-4 text-base text-white"
        />

        {error ? <Text className="mt-4 text-sm font-semibold text-red-300">{error}</Text> : null}
        {message ? <Text className="mt-4 text-sm font-semibold text-emerald-300">{message}</Text> : null}
        {!isConfigured ? <Text className="mt-4 text-sm text-yellow-200">Supabase environment variables are missing.</Text> : null}

        <Pressable
          onPress={handleSignUp}
          disabled={isSubmitting || !email.trim() || password.length < 6 || !isConfigured}
          className={`mt-6 rounded-xl py-4 ${
            isSubmitting || !email.trim() || password.length < 6 || !isConfigured ? "bg-primary/40" : "bg-primary"
          }`}
        >
          <Text className="text-center text-sm font-black uppercase tracking-wider text-white">
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.replace("/auth/sign-in")} className="mt-5 py-3">
        <Text className="text-center text-sm font-bold text-primary-soft">Already have an account? Sign in</Text>
      </Pressable>
    </Screen>
  );
}
