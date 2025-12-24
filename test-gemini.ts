/**
 * Test script to verify Gemini AI price extraction
 * Run with: bun test-gemini.ts
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGeminiPriceExtraction() {
  console.log("🧪 Testing Gemini AI Price Extraction...\n");

  // Check if API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found in environment");
    console.log("💡 Get your API key from: https://aistudio.google.com/app/apikey");
    console.log("💡 Add it to your .env file: GEMINI_API_KEY=your_key_here");
    process.exit(1);
  }

  try {
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("✅ API key configured");
    console.log("✅ Using model: gemini-2.5-flash\n");

    // Test with sample HTML
    const sampleHTML = `
      <div class="product">
        <h1>Wireless Headphones</h1>
        <div class="pricing">
          <span class="original-price">$99.99</span>
          <span class="sale-price">$79.99</span>
        </div>
      </div>
    `;

    console.log("📄 Sample HTML:");
    console.log(sampleHTML);
    console.log("\n🤖 Asking Gemini to extract price...\n");

    const prompt = `You are a price extraction assistant. Extract the current selling price from this product page HTML.

RULES:
1. Return ONLY a numeric value (e.g., "19.99" or "159")
2. If there's a sale price and original price, return the SALE PRICE
3. If out of stock or no price found, return "NONE"
4. Do not include currency symbols or text
5. Use decimal format with 2 places if cents exist

HTML Content:
${sampleHTML}

PRICE:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    console.log("📥 Gemini Response:", text);

    // Parse the response
    const priceMatch = text.match(/([0-9]+\.?[0-9]*)/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      console.log("\n✅ Successfully extracted price: $" + price);
      console.log("✅ Expected: $79.99 (sale price)");

      if (price === 79.99) {
        console.log("\n🎉 TEST PASSED! Gemini correctly extracted the sale price!");
      } else {
        console.log("\n⚠️  Price extracted but doesn't match expected value");
      }
    } else {
      console.log("\n❌ Failed to parse price from response");
    }

  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error);

    if (error instanceof Error && error.message.includes("API key")) {
      console.log("\n💡 API key issue. Make sure your GEMINI_API_KEY is valid");
      console.log("💡 Get a new key from: https://aistudio.google.com/app/apikey");
    }
  }
}

// Run the test
testGeminiPriceExtraction();
