export interface User {
  id: number;
  github_id: string;
  github_username: string;
  email: string;
  name: string;
  role: "vibecoderr" | "reviewer";
  avatar_url: string | null;
  bio: string | null;
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
}

export interface ReviewRequest {
  id: number;
  user_id: number;
  title: string;
  repo_url: string;
  description: string;
  stack: string[];
  concerns: string[];
  budget_min: number | null;
  budget_max: number | null;
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
  reviewer_rating: number;
  reviewer_review_count: number;
  reviewer_expertise: string[];
  reviewer_tagline: string | null;
}

export interface ReviewRequestWithUser extends ReviewRequest {
  user_name: string;
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
