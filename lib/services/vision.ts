import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export interface ImageAnalysisResult {
  isSafe: boolean;
  safetyScore: number; // 0-1, higher is safer
  labels: string[];
  detectedAnimals: string[];
  contentFlags: {
    violence: boolean;
    adult: boolean;
    medical: boolean;
    racy: boolean;
  };
  description: string;
  confidence: number;
  rawResponse?: string;
}

export interface ModerationDecision {
  autoApprove: boolean;
  autoReject: boolean;
  requiresHumanReview: boolean;
  reason: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

// Safety thresholds
const THRESHOLDS = {
  AUTO_APPROVE: parseFloat(process.env.MODERATION_AUTO_APPROVE_THRESHOLD || "0.85"),
  AUTO_REJECT: parseFloat(process.env.MODERATION_AUTO_REJECT_THRESHOLD || "0.2"),
  HUMAN_REVIEW: parseFloat(process.env.MODERATION_SAFETY_THRESHOLD || "0.6"),
};

/**
 * Analyze an image using Gemini Vision API
 */
export async function analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
  try {
    // Fetch the image and convert to base64
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = response.headers.get("content-type") || "image/jpeg";

    // Create the prompt for comprehensive image analysis
    const analysisPrompt = `You are an AI content moderator for a charity platform that shares photos of feeding stray animals.

Analyze this image and provide a JSON response with the following structure:
{
  "isSafe": boolean (true if appropriate for a family-friendly charity website),
  "safetyScore": number (0-1, where 1 is completely safe),
  "labels": string[] (list of objects/elements detected in the image),
  "detectedAnimals": string[] (list of animals detected, e.g., "dog", "cat", "bird"),
  "contentFlags": {
    "violence": boolean (any violence or gore),
    "adult": boolean (adult/explicit content),
    "medical": boolean (disturbing medical content),
    "racy": boolean (suggestive content)
  },
  "description": string (brief description of what's in the image),
  "confidence": number (0-1, your confidence in this analysis)
}

Important criteria:
- Photos of healthy animals being fed = SAFE (high score)
- Photos of animals in good conditions = SAFE
- Slightly injured animals being helped = MODERATE (medium score, flag for review)
- Graphic injury/illness = UNSAFE (low score)
- No animals in photo = FLAG for review
- Inappropriate content = REJECT

Return ONLY the JSON object, no other text.`;

    // Use Gemini to analyze the image
    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: analysisPrompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
    });

    const responseText = result.text || "";

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response as JSON");
    }

    const analysis = JSON.parse(jsonMatch[0]) as ImageAnalysisResult;
    analysis.rawResponse = responseText;

    return analysis;
  } catch (error) {
    console.error("Image analysis error:", error);

    // Return a conservative result that requires human review
    return {
      isSafe: false,
      safetyScore: 0.5,
      labels: ["analysis_failed"],
      detectedAnimals: [],
      contentFlags: {
        violence: false,
        adult: false,
        medical: false,
        racy: false,
      },
      description: "Image analysis failed - requires manual review",
      confidence: 0,
      rawResponse: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Make a moderation decision based on analysis results
 */
export function getModerationDecision(analysis: ImageAnalysisResult): ModerationDecision {
  const { safetyScore, contentFlags, detectedAnimals, confidence } = analysis;

  // Critical content flags - always reject
  if (contentFlags.adult || contentFlags.violence) {
    return {
      autoApprove: false,
      autoReject: true,
      requiresHumanReview: false,
      reason: `Flagged for ${contentFlags.adult ? "adult content" : "violence"}`,
      riskLevel: "critical",
    };
  }

  // High confidence safe animal photo - auto approve
  if (
    safetyScore >= THRESHOLDS.AUTO_APPROVE &&
    confidence >= 0.8 &&
    detectedAnimals.length > 0 &&
    !contentFlags.medical &&
    !contentFlags.racy
  ) {
    return {
      autoApprove: true,
      autoReject: false,
      requiresHumanReview: false,
      reason: "High confidence safe animal photo",
      riskLevel: "low",
    };
  }

  // Very low safety score - auto reject
  if (safetyScore <= THRESHOLDS.AUTO_REJECT) {
    return {
      autoApprove: false,
      autoReject: true,
      requiresHumanReview: false,
      reason: "Safety score below threshold",
      riskLevel: "critical",
    };
  }

  // No animals detected - flag for review
  if (detectedAnimals.length === 0) {
    return {
      autoApprove: false,
      autoReject: false,
      requiresHumanReview: true,
      reason: "No animals detected in photo",
      riskLevel: "medium",
    };
  }

  // Medical flag - needs human review
  if (contentFlags.medical) {
    return {
      autoApprove: false,
      autoReject: false,
      requiresHumanReview: true,
      reason: "Medical content detected - may be injured animal",
      riskLevel: "medium",
    };
  }

  // Medium safety score - needs review
  if (safetyScore < THRESHOLDS.HUMAN_REVIEW) {
    return {
      autoApprove: false,
      autoReject: false,
      requiresHumanReview: true,
      reason: "Safety score requires human review",
      riskLevel: "medium",
    };
  }

  // Moderate confidence - human review
  if (confidence < 0.7) {
    return {
      autoApprove: false,
      autoReject: false,
      requiresHumanReview: true,
      reason: "Low AI confidence - needs human verification",
      riskLevel: "low",
    };
  }

  // Default: approve with review
  return {
    autoApprove: false,
    autoReject: false,
    requiresHumanReview: true,
    reason: "Standard review recommended",
    riskLevel: "low",
  };
}

/**
 * Analyze multiple images in batch
 */
export async function analyzeImageBatch(
  imageUrls: string[]
): Promise<Map<string, ImageAnalysisResult>> {
  const results = new Map<string, ImageAnalysisResult>();

  // Process in parallel with concurrency limit
  const BATCH_SIZE = 5;
  for (let i = 0; i < imageUrls.length; i += BATCH_SIZE) {
    const batch = imageUrls.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const analysis = await analyzeImage(url);
        return { url, analysis };
      })
    );

    batchResults.forEach(({ url, analysis }) => {
      results.set(url, analysis);
    });
  }

  return results;
}
