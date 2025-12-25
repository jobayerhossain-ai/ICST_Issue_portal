// API Keys and Configuration
export const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
export const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";
export const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";

export const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

// Issue Categories
export const ISSUE_CATEGORIES = [
  "Infrastructure",
  "Academic",
  "Administrative",
  "Facility",
  "Transportation",
  "Security",
  "Technology",
  "Other"
] as const;

// Issue Status
export const ISSUE_STATUS = {
  OPEN: "open",
  VERIFIED: "verified",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed"
} as const;

// Authority Emails
export const AUTHORITY_EMAILS = {
  admin: "admin@icst.edu.bd",
  principal: "principal@icst.edu.bd",
  maintenance: "maintenance@icst.edu.bd"
};
