import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AuthRequiredCard } from "../../components/AuthRequiredCard";
import { EmptyState } from "../../components/EmptyState";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { OptionPill } from "../../components/OptionPill";
import { Screen } from "../../components/Screen";
import { lineWaitOptions } from "../../constants/theme";
import { getReporterStatusLabel, getTrustScore, getVerificationLabel, getVerificationStatus } from "../../data/mockConcerts";
import { useAuth } from "../../hooks/useAuth";
import { verifyNearVenue } from "../../services/locationService";
import { useQueueStore } from "../../store/useQueueStore";
import { CrowdLevel, LocationPermissionStatus, LocationVerificationState, ReporterStatus } from "../../types/queue";

const crowdLevels: CrowdLevel[] = ["Light", "Steady", "Packed"];
const reporterStatuses: ReporterStatus[] = ["in_line", "on_the_way", "inside", "just_checking"];

export default function ReportScreen() {
  const { lineId } = useLocalSearchParams<{ lineId: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const concerts = useQueueStore((state) => state.concerts);
  const venues = useQueueStore((state) => state.venues);
  const submitReport = useQueueStore((state) => state.submitReport);
  const isNearVenue = useQueueStore((state) => state.isNearVenue);
  const lineContext = useMemo(() => {
    const concert = concerts.find((item) => item.lines.some((line) => line.id === lineId));
    return {
      concert,
      line: concert?.lines.find((line) => line.id === lineId),
    };
  }, [concerts, lineId]);
  const [waitMinutes, setWaitMinutes] = useState(lineContext.line?.waitMinutes ?? 15);
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>(lineContext.line?.crowdLevel ?? "Steady");
  const [reporterStatus, setReporterStatus] = useState<ReporterStatus>("in_line");
  const [submittedSummary, setSubmittedSummary] = useState<{ trustScore: number; waitMinutes: number } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>("not_requested");
  const [locationVerification, setLocationVerification] = useState<LocationVerificationState>("idle");
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const venue = venues.find((item) => item.id === lineContext.concert?.venueId);
  const isRealLocationVerified = locationVerification === "verified_near_venue";
  const effectiveIsNearVenue = isRealLocationVerified || (locationVerification === "idle" && isNearVenue);
  const verificationStatus = getVerificationStatus(reporterStatus, effectiveIsNearVenue);
  const trustScore = getTrustScore(reporterStatus, effectiveIsNearVenue, Date.now(), Date.now(), isRealLocationVerified);

  if (isAuthLoading) {
    return (
      <Screen>
        <LoadingSkeleton count={2} />
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <AuthRequiredCard />
      </Screen>
    );
  }

  if (!lineContext.line || !lineContext.concert || !venue) {
    return (
      <Screen>
        <EmptyState title="Line unavailable" body="This line is not in the current mock schedule." />
      </Screen>
    );
  }

  const { concert, line } = lineContext;

  const handleSubmit = () => {
    submitReport({ lineId: line.id, waitMinutes, crowdLevel, reporterStatus, isNearVenue: effectiveIsNearVenue, isRealLocationVerified });
    queryClient.invalidateQueries({ queryKey: ["concerts"] });
    queryClient.invalidateQueries({ queryKey: ["concert", concert.id] });
    setSubmittedSummary({ trustScore, waitMinutes });
  };

  const handleVerifyLocation = async () => {
    const result = await verifyNearVenue(venue);
    setPermissionStatus(result.permissionStatus);
    setLocationVerification(result.verificationState);
    setDistanceMeters(result.distanceMeters);
  };

  const locationMessage =
    locationVerification === "verified_near_venue"
      ? "Verified near venue"
      : locationVerification === "too_far"
        ? "Too far from venue"
        : locationVerification === "denied"
          ? "Location denied"
          : locationVerification === "unavailable"
            ? "Location unavailable"
            : "Not requested";

  if (submittedSummary) {
    const updatedConcert = concerts.find((item) => item.id === concert.id);
    const updatedLine = updatedConcert?.lines.find((item) => item.id === line.id);

    return (
      <Screen>
        <View className="mt-10 rounded-2xl border border-primary/30 bg-primary/15 p-6">
          <Text className="text-sm font-bold uppercase tracking-[3px] text-primary-soft">Report submitted</Text>
          <Text className="mt-3 text-3xl font-black text-white">Thanks for helping the line move smarter.</Text>
          <Text className="mt-3 text-sm leading-6 text-slate-300">
            Your {getReporterStatusLabel(reporterStatus).toLowerCase()} report added {submittedSummary.trustScore} trust points.
          </Text>
        </View>

        <View className="mt-5 rounded-2xl border border-white/10 bg-panel p-5">
          <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">Updated estimate</Text>
          <Text className="mt-2 text-4xl font-black text-white">{updatedLine?.waitMinutes ?? submittedSummary.waitMinutes} min</Text>
          <Text className="mt-2 text-sm text-slate-400">
            {updatedLine?.type ?? line.type} line at {concert.venue}
          </Text>
        </View>

        <Pressable onPress={() => router.replace(`/event/${concert.id}`)} className="mt-6 rounded-2xl bg-primary py-5 active:opacity-80">
          <Text className="text-center text-base font-black uppercase tracking-wider text-white">Back to event</Text>
        </Pressable>
      </Screen>
    );
  }

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
        <Text className="text-lg font-black text-white">Verify your location</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-400">
          Verify you're near the venue to make your report count more. Web and unavailable GPS use a safe mock fallback for now.
        </Text>
        <View className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-black text-white">{locationMessage}</Text>
              <Text className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                Permission: {permissionStatus.replace("_", " ")}
              </Text>
              {distanceMeters !== null ? <Text className="mt-1 text-xs text-slate-400">{distanceMeters}m from venue</Text> : null}
            </View>
            <Pressable onPress={handleVerifyLocation} className="rounded-full bg-primary px-4 py-2 active:opacity-80">
              <Text className="text-xs font-black uppercase tracking-wider text-white">Verify my location</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="mb-6 rounded-2xl border border-white/10 bg-panel p-5">
        <Text className="mb-4 text-lg font-black text-white">Reporter status</Text>
        <View className="flex-row flex-wrap">
          {reporterStatuses.map((status) => (
            <OptionPill
              key={status}
              label={getReporterStatusLabel(status)}
              value={status}
              selected={reporterStatus === status}
              onSelect={setReporterStatus}
            />
          ))}
        </View>

        <View className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-black text-white">Mock location check</Text>
            <Text className="text-xs font-black uppercase tracking-wider text-primary-soft">{trustScore} trust pts</Text>
          </View>
          <Text className="mt-2 text-sm leading-5 text-slate-400">
            {getVerificationLabel(verificationStatus)}. Real GPS is gated safely and falls back to mock verification when unavailable.
          </Text>
        </View>
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

      <Pressable onPress={handleSubmit} className="rounded-2xl bg-primary py-5 active:opacity-80">
        <Text className="text-center text-base font-black uppercase tracking-wider text-white">Submit report</Text>
      </Pressable>
    </Screen>
  );
}
