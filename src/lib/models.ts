export interface User {
  id: number;
  github_id: string;
  github_username: string;
  email: string;
  name: string;
  role: "vibecoder" | "reviewer";
  avatar_url: string | null;
  bio: string | null;
  verified: number;
  created_at: string;
}

export interface ReviewerProfile {
  user_id: number;
  expertise: string[];
  hourly_rate: number | null;
  rating: number;
  review_count: number;
  turnaround_hours: number;
  tagline: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  blog_url: string | null;
  work_history: string[];
  featured_projects: string[];
  languages: string[];
  frameworks: string[];
}

export interface ReviewRequest {
  id: number;
  user_id: number;
  title: string;
  repo_url: string;
  description: string;
  stack: string[];
  concerns: string[];
  concerns_freetext: string;
  budget_min: number | null;
  budget_max: number | null;
  category: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  created_at: string;
}

export interface Quote {
  id: number;
  request_id: number;
  reviewer_id: number;
  price: number;
  turnaround_hours: number;
  note: string | null;
  status: "pending" | "accepted" | "rejected";
  paid: number;
  estimated_delivery_days: number | null;
  created_at: string;
}

export interface Review {
  id: number;
  request_id: number;
  reviewer_id: number;
  quote_id: number;
  summary: string | null;
  security_score: number | null;
  security_notes: string | null;
  architecture_score: number | null;
  architecture_notes: string | null;
  performance_score: number | null;
  performance_notes: string | null;
  maintainability_score: number | null;
  maintainability_notes: string | null;
  overall_score: number | null;
  recommendations: string | null;
  created_at: string;
}

export interface ReviewerRating {
  id: number;
  review_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Message {
  id: number;
  request_id: number;
  sender_id: number;
  body: string;
  created_at: string;
}

export interface MessageWithSender extends Message {
  sender_name: string;
  sender_avatar: string | null;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: number;
  created_at: string;
}

export interface Attachment {
  id: number;
  filename: string;
  original_name: string;
  size: number;
  mime_type: string | null;
  request_id: number | null;
  review_id: number | null;
  uploaded_by: number;
  created_at: string;
}

export interface UserSettings {
  user_id: number;
  notify_new_quotes: number;
  notify_review_completed: number;
  notify_new_messages: number;
  onboarded: number;
  created_at: string;
}

// Extended types for API responses
export interface ReviewerWithProfile extends User {
  expertise: string[];
  hourly_rate: number | null;
  rating: number;
  review_count: number;
  turnaround_hours: number;
  tagline: string | null;
}

export interface QuoteWithReviewer extends Quote {
  reviewer_name: string;
  reviewer_avatar: string | null;
  reviewer_verified: number;
  reviewer_rating: number;
  reviewer_review_count: number;
  reviewer_expertise: string[];
  reviewer_tagline: string | null;
}

export interface ReviewRequestWithUser extends ReviewRequest {
  user_name: string;
}

export interface ReviewRequestWithStats extends ReviewRequest {
  quote_count: number;
  accepted_count: number;
  review_score: number | null;
}

export interface ReviewWithContext extends Review {
  request_title: string;
  repo_url: string;
  request_description: string;
  stack: string[];
  concerns: string[];
  requester_name: string;
}

export interface ReviewWithReviewer extends Review {
  reviewer_name: string;
  reviewer_avatar: string | null;
  reviewer_username: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  private: boolean;
}
