# Marketplace API Setup Guide

This guide will help you get API keys for Best Buy and Walmart to enable marketplace search.

---

## 🔵 Best Buy API (EASIEST - Start Here!)

**Time to setup:** ~5 minutes
**Cost:** FREE
**Approval:** Instant

### Steps:

1. **Go to Best Buy Developer Portal**
   - Visit: https://bestbuyapis.github.io/api-documentation/

2. **Click "Get API Key"**
   - You'll need to create a free account

3. **Fill out the registration form:**
   - Name
   - Email
   - Company/Project name (can be personal project)
   - Agree to terms

4. **Get your API key instantly**
   - You'll see your API key immediately after registration
   - Copy the key

5. **Add to your `.env` file:**
   ```env
   BESTBUY_API_KEY=your_api_key_here
   ```

6. **Test it:**
   - Restart your dev server
   - Try searching for "headphones"
   - You should see Best Buy results!

**Rate Limits:** 5 requests/second, 50,000 requests/day (very generous!)

---

## 🔵 Walmart Open API

**Time to setup:** ~10 minutes
**Cost:** FREE (limited)
**Approval:** Usually instant

### Steps:

1. **Go to Walmart Developer Portal**
   - Visit: https://developer.walmart.com/

2. **Click "Sign Up" or "Get Started"**
   - Create account with email

3. **Apply for API Access:**
   - Select "Affiliate API" (has product search)
   - Fill out application form:
     - Website URL (can use localhost or personal site)
     - Description (e.g., "Price comparison for holiday shopping")

4. **Wait for approval (usually instant to 24 hours)**

5. **Get your credentials:**
   - Consumer ID (this is your API key)
   - Private Key (not needed for basic search)

6. **Add to `.env` file:**
   ```env
   WALMART_API_KEY=your_consumer_id_here
   ```

7. **Test it:**
   - Restart dev server
   - Search for products
   - Walmart results should appear!

**Rate Limits:** 5 requests/second

---

## 🟠 Amazon Product Advertising API (Optional)

**Time to setup:** 1-3 business days
**Cost:** FREE (requires selling on Amazon OR using affiliate links)
**Approval:** Manual review (1-3 days)

### Steps:

1. **Requirements:**
   - Must have an Amazon Associates account
   - OR be an Amazon seller
   - OR have a qualifying website with traffic

2. **Sign up for Amazon Associates:**
   - Visit: https://affiliate-program.amazon.com/
   - Create account
   - Add your website info
   - May need to generate 3 sales within 180 days to stay active

3. **Apply for Product Advertising API:**
   - Visit: https://webservices.amazon.com/paapi5/documentation/
   - Sign in with your Amazon Associates account
   - Request API access

4. **Wait for approval (1-3 business days)**

5. **Get your credentials:**
   - Access Key
   - Secret Key
   - Partner Tag (from Associates account)

6. **Add to `.env` file:**
   ```env
   AMAZON_ACCESS_KEY=your_access_key
   AMAZON_SECRET_KEY=your_secret_key
   AMAZON_PARTNER_TAG=your_partner_tag
   ```

**Note:** Amazon PA API implementation requires additional code (signing requests, etc.). This is a TODO for now.

**Rate Limits:** 1 request/second (default), 8640 requests/day

---

## ❌ Target

Target does NOT have a public product search API.

**Options:**
1. Skip Target entirely
2. Use a third-party scraping service (costs money)
3. Allow manual URL entry only for Target products

**Recommendation:** Skip Target for now.

---

## 🚀 Quick Start (Best Buy Only)

For immediate testing, **just set up Best Buy**:

1. Get Best Buy API key (5 minutes)
2. Add to `.env`:
   ```env
   BESTBUY_API_KEY=your_key_here
   ```
3. Restart dev server
4. Test search - you'll get Best Buy results!

This is enough to test all the marketplace features with real data.

---

## 📝 Your `.env` File Should Look Like:

```env
# Existing variables
DATABASE_URL=...
GEMINI_API_KEY=...
CLERK_SECRET_KEY=...

# Marketplace APIs (add these)
BESTBUY_API_KEY=your_bestbuy_key
WALMART_API_KEY=your_walmart_key
# AMAZON_ACCESS_KEY=your_amazon_key (optional)
# AMAZON_SECRET_KEY=your_amazon_secret (optional)
```

---

## 🧪 Testing After Setup

1. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C)
   bun run dev
   ```

2. **Try a search:**
   - Add Gift → Type "wireless headphones"
   - Wait 1 second
   - You should see results from configured marketplaces!

3. **Check console:**
   - You'll see warnings for marketplaces without API keys
   - Results will only show from marketplaces with valid keys

---

## ❓ Troubleshooting

**No results showing up:**
- Check console for API error messages
- Verify API keys are correct in `.env`
- Make sure you restarted the dev server after adding keys
- Check rate limits (Best Buy: 50k/day is plenty)

**"API key not configured" warnings:**
- This is normal if you haven't set up all marketplaces
- The app will work with just one marketplace configured

**Invalid API key errors:**
- Double-check you copied the full key
- Make sure there are no extra spaces
- Verify the key is active in the developer portal

---

## 💡 Recommendations

**For Testing (Now):**
- Set up **Best Buy only** (fastest, easiest)
- This gives you real API results to test all features

**For Production (Later):**
- Add **Walmart** for more coverage
- Consider **Amazon** if you qualify (biggest marketplace)
- Skip **Target** unless you want to pay for scraping service

---

## 📊 API Comparison

| Marketplace | Setup Time | Cost | Approval | Rate Limit | Recommended |
|------------|------------|------|----------|------------|-------------|
| Best Buy | 5 min | FREE | Instant | 50k/day | ✅ YES |
| Walmart | 10 min | FREE | Instant-24hr | 5/sec | ✅ YES |
| Amazon | 1-3 days | FREE* | 1-3 days | 8k/day | ⚠️ Optional |
| Target | N/A | N/A | No API | N/A | ❌ NO |

*Amazon requires Associates account with sales activity

---

## 🎯 Next Steps

1. **Start with Best Buy** - Get your API key now!
2. **Test the features** - See the marketplace comparison working
3. **Add Walmart** - If you want more coverage
4. **Consider Amazon** - If you qualify and have time

Good luck! Let me know if you need help with any step. 🚀
