// Photo moderation status values
export const MODERATION_STATUS = {
  PENDING: "pending",
  ANALYZING: "analyzing",
  AI_APPROVED: "ai_approved",
  AI_REJECTED: "ai_rejected",
  HUMAN_REVIEW: "human_review",
  APPROVED: "approved",
  REJECTED: "rejected",
  FEATURED: "featured",
} as const;

export type ModerationStatus = (typeof MODERATION_STATUS)[keyof typeof MODERATION_STATUS];

// Risk levels for moderation
export const RISK_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type RiskLevel = (typeof RISK_LEVELS)[keyof typeof RISK_LEVELS];

// Rejection reasons
export const REJECTION_REASONS = {
  INAPPROPRIATE_CONTENT: "Inappropriate or explicit content",
  VIOLENCE: "Violent or disturbing content",
  NO_ANIMALS: "No animals visible in the photo",
  LOW_QUALITY: "Image quality too low",
  IRRELEVANT: "Content not relevant to animal feeding",
  DUPLICATE: "Duplicate submission",
  MISLEADING: "Misleading or false content",
  OTHER: "Other - see notes",
} as const;

// Approval categories
export const APPROVAL_CATEGORIES = {
  STANDARD: "standard",
  FEATURED: "featured",
  HIGHLIGHT: "highlight",
} as const;

// Animal types we commonly detect
export const COMMON_ANIMALS = [
  "dog",
  "cat",
  "bird",
  "cow",
  "goat",
  "monkey",
  "squirrel",
  "rabbit",
  "pig",
  "donkey",
  "horse",
  "buffalo",
  "deer",
  "chicken",
  "duck",
  "parrot",
  "pigeon",
] as const;

// Labels that indicate safe content
export const SAFE_LABELS = [
  "animal",
  "pet",
  "food",
  "feeding",
  "bowl",
  "outdoor",
  "street",
  "garden",
  "park",
  "grass",
  "shelter",
];

// Labels that trigger review
export const REVIEW_LABELS = [
  "injury",
  "wound",
  "blood",
  "sick",
  "thin",
  "malnourished",
  "trapped",
  "cage",
];

// Labels that trigger rejection
export const REJECT_LABELS = [
  "violence",
  "explicit",
  "adult",
  "gore",
  "death",
  "corpse",
  "abuse",
];

// Moderation settings
export const MODERATION_CONFIG = {
  maxImagesPerBatch: 10,
  analysisTimeoutMs: 30000,
  retryAttempts: 3,
  retryDelayMs: 1000,
  minImageSizeBytes: 10000, // 10KB
  maxImageSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
};
