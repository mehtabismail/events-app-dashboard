// Reports Types - Admin Dashboard

// Common Types
export type Period = "week" | "month" | "year" | "all";
export type SortOrder = "asc" | "desc";

// Pagination
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  totalTransactions?: number;
  totalEvents?: number;
  totalUsers?: number;
  totalEventPlanners?: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Dashboard Overview Types
export interface StatWithGrowth {
  total: number;
  inPeriod: number;
  growth: number;
}

export interface EventsStats extends StatWithGrowth {
  byStatus: {
    draft: number;
    pending: number;
    approved: number;
    suspended: number;
    rejected: number;
  };
}

export interface PlanBreakdown {
  plan: "weekly" | "monthly";
  revenueCents: number;
  revenueFormatted: string;
  count: number;
}

export interface RevenueStats {
  totalCents: number;
  totalFormatted: string;
  growth: number;
  activeSubscriptions: number;
  totalSubscriptions: number;
  byPlan: PlanBreakdown[];
}

export interface EngagementStats {
  totalViews: number;
  totalUniqueViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalRsvps: number;
  totalTicketRedirects: number;
}

export interface DashboardOverview {
  period: Period;
  dateRange: {
    start: string;
    end: string;
  };
  users: StatWithGrowth;
  eventPlanners: StatWithGrowth;
  events: EventsStats;
  revenue: RevenueStats;
  engagement: EngagementStats;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardOverview;
}

// Payments Report Types
export interface EventPlannerInfo {
  id: string;
  name: string;
  email: string;
  company: string | null;
  photo: string | null;
}

export interface EventInfo {
  id: string;
  name: string;
  dateTime: string;
  status: string;
  category: string;
}

export interface Transaction {
  id: string;
  stripeSubscriptionId: string;
  eventPlanner: EventPlannerInfo | null;
  event: EventInfo | null;
  plan: "weekly" | "monthly";
  amount: number;
  amountFormatted: string;
  status: "active" | "canceled" | "past_due" | "unpaid";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentsSummary {
  totalRevenue: number;
  totalRevenueFormatted: string;
  totalTransactions: number;
  byStatus: Array<{
    status: string;
    count: number;
    revenue: number;
    revenueFormatted: string;
  }>;
  byPlan: Array<{
    plan: string;
    count: number;
    revenue: number;
    revenueFormatted: string;
  }>;
}

export interface PaymentsFilters {
  startDate: string | null;
  endDate: string | null;
  status: string | null;
  plan: string | null;
  eventPlannerId: string | null;
  search: string | null;
  sortBy: string;
  sortOrder: SortOrder;
}

export interface PaymentsReportData {
  transactions: Transaction[];
  pagination: Pagination;
  summary: PaymentsSummary;
  filters: PaymentsFilters;
}

export interface PaymentsReportResponse {
  success: boolean;
  message: string;
  data: PaymentsReportData;
}

// Events Report Types
export interface Location {
  type: string;
  coordinates: [number, number];
  address: string;
}

export interface RsvpBreakdown {
  total: number;
  confirmed: number;
  maybe: number;
  declined: number;
}

export interface EventMetrics {
  views: number;
  uniqueViews: number;
  likes: number;
  shares: number;
  comments: number;
  rsvps: RsvpBreakdown;
  ticketRedirects: number;
  engagementRate: number;
}

export interface EventReportItem {
  id: string;
  name: string;
  description: string;
  dateTime: string;
  category: string;
  status: string;
  paymentStatus: string | null;
  ticketPrice: number;
  ticketLink: string | null;
  location: Location;
  images: number;
  videos: number;
  isTrialActive: boolean;
  trialEndsAt: string | null;
  subscriptionPlan: string | null;
  creator: EventPlannerInfo | null;
  metrics: EventMetrics | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventsSummary {
  totalEvents: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byPaymentStatus: Record<string, number>;
}

export interface EventsReportData {
  events: EventReportItem[];
  pagination: Pagination;
  summary: EventsSummary;
  filters: Record<string, unknown>;
}

export interface EventsReportResponse {
  success: boolean;
  message: string;
  data: EventsReportData;
}

// Users Report Types
export interface UserReportItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  photo: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationTrend {
  date: string;
  count: number;
}

export interface ActivityBreakdown {
  created_event: number;
  commented_event: number;
  liked_event: number;
  rsvp_event: number;
  became_friends: number;
}

export interface UsersSummary {
  totalUsers: number;
  registrationTrend: RegistrationTrend[];
  activityBreakdown: ActivityBreakdown;
}

export interface UsersReportData {
  users: UserReportItem[];
  pagination: Pagination;
  summary: UsersSummary;
  filters: Record<string, unknown>;
}

export interface UsersReportResponse {
  success: boolean;
  message: string;
  data: UsersReportData;
}

// Event Planners Report Types
export interface EventPlannerReportItem extends UserReportItem {
  companyName: string | null;
  stripeCustomerId: string | null;
  events: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    suspended: number;
  };
  revenue: {
    totalCents: number;
    totalFormatted: string;
    activeSubscriptions: number;
    totalSubscriptions: number;
  };
}

export interface EventPlannersSummary {
  totalEventPlanners: number;
  totalEvents: number;
  approvedEvents: number;
  totalRevenue: number;
  totalRevenueFormatted: string;
  activeSubscriptions: number;
  registrationTrend: RegistrationTrend[];
}

export interface EventPlannersReportData {
  eventPlanners: EventPlannerReportItem[];
  pagination: Pagination;
  summary: EventPlannersSummary;
  filters: Record<string, unknown>;
}

export interface EventPlannersReportResponse {
  success: boolean;
  message: string;
  data: EventPlannersReportData;
}

// Chart Types
export interface Dataset {
  label: string;
  data: number[];
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface ChartResponse {
  success: boolean;
  data: {
    chartData: ChartData;
    period: Period;
    timeRange: string;
  };
}

// Query Params Types
export interface ReportQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaymentsQueryParams extends ReportQueryParams {
  status?: "active" | "canceled" | "past_due" | "unpaid";
  plan?: "weekly" | "monthly";
  eventPlannerId?: string;
}

export interface EventsQueryParams extends ReportQueryParams {
  status?: "draft" | "pending" | "approved" | "suspended" | "rejected";
  category?: "concert" | "workshop" | "conference" | "other";
  paymentStatus?:
    | "active"
    | "trial_expired"
    | "payment_failed"
    | "payment_required";
  includeMetrics?: boolean;
}
