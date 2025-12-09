export const API_ENDPOINTS = {
  login: "/login",
  logout: "/logout",
  all_events: "/admin/events",
  update_event_status: "/events",
  single_event: "/events", // For fetching single event by ID
  // User Management APIs
  all_users: "/admin/users", // GET - List users with filtering and pagination
  update_user: "/admin/users", // PATCH - Update user details (append /:id)
  pending_users: "/admin/users/pending", // GET - List pending event planners
  update_user_status: "/admin/users", // PATCH - Update user status (append /:id/status)
  // Reports APIs
  reports_dashboard: "/admin/reports/dashboard", // GET - Dashboard overview
  reports_payments: "/admin/reports/payments", // GET - Payments report
  reports_events: "/admin/reports/events", // GET - Events report with metrics
  reports_users: "/admin/reports/users", // GET - Users report
  reports_event_planners: "/admin/reports/event-planners", // GET - Event planners report
  // Chart APIs
  charts_revenue: "/admin/reports/charts/revenue", // GET - Revenue chart data
  charts_registrations: "/admin/reports/charts/registrations", // GET - Registration trends
  charts_events: "/admin/reports/charts/events", // GET - Events creation chart
};
