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
  const lineIdKey = lineIds.join("|");

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured || !supabase || !isUuid(eventId) || !lineIds.length) {
      return undefined;
    }

    const client = supabase;
    const eventLineIds = new Set(lineIds);
    const channel = client
      .channel(`queuecast-event-lines-${eventId}`)
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
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [enabled, eventId, lineIdKey, lineIds, onReportReceived, queryClient]);
}
