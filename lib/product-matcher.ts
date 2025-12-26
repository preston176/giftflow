/**
 * AI Product Matching Service
 * Uses Google Gemini to determine if products from different marketplaces are the same
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { productMatchHistory } from "@/db/schema";

export interface Product {
  name: string;
  price?: number;
  imageUrl?: string;
  url: string;
}

export interface ProductMatchRequest {
  referenceProduct: Product;
  candidateProduct: Product & { marketplace: string };
}

export interface ProductMatchResult {
  isMatch: boolean;
  confidence: number; // 0.00 - 1.00
  reasoning: string;
  factors: {
    nameMatch: number;
    priceMatch: number;
    specsMatch: number;
    imageMatch?: number;
  };
}

/**
 * Retry wrapper for AI calls with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 2000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Extract and validate JSON from AI response
 */
function extractAndValidateJSON<T>(
  text: string,
  schema: { [K in keyof T]?: string }
): T | null {
  try {
    // Try to find JSON object in response
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", text);
      return null;
    }

    // Parse JSON
    const data = JSON.parse(jsonMatch[0]);

    // Validate required fields exist
    for (const key in schema) {
      if (schema[key] === "required" && !(key in data)) {
        console.error(`Missing required field: ${key}`);
        return null;
      }
    }

    return data as T;
  } catch (error) {
    console.error("JSON parse error:", error);
    return null;
  }
}

/**
 * Use Gemini AI to determine if two products are the same
 */
