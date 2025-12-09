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

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Filters {
  status?: string;
  search?: string | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface EventsResponse {
  message: string;
  events: Event[];
  pagination: Pagination;
  filters: Filters;
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useEvents(initialParams?: GetEventsParams) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);

  async function fetchEvents(params?: GetEventsParams) {
    setLoading(true);
    setError(null);

    // Build query string
    const queryParams = new URLSearchParams();
    const finalParams = params || initialParams || {};

    if (finalParams.page)
      queryParams.append("page", finalParams.page.toString());
    if (finalParams.limit)
      queryParams.append("limit", finalParams.limit.toString());
    // Only add status if it's not "all" - some APIs don't accept "all" as a status
    if (finalParams.status && finalParams.status !== "all") {
      queryParams.append("status", finalParams.status);
    }
    if (finalParams.search) queryParams.append("search", finalParams.search);
    if (finalParams.sortBy) queryParams.append("sortBy", finalParams.sortBy);
    if (finalParams.sortOrder)
      queryParams.append("sortOrder", finalParams.sortOrder);

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${
      API_ENDPOINTS.all_events
    }?${queryParams.toString()}`;

    console.log("Fetching events from:", apiUrl);

    try {
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to fetch events";
        setError(errorMessage);
        setLoading(false);
        toast.error(errorMessage);
        return false;
      }

      const data = await res.json();
      console.log("Events data:", data);
      console.log("Events data structure:", {
        hasEvents: !!data.events,
        hasData: !!data.data,
        hasPagination: !!data.pagination,
        eventsLength: data.events?.length,
        dataEventsLength: data.data?.events?.length,
      });

      // Handle different response structures
      const eventsList = data.events || data.data?.events || [];
      setEvents(eventsList);

      // Handle pagination - might not exist or be structured differently
      let paginationData = null;
      if (data.pagination) {
        paginationData = data.pagination;
      } else if (data.data?.pagination) {
        paginationData = data.data.pagination;
      }

      if (paginationData) {
        console.log("Setting pagination:", paginationData);
        setPagination(paginationData);
      } else {
        // Create default pagination if not provided
        const defaultPagination = {
          currentPage: finalParams.page || 1,
          totalPages: 1,
          totalEvents: eventsList.length,
          limit: finalParams.limit || 12,
          hasNextPage: false,
          hasPrevPage: false,
        };
        console.log("Creating default pagination:", defaultPagination);
        setPagination(defaultPagination);
      }

      setFilters(data.filters || data.data?.filters || {});
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Fetch events error:", err);
      setError("Network error");
      setLoading(false);
      toast.error("Failed to fetch events: Network error");
      return false;
    }
  }

  useEffect(() => {
    if (initialParams) {
      fetchEvents(initialParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    events,
    loading,
    error,
    pagination,
    filters,
    refetch: fetchEvents,
    setEvents,
  };
}
