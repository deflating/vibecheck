import { getDb } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  const db = getDb();

  const hash = bcrypt.hashSync("password123", 10);

  // Create vibecoderr users
  db.prepare(`INSERT OR IGNORE INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`).run("alex@example.com", hash, "Alex Chen", "vibecoderr");
  db.prepare(`INSERT OR IGNORE INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)`).run("sam@example.com", hash, "Sam Wilson", "vibecoderr");

  // Create reviewer users
  db.prepare(`INSERT OR IGNORE INTO users (email, password_hash, name, role, bio) VALUES (?, ?, ?, ?, ?)`).run(
    "maya@example.com", hash, "Maya Patel", "reviewer", "Staff engineer at a FAANG. 12 years of experience in distributed systems and security."
  );
  db.prepare(`INSERT OR IGNORE INTO users (email, password_hash, name, role, bio) VALUES (?, ?, ?, ?, ?)`).run(
    "jordan@example.com", hash, "Jordan Rivera", "reviewer", "Principal architect. Obsessed with clean code and maintainable systems."
  );
  db.prepare(`INSERT OR IGNORE INTO users (email, password_hash, name, role, bio) VALUES (?, ?, ?, ?, ?)`).run(
    "taylor@example.com", hash, "Taylor Kim", "reviewer", "Security researcher and former pentester. I find the bugs AI writes."
  );

  // Create reviewer profiles
  db.prepare(`INSERT OR IGNORE INTO reviewer_profiles (user_id, expertise, hourly_rate, rating, review_count, turnaround_hours, tagline) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    3, JSON.stringify(["React", "Node.js", "Security", "AWS"]), 150, 4.9, 47, 24, "I review like I'm inheriting the codebase"
  );
  db.prepare(`INSERT OR IGNORE INTO reviewer_profiles (user_id, expertise, hourly_rate, rating, review_count, turnaround_hours, tagline) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    4, JSON.stringify(["Python", "Go", "Architecture", "PostgreSQL"]), 120, 4.7, 31, 48, "Architecture is what happens when nobody's watching"
  );
  db.prepare(`INSERT OR IGNORE INTO reviewer_profiles (user_id, expertise, hourly_rate, rating, review_count, turnaround_hours, tagline) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    5, JSON.stringify(["Security", "Rust", "Node.js", "Penetration Testing"]), 200, 5.0, 19, 36, "Your AI wrote it. I'll tell you what it missed."
  );

  // Create a sample review request
  db.prepare(`INSERT OR IGNORE INTO review_requests (id, user_id, title, repo_url, description, stack, concerns, budget_min, budget_max, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    1, 1, "SaaS Billing Dashboard", "https://github.com/alexchen/billing-dash", "AI-built billing dashboard with Stripe integration. Handles subscriptions, invoices, and usage-based billing. Need someone to check for security holes and make sure the architecture won't fall over at scale.",
    JSON.stringify(["Next.js", "TypeScript", "Stripe", "PostgreSQL"]),
    JSON.stringify(["security", "architecture", "performance"]),
    200, 500, "open"
  );

  // Create sample quotes
  db.prepare(`INSERT OR IGNORE INTO quotes (id, request_id, reviewer_id, price, turnaround_hours, note, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    1, 1, 3, 350, 24, "I've reviewed several Stripe integrations. Key things I check: webhook signature verification, idempotency, race conditions in subscription state changes. Will provide a detailed security report.", "pending"
  );
  db.prepare(`INSERT OR IGNORE INTO quotes (id, request_id, reviewer_id, price, turnaround_hours, note, status) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    2, 1, 5, 450, 36, "Payment systems are my specialty. I'll do a full security audit including injection vectors, auth bypass, and Stripe-specific vulnerabilities. Premium price but I guarantee findings.", "pending"
  );

  console.log("Seeded successfully.");
}

seed();
