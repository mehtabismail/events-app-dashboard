import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { Event } from "./useEvents";

export function useSingleEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("useSingleEvent called with eventId:", eventId);

  async function fetchEvent() {
    if (!eventId) return;

    setLoading(true);
    setError(null);

    // Use local API proxy for development, direct backend for production
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.single_event}/${eventId}`;

    console.log("Fetching single event from:", apiUrl);

    try {
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to fetch event");
        setLoading(false);
        toast.error("Failed to fetch event");
        return false;
      }

      const data = await res.json();
      console.log("Single event data:", data);
      setEvent(data.event || data); // Handle different response structures
      setLoading(false);
      return true;
    } catch (err) {
      setError("Network error");
      setLoading(false);
      toast.error("Failed to fetch event: Network error");
      return false;
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]); // Add eventId as dependency

  return { event, loading, error, refetch: fetchEvent };
}
