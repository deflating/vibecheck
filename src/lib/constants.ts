// Centralized constants — no more magic strings scattered across the codebase.
// If you need to add a new status, role, or category, do it here.

export const REQUEST_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

export const QUOTE_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];

export const USER_ROLE = {
  VIBECODER: "vibecoder",
  REVIEWER: "reviewer",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/** Review score categories used in the review form and report. */
export const REVIEW_CATEGORIES = ["security", "architecture", "performance", "maintainability"] as const;

/** Max file upload size in bytes (10 MB). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Notification types used when creating notifications. */
export const NOTIFICATION_TYPE = {
  NEW_QUOTE: "new_quote",
  QUOTE_ACCEPTED: "quote_accepted",
  REVIEW_COMPLETED: "review_completed",
  NEW_MESSAGE: "new_message",
  PAYMENT_RECEIVED: "payment_received",
} as const;

/** Default review categories shown in the request form. */
export const REQUEST_CATEGORIES = [
  "Full App Review",
  "Security Audit",
  "Architecture Review",
  "Performance Review",
  "Code Quality",
] as const;

/** Concern options shown in the request form. */
export const CONCERN_OPTIONS = [
  "security",
  "architecture",
  "performance",
  "maintainability",
  "scalability",
  "testing",
  "accessibility",
] as const;

/** Polling intervals in milliseconds. */
export const POLL_INTERVAL = {
  CHAT_MESSAGES: 5000,
  NOTIFICATIONS: 30000,
} as const;
