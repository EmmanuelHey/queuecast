import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { isSupabaseConfigured, supabase } from "../services/supabaseClient";
import { isUuid } from "../services/supabaseQueueService";

type UseLineReportsRealtimeOptions = {
  eventId: string | undefined;
  lineIds: string[];
  enabled?: boolean;
  onReportReceived?: () => void;
};

type LineReportInsertPayload = {
  line_id?: string;
};

export function useLineReportsRealtime({ eventId, lineIds, enabled = true, onReportReceived }: UseLineReportsRealtimeOptions) {
  const queryClient = useQueryClient();
  const lineIdKey = [...lineIds].sort().join("|");

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured || !supabase || !isUuid(eventId) || !lineIdKey) {
      return undefined;
    }

    const client = supabase;
    const eventLineIds = new Set(lineIdKey.split("|"));
    const channelName = `queuecast-event-lines-${eventId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = client
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "line_reports",
        },
        (payload) => {
          const report = payload.new as LineReportInsertPayload;

          if (!report.line_id || !eventLineIds.has(report.line_id)) {
            return;
          }

          queryClient.invalidateQueries({ queryKey: ["supabase", "event-lines", eventId] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "events"] });
          queryClient.invalidateQueries({ queryKey: ["supabase", "reports", report.line_id] });
          onReportReceived?.();
        },
      )
      .subscribe((status) => {
        if (process.env.NODE_ENV !== "production") {
          if (status === "SUBSCRIBED" || status === "CLOSED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.log(`[QueueCast] Realtime ${status}:`, { channelName, eventId });
          }
        }
      });

    return () => {
      client.removeChannel(channel);
    };
  }, [enabled, eventId, lineIdKey, onReportReceived, queryClient]);
}
