# 📊 Reports & Analytics API Documentation

## 🎯 Executive Summary

This document provides a comprehensive analysis of all **Reports and Analytics APIs** currently implemented in the ExtEnt React Native application. This documentation is intended for the **Backend Team** to understand the current implementation and extend similar reporting capabilities to other modules.

**Status:** ✅ **ACTIVE IMPLEMENTATION**  
**Last Updated:** January 2025  
**Primary Module:** Events Analytics

---

## 📋 Table of Contents

1. [Current Reports Implementation Overview](#1-current-reports-implementation-overview)
2. [API Endpoints & Usage](#2-api-endpoints--usage)
3. [Data Structures & Response Formats](#3-data-structures--response-formats)
4. [Frontend Implementation Details](#4-frontend-implementation-details)
5. [How Reports Are Achieved](#5-how-reports-are-achieved)
6. [Extension Guide for Other Modules](#6-extension-guide-for-other-modules)
7. [Technical Specifications](#7-technical-specifications)

---

## 1. Current Reports Implementation Overview

### 1.1 Modules with Reports/Analytics

Currently, the application has **Reports/Analytics** implemented for:

| Module | Status | Endpoint | Purpose |
|--------|--------|----------|---------|
| **Events** | ✅ **ACTIVE** | `/events/:eventId/analytics/complete` | Event performance metrics, engagement analytics, and chart data |
| **Events Metrics** | ✅ **ACTIVE** | `/events/:eventId/metrics/count` | Quick metrics count (views, likes, comments, RSVPs) |
| **Payments** | ⚠️ **PLANNED** | `/payments/payment-history` | Payment history with filters (mentioned in roadmap) |
| **Revenue Reports** | ⚠️ **PLANNED** | Not yet implemented | Revenue analytics dashboard (mentioned in roadmap) |

### 1.2 Key Features Implemented

✅ **Event Analytics Dashboard**
- Real-time metrics tracking (Views, Likes, Shares, Comments, RSVPs, Ticket Redirects)
- Performance charts with multiple time periods (7 Days, 30 Days, 12 Months)
- Trend analysis with percentage changes
- Engagement rate calculations
- RSVP breakdown (Confirmed, Maybe, Declined)
- Smart data bucketing (hourly, daily, monthly, yearly)
- Pull-to-refresh functionality
- Loading and error states

✅ **Event Metrics Count**
- Quick metrics retrieval for event detail screens
- Real-time view tracking
- RSVP status tracking

---

## 2. API Endpoints & Usage

### 2.1 Event Analytics Complete API

**Endpoint:** `GET /events/:eventId/analytics/complete`

**Purpose:** Retrieve comprehensive analytics data for an event including chart data and metrics.

**Location in Code:**
- **Frontend Service:** `src/services/modules/general/index.js` (via `useLazyGetApiCallQuery`)
- **Frontend Usage:** `src/screens/Events/EventMetricsContainer.js`
- **Documentation:** `ANALYTICS_REPORT.md`

**Request Parameters:**
```javascript
{
  url: `events/${eventId}/analytics/complete`,
  params: { 
    period: 'week' | 'month' | 'year'  // Time period for analytics
  }
}
```

**Query Parameters:**
- `period` (required): Time period for analytics
  - `'week'` - Last 7 days
  - `'month'` - Last 30 days  
  - `'year'` - Last 12 months

**Response Format:**
```json
{
  "message": "Complete event analytics retrieved successfully",
  "chartData": {
    "timeRange": "week",
    "startDate": "2025-09-01",
    "endDate": "2025-09-07",
    "bucketType": "daily",
    "labels": ["1D", "2D", "3D", "4D", "5D", "6D", "7D"],
    "datasets": [
      {
        "label": "Views",
        "data": [12, 9, 15, 20, 18, 25, 10]
      },
      {
        "label": "Likes",
        "data": [1, 0, 3, 2, 4, 1, 0]
      },
      {
        "label": "Comments",
        "data": [3, 4, 3, 5, 7, 4, 9]
      }
    ]
  },
  "analytics": {
    "currentOverview": {
      "totals": {
        "views": 109,
        "uniqueViews": 30,
        "likes": 11,
        "shares": 3,
        "comments": 35,
        "rsvps": 1,
        "ticketRedirects": 0
      },
      "rsvpBreakdown": {
        "confirmed": 0,
        "maybe": 1,
        "declined": 0
      },
      "engagementRate": "14%"
    },
    "averages": {
      "perDay": {
        "views": 15,
        "likes": 1.5,
        "comments": 5
      }
    },
    "percentageChange": {
      "views": {
        "value": -3,
        "trend": "down"
      },
      "likes": {
        "value": 2,
        "trend": "up"
      },
      "comments": {
        "value": 1,
        "trend": "up"
      }
    }
  }
}
```

**How It's Called:**
```javascript
// In EventMetricsContainer.js
const [fetchAnalytics, { data, isLoading, isFetching, error }] = useLazyGetApiCallQuery();

useEffect(() => {
  if (eventId) {
    fetchAnalytics({
      url: `events/${eventId}/analytics/complete`,
      params: { period: selectedPeriod },
      loading: false,
    });
  }
}, [eventId, selectedPeriod]);
```

**Key Features:**
- ✅ Pre-processed chart data (no frontend transformation needed)
- ✅ Smart bucketing based on time range
- ✅ Multiple datasets in single response
- ✅ Trend indicators (up/down/stable)
- ✅ Engagement rate calculation
- ✅ RSVP breakdown

---

### 2.2 Event Metrics Count API

**Endpoint:** `GET /events/:eventId/metrics/count`

**Purpose:** Get quick metrics count for an event (used in event detail screens).

**Location in Code:**
- **Frontend Service:** `src/services/modules/events/eventMetrics.js`
- **Frontend Usage:** `src/screens/Events/EventDetailContainer.js`
- **Hook:** `useLazyMetricsCountQuery()`

**Request:**
```javascript
{
  event_id: "68a3d75eacefef1e65b3f61c"
}
```

**Response Format:**
```json
{
  "liked": true,
  "totalLikes": 25,
  "totalComments": 12,
  "totalViews": 150,
  "uniqueViews": 45,
  "rsvp": "maybe"
}
```

**How It's Called:**
```javascript
// In EventDetailContainer.js
const [metricsCountFun, metricsCount] = useLazyMetricsCountQuery();

useEffect(() => {
  if (eventId) {
    metricsCountFun({ event_id: eventId });
  }
}, [eventId]);
```

**Usage:**
- Display view count on event detail screen
- Show like/comment counts
- Display RSVP status
- Check if current user has liked the event

---

### 2.3 Track Event View API

**Endpoint:** `POST /events/:eventId/view`

**Purpose:** Track when a user views an event (for analytics).

**Location in Code:**
- **Frontend Service:** `src/services/modules/events/eventMetrics.js`
- **Hook:** `useTrackViewsMutation()`

**Request:**
```javascript
// Just event_id in URL path
POST /events/68a3d75eacefef1e65b3f61c/view
```

**Response:**
```json
{
  "message": "View tracked successfully"
}
```

**How It's Called:**
```javascript
const [trackView] = useTrackViewsMutation();

// Called when event detail screen is viewed
trackView(eventId);
```

---

### 2.4 RSVP to Event API

**Endpoint:** `POST /events/:eventId/rsvp`

**Purpose:** Record user RSVP status for an event.

**Location in Code:**
- **Frontend Service:** `src/services/modules/events/eventMetrics.js`
- **Hook:** `useRsvpToEventMutation()`

**Request:**
```javascript
{
  event_id: "68a3d75eacefef1e65b3f61c",
  data: {
    status: "confirmed" | "maybe" | "declined"
  }
}
```

**Response:**
```json
{
  "message": "RSVP updated successfully",
  "rsvp": "confirmed"
}
```

---

## 3. Data Structures & Response Formats

### 3.1 Chart Data Structure

The chart data follows a standardized format optimized for mobile chart libraries:

```typescript
interface ChartData {
  timeRange: string;           // "week" | "month" | "year" | "custom"
  startDate: string;            // YYYY-MM-DD format
  endDate: string;              // YYYY-MM-DD format
  bucketType: string;           // "hourly" | "daily" | "monthly" | "yearly"
  labels: string[];             // Chart labels (e.g., ["1D", "2D", "3D"])
  datasets: Dataset[];          // Array of data series
}

interface Dataset {
  label: string;                // "Views" | "Likes" | "Comments"
  data: number[];               // Array of numbers ONLY (no strings/null)
}
```

**Label Format Rules:**
- **1 day (24 hours):** `["4h", "8h", "12h", "16h", "20h", "24h"]` (6 data points, 4-hour chunks)
- **2-7 days:** `["1D", "2D", "3D", "4D", "5D", "6D", "7D"]` (daily buckets)
- **8-31 days:** `["1W", "2W", "3W", "4W"]` (weekly aggregation)
- **32-365 days:** `["1M", "2M", "3M", ..., "12M"]` (monthly buckets)
- **>365 days:** `["1Y", "2Y", "3Y"]` (yearly buckets)

### 3.2 Analytics Overview Structure

```typescript
interface Analytics {
  currentOverview: {
    totals: {
      views: number;
      uniqueViews: number;
      likes: number;
      shares: number;
      comments: number;
      rsvps: number;
      ticketRedirects: number;
    };
    rsvpBreakdown: {
      confirmed: number;
      maybe: number;
      declined: number;
    };
    engagementRate: string;      // e.g., "14%"
  };
  averages: {
    perDay: {
      views: number;
      likes: number;
      comments: number;
    };
  };
  percentageChange: {
    views: { value: number; trend: "up" | "down" | "stable" };
    likes: { value: number; trend: "up" | "down" | "stable" };
    comments: { value: number; trend: "up" | "down" | "stable" };
  };
}
```

### 3.3 Smart Bucketing Logic

The backend implements intelligent data aggregation based on time range:

```javascript
// Bucketing Rules:
// - 1 day → hourly buckets (6 data points: 4-hour chunks)
// - 2-7 days → daily buckets (7 data points)
// - 8-31 days → weekly aggregation (4 data points)
// - 32-365 days → monthly buckets (up to 12 data points)
// - >365 days → yearly buckets
```

**Benefits:**
- ✅ Optimal data points for mobile UI (not too many, not too few)
- ✅ Better performance (less data to render)
- ✅ Consistent chart appearance across all time ranges

---

## 4. Frontend Implementation Details

### 4.1 Service Layer Architecture

**Base API Service:** `src/services/api.js`
- Uses Redux Toolkit Query (RTK Query)
- Base URL from config
- Automatic token injection (Bearer token)
- 401 error handling (auto-logout)

**General API Module:** `src/services/modules/general/index.js`
- Generic GET/POST/MUTATION endpoints
- Used for analytics complete endpoint via `useLazyGetApiCallQuery()`

**Events Metrics Module:** `src/services/modules/events/eventMetrics.js`
- Specialized endpoints for event metrics
- `useMetricsCountQuery()` - Get metrics count
- `useTrackViewsMutation()` - Track views
- `useRsvpToEventMutation()` - RSVP to event

### 4.2 Screen Implementation

**EventMetricsContainer:** `src/screens/Events/EventMetricsContainer.js`

**Key Features:**
- Period selection dropdown (7 Days, 30 Days, 12 Months)
- Overview metrics cards (6 cards: Views, Likes, Shares, Comments, RSVPs, Redirects)
- Performance charts (3 charts: Views, Likes, Comments)
- Pull-to-refresh functionality
- Loading states
- Error handling
- Empty state handling

**Components Used:**
- `MetricCard` - Displays individual metric with formatted number
- `PerformanceChart` - Line chart with trend indicators
- `PeriodDropdown` - Period selector dropdown

**Data Flow:**
```
1. User selects period → setSelectedPeriod('week')
2. useEffect triggers → fetchAnalytics({ url, params: { period } })
3. API call → GET /events/:eventId/analytics/complete?period=week
4. Response received → data.chartData and data.analytics
5. Extract datasets → viewsData, likesData, commentsData
6. Render charts → PerformanceChart components
7. Display metrics → MetricCard components
```

### 4.3 Utility Functions

**Metrics Helpers:** `src/utils/metricsHelpers.js`

**Functions:**
- `formatNumber(num)` - Format numbers (1250 → "1.2K")
- `isValidDate(dateString)` - Validate date format
- `convertDateFormat(date)` - Convert MM-DD-YYYY to YYYY-MM-DD
- `generateChartLabels(totalDays, dailyData)` - Generate chart labels
- `prepareChartData(dailyData, field)` - Prepare chart data arrays

**Note:** Some helper functions are now obsolete since backend provides pre-processed data.

---

## 5. How Reports Are Achieved

### 5.1 Data Collection

**Event Views:**
- Tracked via `POST /events/:eventId/view` when user views event detail
- Stored in backend database with timestamp
- Aggregated by date for analytics

**Event Likes:**
- Tracked when user likes/unlikes an event
- Stored in backend with user ID and timestamp
- Counted for each event

**Event Comments:**
- Tracked when user comments on event
- Stored in comments collection
- Counted per event

**Event Shares:**
- Tracked when user shares event
- Stored in backend with share method (social media, link, etc.)
- Counted per event

**RSVPs:**
- Tracked via `POST /events/:eventId/rsvp`
- Stored with status (confirmed, maybe, declined)
- Counted and broken down by status

**Ticket Redirects:**
- Tracked when user clicks ticket link
- Stored with redirect URL and timestamp
- Counted per event

### 5.2 Data Aggregation

**Backend Processing:**
1. **Raw Data Collection:** Gather all analytics events for the specified time period
2. **Date Range Calculation:** Determine start/end dates based on period parameter
3. **Bucket Type Determination:** Choose appropriate bucket type (hourly/daily/monthly/yearly)
4. **Data Aggregation:** Group raw data into buckets
5. **Label Generation:** Create chart labels based on bucket type
6. **Dataset Creation:** Create datasets for each metric (Views, Likes, Comments)
7. **Analytics Calculation:**
   - Calculate totals
   - Calculate averages
   - Calculate percentage changes (vs previous period)
   - Calculate engagement rate
   - Calculate RSVP breakdown

**Frontend Processing:**
- Minimal processing (mostly just data extraction)
- Format numbers for display
- Render charts and metrics

### 5.3 Performance Optimizations

**Backend:**
- ✅ Pre-processed data (no frontend transformation)
- ✅ Smart bucketing (optimal data points)
- ✅ Database indexes on eventId and date fields
- ✅ Efficient queries for large datasets

**Frontend:**
- ✅ Lazy loading (useLazyGetApiCallQuery)
- ✅ Pull-to-refresh for data updates
- ✅ Loading states for better UX
- ✅ Error handling with retry options
- ✅ Minimal data processing (backend does heavy lifting)

---

## 6. Extension Guide for Other Modules

### 6.1 Recommended Modules for Reports Extension

Based on the current implementation, these modules would benefit from similar reporting:

1. **User/Profile Analytics**
   - User engagement metrics
   - Profile views
   - Friend requests sent/received
   - Activity timeline

2. **Payment/Revenue Reports**
   - Revenue by time period
   - Payment success/failure rates
   - Subscription analytics
   - Payment method distribution

3. **Event Planner Dashboard**
   - Total events created
   - Events by status (live, draft, archived)
   - Overall engagement metrics
   - Revenue from events

4. **Friends/Social Analytics**
   - Friend connections over time
   - Social interactions
   - Network growth

5. **Notifications Analytics**
   - Notification delivery rates
   - User engagement with notifications
   - Notification preferences

### 6.2 API Pattern to Follow

**Standard Analytics Endpoint Pattern:**
```
GET /{module}/{resourceId}/analytics/complete?period={period}
```

**Examples:**
- `GET /users/:userId/analytics/complete?period=month`
- `GET /payments/revenue/analytics/complete?period=year`
- `GET /event-planners/:plannerId/analytics/complete?period=week`

### 6.3 Response Structure Template

**For Any Module:**
```json
{
  "message": "Complete {module} analytics retrieved successfully",
  "chartData": {
    "timeRange": "week",
    "startDate": "2025-09-01",
    "endDate": "2025-09-07",
    "bucketType": "daily",
    "labels": ["1D", "2D", "3D", "4D", "5D", "6D", "7D"],
    "datasets": [
      {
        "label": "Metric1",
        "data": [10, 15, 12, 18, 20, 15, 22]
      },
      {
        "label": "Metric2",
        "data": [5, 8, 6, 10, 12, 8, 15]
      }
    ]
  },
  "analytics": {
    "currentOverview": {
      "totals": {
        "metric1": 112,
        "metric2": 64
      },
      "breakdown": {
        // Module-specific breakdown
      },
      "rate": "12%"  // Module-specific rate calculation
    },
    "averages": {
      "perDay": {
        "metric1": 16,
        "metric2": 9
      }
    },
    "percentageChange": {
      "metric1": {
        "value": 5,
        "trend": "up"
      },
      "metric2": {
        "value": -2,
        "trend": "down"
      }
    }
  }
}
```

### 6.4 Implementation Checklist for Backend Team

**For Each New Module Report:**

- [ ] **Define Metrics:** Identify key metrics to track
- [ ] **Data Collection:** Implement tracking endpoints (similar to trackViews)
- [ ] **Database Schema:** Design analytics data storage
- [ ] **Aggregation Logic:** Implement smart bucketing logic
- [ ] **Analytics Endpoint:** Create `/analytics/complete` endpoint
- [ ] **Response Format:** Follow standard response structure
- [ ] **Testing:** Test with various time periods
- [ ] **Performance:** Add database indexes
- [ ] **Documentation:** Document endpoint and response format

**Key Functions to Implement:**
1. `determineBucketType(startDate, endDate, period)` - Smart bucketing
2. `aggregateData(rawData, bucketType, buckets)` - Data aggregation
3. `calculateAnalytics(aggregatedData, rawData, previousPeriodData)` - Analytics calculations
4. `generateLabels(bucketType, buckets)` - Label generation
5. `calculatePercentageChange(current, previous)` - Trend calculation

### 6.5 Example: Payment Revenue Reports

**Endpoint:** `GET /payments/revenue/analytics/complete?period=month`

**Metrics to Track:**
- Total revenue
- Successful payments
- Failed payments
- Refunds
- Average transaction value
- Revenue by payment method

**Response Structure:**
```json
{
  "message": "Complete payment revenue analytics retrieved successfully",
  "chartData": {
    "timeRange": "month",
    "startDate": "2025-09-01",
    "endDate": "2025-09-30",
    "bucketType": "daily",
    "labels": ["1W", "2W", "3W", "4W"],
    "datasets": [
      {
        "label": "Revenue",
        "data": [500, 750, 600, 900]
      },
      {
        "label": "Transactions",
        "data": [25, 30, 28, 35]
      }
    ]
  },
  "analytics": {
    "currentOverview": {
      "totals": {
        "revenue": 2750,
        "successfulPayments": 118,
        "failedPayments": 5,
        "refunds": 2,
        "averageTransactionValue": 23.31
      },
      "paymentMethodBreakdown": {
        "card": 100,
        "bank_transfer": 15,
        "other": 3
      },
      "successRate": "95.9%"
    },
    "averages": {
      "perDay": {
        "revenue": 91.67,
        "transactions": 3.93
      }
    },
    "percentageChange": {
      "revenue": {
        "value": 12,
        "trend": "up"
      },
      "transactions": {
        "value": 8,
        "trend": "up"
      }
    }
  }
}
```

---

## 7. Technical Specifications

### 7.1 API Base Configuration

**Base URL:** Configured in `src/config/index.js`
- Development: (from config)
- Production: (from config)

**Authentication:**
- Method: Bearer Token
- Header: `Authorization: Bearer {token}`
- Auto-injected via RTK Query base query

**Error Handling:**
- 401 Unauthorized → Auto-logout
- Other errors → Display error message
- Retry mechanism via pull-to-refresh

### 7.2 Data Format Requirements

**Critical Requirements:**
1. **Data Arrays:** Must contain ONLY numbers (no strings, null, undefined)
2. **Labels:** Must match data array length exactly
3. **Date Format:** Always YYYY-MM-DD format
4. **Dynamic Labels:** Use relative labels (1D, 2D, 3D) not specific dates
5. **Time Range Values:** Use descriptive values (last7Days, last30Days, last12Months)

### 7.3 Performance Requirements

**Response Time:**
- Target: < 500ms for analytics endpoint
- Acceptable: < 1s for large datasets

**Data Optimization:**
- Use database indexes on resourceId and date fields
- Implement query optimization for large datasets
- Consider caching for frequently requested data
- Limit data points to optimal range (6-12 points for mobile UI)

### 7.4 Frontend Integration Points

**RTK Query Setup:**
```javascript
// Base API in src/services/api.js
export const api = createApi({
  baseQuery: baseQueryWithInterceptor,
  tagTypes: ['Events', 'User', ...],
  endpoints: () => ({}),
});

// Module-specific endpoints
export const MetricsApi = api.injectEndpoints({
  endpoints: builder => ({
    // Endpoint definitions
  }),
});
```

**Hook Usage:**
```javascript
// Lazy query (manual trigger)
const [fetchAnalytics, { data, isLoading, error }] = useLazyGetApiCallQuery();

// Auto query (automatic on mount)
const { data, isLoading } = useMetricsCountQuery({ event_id });
```

---

## 8. Summary & Recommendations

### 8.1 Current Implementation Summary

✅ **What's Working:**
- Event analytics with comprehensive metrics
- Smart data bucketing and aggregation
- Pre-processed chart data (backend optimization)
- Multiple time period support
- Trend analysis and percentage changes
- RSVP breakdown and engagement rates
- Real-time metrics tracking

### 8.2 Recommendations for Extension

**Priority 1: High Value Modules**
1. **Payment/Revenue Reports** - Critical for business insights
2. **Event Planner Dashboard** - Overall performance metrics
3. **User Analytics** - User engagement tracking

**Priority 2: Medium Value Modules**
4. **Friends/Social Analytics** - Network growth metrics
5. **Notifications Analytics** - Delivery and engagement rates

**Implementation Approach:**
1. Follow the same API pattern (`/analytics/complete`)
2. Use the same response structure (chartData + analytics)
3. Implement smart bucketing logic
4. Reuse frontend components (MetricCard, PerformanceChart)
5. Maintain consistency in data format

### 8.3 Key Takeaways for Backend Team

1. **Standardize Response Format:** Use the same structure across all modules
2. **Pre-process Data:** Backend should do heavy lifting (aggregation, bucketing)
3. **Smart Bucketing:** Implement intelligent data point selection
4. **Performance First:** Optimize queries, add indexes, consider caching
5. **Consistent Labels:** Use relative labels (1D, 2D, 3D) not absolute dates
6. **Trend Indicators:** Always include percentage change with trend direction
7. **Error Handling:** Proper HTTP status codes and error messages

---

## 9. Additional Resources

**Related Documentation:**
- `ANALYTICS_REPORT.md` - Detailed analytics implementation guide
- `STRIPE_PAYMENT_IMPLEMENTATION_GUIDE.md` - Payment system documentation
- `BACKEND_STRIPE_REQUIREMENTS.md` - Backend payment requirements

**Code References:**
- Frontend Service: `src/services/modules/general/index.js`
- Events Metrics: `src/services/modules/events/eventMetrics.js`
- Analytics Screen: `src/screens/Events/EventMetricsContainer.js`
- Metrics Helpers: `src/utils/metricsHelpers.js`

**API Testing:**
- Test Event ID: `68a3d75eacefef1e65b3f61c`
- Test Periods: `week`, `month`, `year`

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Frontend Team  
**For:** Backend Development Team

---

*This document provides a complete overview of the reports/analytics implementation. Use it as a reference to extend similar reporting capabilities to other modules in the application.*

