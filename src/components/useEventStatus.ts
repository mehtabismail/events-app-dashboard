import { useState } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

export type EventStatus = "draft" | "pending" | "approved" | "rejected" | "suspended";

export function useEventStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateEventStatus(eventId: string, status: EventStatus) {
    setLoading(true);
    setError(null);

    // Use local API proxy for development, direct backend for production
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.update_event_status}/${eventId}/status`;

    console.log("Updating event status from:", apiUrl);
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Event ID:", eventId);
    console.log("New Status:", status);

    try {
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to update event status");
        setLoading(false);
        toast.error("Failed to update event status");
        return false;
      }

      setLoading(false);
      toast.success(`Event status updated to ${status}!`);
      return true;
    } catch {
      setError("Network error");
      setLoading(false);
      toast.error("Failed to update event status: Network error");
      return false;
    }
  }

  return { updateEventStatus, loading, error };
}
