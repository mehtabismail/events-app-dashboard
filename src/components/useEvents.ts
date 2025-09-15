import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";

export interface EventImage {
  url: string;
  public_id: string;
  format: string;
  size: number;
  width: number;
  height: number;
  _id: string;
}

export interface EventVideo {
  url: string;
  public_id: string;
  format: string;
  size: number;
  duration: number;
  resource_type: string;
  _id: string;
}

export interface EventLocation {
  coordinates: number[];
  address: string;
  placeId: string;
  type: string;
}

export interface EventUser {
  _id: string;
  email: string;
}

export interface Event {
  _id: string;
  name: string;
  description: string;
  dateTime: string;
  ticket_price: number;
  category: string;
  status: string;
  userId: EventUser;
  images: EventImage[];
  videos: EventVideo[];
  location: EventLocation;
  ticketLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventsResponse {
  message: string;
  events: Event[];
  pagination: unknown;
  filters: unknown;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}${API_ENDPOINTS.all_events}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (!res.ok) {
        setError("Failed to fetch events");
        setLoading(false);
        toast.error("Failed to fetch events");
        return false;
      }

      const data: EventsResponse = await res.json();
      setEvents(data.events);
      setLoading(false);
      toast.success("Events fetched successfully!");
      return true;
    } catch {
      setError("Network error");
      setLoading(false);
      toast.error("Failed to fetch events: Network error");
      return false;
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetch: fetchEvents };
}