export async function matchProducts(
  request: ProductMatchRequest
): Promise<ProductMatchResult> {
  const { referenceProduct, candidateProduct } = request;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a product matching expert. Compare these two products and determine if they are the same item.

REFERENCE PRODUCT:
Name: ${referenceProduct.name}
Price: ${referenceProduct.price ? `$${referenceProduct.price}` : 'unknown'}
URL: ${referenceProduct.url}

CANDIDATE PRODUCT:
Name: ${candidateProduct.name}
Price: ${candidateProduct.price ? `$${candidateProduct.price}` : 'unknown'}
Marketplace: ${candidateProduct.marketplace}
URL: ${candidateProduct.url}

Analyze:
1. Product name/title similarity (ignore minor wording differences, different sellers, etc.)
2. Price difference (same products can have different prices across marketplaces)
3. Key specifications (brand, model, size, color, features)

IMPORTANT RULES:
- Different colors/sizes/storage of same product = NOT a match (confidence < 0.70)
- Same exact product from different sellers = MATCH (confidence >= 0.85)
- Similar products with minor spec differences = POSSIBLE MATCH (confidence 0.70-0.84)
- Consider bundle vs single item carefully
- Price differences up to 30% are normal across marketplaces

Return ONLY valid JSON in this exact format:
{
  "isMatch": true or false,
  "confidence": 0.95,
  "reasoning": "Brief explanation of your decision",
  "factors": {
    "nameMatch": 0.90,
    "priceMatch": 0.85,
    "specsMatch": 0.95
  }
}

Confidence scoring guide:
- confidence >= 0.85: High confidence match (auto-accept)
- confidence 0.70-0.84: Possible match (requires user review)
- confidence < 0.70: Not a match (auto-reject)`;

    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return text;
    });

    // Parse and validate response
    const matchData = extractAndValidateJSON<ProductMatchResult>(result, {
      isMatch: "required",
      confidence: "required",
      reasoning: "required",
      factors: "required",
    });

    if (!matchData) {
      throw new Error("Invalid AI response format");
    }

    // Ensure confidence is between 0 and 1
    matchData.confidence = Math.max(0, Math.min(1, matchData.confidence));

    return matchData;
  } catch (error) {
    console.error("Product matching error:", error);

    // Return safe default on error - requires manual review
    return {
      isMatch: false,
      confidence: 0.5,
      reasoning: "AI matching unavailable. Please verify manually.",
      factors: {
        nameMatch: 0.5,
        priceMatch: 0.5,
        specsMatch: 0.5,
      },
    };
  }
}

/**
 * Batch match multiple candidates against a reference product
 * More efficient than individual calls
 */
export async function batchMatchProducts(
  referenceProduct: Product,
  candidates: Array<Product & { marketplace: string }>
): Promise<ProductMatchResult[]> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    if (candidates.length === 0) {
      return [];
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build candidates list for prompt
    const candidatesList = candidates
      .map((c, i) => `
CANDIDATE ${i + 1}:
Name: ${c.name}
Price: ${c.price ? `$${c.price}` : 'unknown'}
Marketplace: ${c.marketplace}
URL: ${c.url}
`)
      .join("\n");

    const prompt = `You are a product matching expert. Compare the reference product with each candidate and determine if they are the same item.

REFERENCE PRODUCT:
Name: ${referenceProduct.name}
Price: ${referenceProduct.price ? `$${referenceProduct.price}` : 'unknown'}
URL: ${referenceProduct.url}

${candidatesList}

IMPORTANT RULES:
- Different colors/sizes/storage of same product = NOT a match (confidence < 0.70)
- Same exact product from different sellers = MATCH (confidence >= 0.85)
- Similar products with minor spec differences = POSSIBLE MATCH (confidence 0.70-0.84)
- Price differences up to 30% are normal across marketplaces

Return ONLY valid JSON array with one result per candidate:
[
  {
    "isMatch": true or false,
    "confidence": 0.95,
    "reasoning": "Brief explanation",
    "factors": {
      "nameMatch": 0.90,
      "priceMatch": 0.85,
      "specsMatch": 0.95
    }
  }
]

Return exactly ${candidates.length} results in the same order as the candidates.`;

    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return text;
    });

    // Parse JSON array
    try {
      const jsonMatch = result.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const matchResults = JSON.parse(jsonMatch[0]) as ProductMatchResult[];

      // Validate and normalize
      return matchResults.map((match) => ({
        ...match,
        confidence: Math.max(0, Math.min(1, match.confidence)),
      }));
    } catch (error) {
      console.error("Batch match parse error:", error);

      // Fallback: match individually
      return Promise.all(
        candidates.map((candidate) =>
          matchProducts({ referenceProduct, candidateProduct: candidate })
        )
      );
    }
  } catch (error) {
    console.error("Batch matching error:", error);

    // Return safe defaults
    return candidates.map(() => ({
      isMatch: false,
      confidence: 0.5,
      reasoning: "AI matching unavailable. Please verify manually.",
      factors: {
        nameMatch: 0.5,
        priceMatch: 0.5,
        specsMatch: 0.5,
      },
    }));
  }
}

/**
 * Enhanced matching with vision API for image comparison
 * Only use when images are available for both products
 */
export async function matchProductsWithImages(
  referenceProduct: Product & { imageUrl: string },
  candidateProduct: Product & { marketplace: string; imageUrl: string }
): Promise<ProductMatchResult> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Fetch both images
    const [refImageResponse, candImageResponse] = await Promise.all([
      fetch(referenceProduct.imageUrl),
      fetch(candidateProduct.imageUrl),
    ]);

    if (!refImageResponse.ok || !candImageResponse.ok) {
      // Fallback to text-only matching
      return matchProducts({
        referenceProduct,
        candidateProduct,
      });
    }

    const [refImageBuffer, candImageBuffer] = await Promise.all([
      refImageResponse.arrayBuffer(),
      candImageResponse.arrayBuffer(),
    ]);

    const refImageBase64 = Buffer.from(refImageBuffer).toString("base64");
    const candImageBase64 = Buffer.from(candImageBuffer).toString("base64");

    const prompt = `Compare these two product images and text descriptions.

PRODUCT 1 (Reference):
Name: ${referenceProduct.name}
Price: ${referenceProduct.price ? `$${referenceProduct.price}` : 'unknown'}

PRODUCT 2 (Candidate):
Name: ${candidateProduct.name}
Price: ${candidateProduct.price ? `$${candidateProduct.price}` : 'unknown'}
Marketplace: ${candidateProduct.marketplace}

Analyze both the visual appearance and text to determine if they show the same product.

IMPORTANT:
- Different colors/sizes of same product model = NOT a match
- Same product from different angles = MATCH
- Focus on brand logos, model numbers, unique features

Return ONLY valid JSON:
{
  "isMatch": true or false,
  "confidence": 0.95,
  "reasoning": "Combined visual and textual analysis",
  "factors": {
    "nameMatch": 0.90,
    "priceMatch": 0.85,
    "specsMatch": 0.95,
    "imageMatch": 0.92
  }
}`;

    const result = await retryWithBackoff(async () => {
      const response = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: refImageBase64,
          },
        },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: candImageBase64,
          },
        },
      ]);
      const text = response.response.text();
      return text;
    });

    const matchData = extractAndValidateJSON<ProductMatchResult>(result, {
      isMatch: "required",
      confidence: "required",
      reasoning: "required",
      factors: "required",
    });

    if (!matchData) {
      throw new Error("Invalid AI response format");
    }

    matchData.confidence = Math.max(0, Math.min(1, matchData.confidence));

    return matchData;
  } catch (error) {
    console.error("Image matching error:", error);

    // Fallback to text-only matching
    return matchProducts({
      referenceProduct,
      candidateProduct,
    });
  }
}

/**
 * Record a product match decision in history
 */
export async function recordMatchHistory(
  giftId: string,
  marketplace: string,
  productUrl: string,
  matchResult: ProductMatchResult,
  decision: "accepted" | "rejected" | "manual"
): Promise<void> {
  try {
    await db.insert(productMatchHistory).values({
      giftId,
      marketplace,
      productUrl,
      matchConfidence: matchResult.confidence.toString(),
      matchDecision: decision,
      aiReasoning: matchResult.reasoning,
    });
  } catch (error) {
    console.error("Error recording match history:", error);
  }
}

/**
 * Determine if a match should be auto-accepted, requires review, or auto-rejected
 */
export function getMatchDecision(confidence: number): {
  decision: "auto-accept" | "review" | "auto-reject";
  message: string;
} {
  if (confidence >= 0.85) {
    return {
      decision: "auto-accept",
      message: "High confidence match - automatically accepted",
    };
  } else if (confidence >= 0.70) {
    return {
      decision: "review",
      message: "Possible match - please review and confirm",
    };
  } else {
    return {
      decision: "auto-reject",
      message: "Low confidence - likely not the same product",
    };
  }
}
