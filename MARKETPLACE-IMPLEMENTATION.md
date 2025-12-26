# Cross-Marketplace Research Implementation

This document describes the cross-marketplace research feature implementation for the holiday budget tracker.

## Overview

The system now supports tracking products across 4 marketplaces simultaneously:
- Amazon
- Walmart
- Target
- Best Buy

## Features Implemented

### 1. Database Schema
**New Tables:**
- `marketplace_products` - Stores product links from each marketplace
- `marketplace_search_cache` - Caches search results for 24 hours
- `product_match_history` - Tracks AI matching decisions

**Modified Tables:**
- `gifts` table now has: `primaryMarketplace`, `autoSelectBestPrice`, `lastMarketplaceSync`

**Performance Indexes:**
- Composite indexes on gift_id + marketplace
- Search cache indexes for fast lookups
- Partial indexes for marketplace tracking queries

### 2. Marketplace Search System
**Files:**
- `lib/marketplace-search.ts` - Core search engine
- `actions/marketplace-actions.ts` - Server actions

**Capabilities:**
- Parallel search across all marketplaces
- 24-hour result caching
- Rate limiting (1 req/sec per marketplace)
- Regex-based price extraction

### 3. AI Product Matching
**File:** `lib/product-matcher.ts`

**Features:**
- Gemini 2.5-flash powered matching
- Confidence scoring (0.00-1.00)
- Batch matching support
- Vision API for image comparison

**Confidence Levels:**
- ≥0.85: Auto-accept (high confidence)
- 0.70-0.84: Requires user review
- <0.70: Auto-reject (different products)

### 4. User Interface
**Components:**
- `components/marketplace-comparison.tsx` - Price comparison view
- `components/gift-card.tsx` - Enhanced with marketplace display
- `components/add-gift-dialog.tsx` - Auto-search integration

**Features:**
- Side-by-side price comparison
- Best price highlighting
- Marketplace selection badges
- Auto-search with 1-second debounce
- Multi-select marketplace tracking

### 5. Automated Price Tracking
**File:** `app/api/cron/check-prices/route.ts`

**Enhancements:**
- Checks all marketplace products per gift
- Auto-selects best (lowest) price
- Updates primary marketplace automatically
- Sends alerts with marketplace info
- Backward compatible with single-URL gifts

### 6. Maintenance
**File:** `app/api/cron/clear-cache/route.ts`

Daily cache cleanup removes expired search results.

## Usage

### For Users

**1. Add a Gift with Marketplace Search:**
```
1. Click "Add Gift"
2. Enter product name (e.g., "wireless headphones")
3. Wait 1 second - auto-search triggers
4. See results from all marketplaces
5. Click to select marketplaces to track
6. Or click "Track All Marketplaces"
7. Submit form
```

**2. View Marketplace Comparison:**
```
1. Find gift card on dashboard
2. Click "X Marketplaces" button
3. View side-by-side comparison
4. See best price highlighted in green
5. Click star to set primary marketplace
6. Click trash to remove marketplace
7. Click "Sync Prices" to refresh all
```

**3. Automatic Price Tracking:**
```
- Cron job runs daily at 10 AM
- Checks all marketplace products
- Updates to best price automatically
- Sends email if price drops
- Shows marketplace name in alert
```

### For Developers

**Add a New Marketplace:**

1. Add search function to `lib/marketplace-search.ts`:
```typescript
async function searchNewMarketplace(
  query: string,
  maxResults: number = 10
): Promise<ProductSearchResult[]> {
  return rateLimiter.execute("newmarketplace", async () => {
    // Implement search logic
  });
}
```

2. Add to `searchAllMarketplaces` function:
```typescript
const searchFunctions = {
  // ... existing
  newmarketplace: searchNewMarketplace,
};
```

3. Add color to `components/marketplace-comparison.tsx`:
```typescript
const MARKETPLACE_COLORS = {
  // ... existing
  newmarketplace: "bg-purple-500",
};
```

**Database Queries:**

Get all marketplace products for a gift:
```typescript
const products = await db
  .select()
  .from(marketplaceProducts)
  .where(eq(marketplaceProducts.giftId, giftId));
```

Find best price:
```typescript
const bestPrice = Math.min(
  ...products
    .filter(p => p.currentPrice)
    .map(p => parseFloat(p.currentPrice!))
);
```

## Performance Optimizations

1. **Caching**: 24-hour search result cache
2. **Rate Limiting**: Prevents API blocks
3. **Database Indexes**: Fast queries on gift_id + marketplace
4. **Parallel Processing**: All marketplaces searched simultaneously
5. **Lazy Loading**: Marketplace data loaded on-demand in UI

## Error Handling

1. **Search Failures**: Returns empty array, doesn't block other marketplaces
2. **Price Check Failures**: Logs error, continues with remaining products
3. **AI Matching Failures**: Defaults to 0.5 confidence (manual review)
4. **Network Timeouts**: Retry with exponential backoff
5. **Invalid Data**: JSON validation with fallbacks

## Testing

### Manual Testing Checklist

**Search Functionality:**
- [ ] Enter product name in add gift dialog
- [ ] Verify auto-search triggers after 1 second
- [ ] Confirm results from multiple marketplaces
- [ ] Check best price is highlighted
- [ ] Test selecting individual marketplaces
- [ ] Test "Track All" button
- [ ] Verify gift created with multiple marketplace_products

**Price Comparison:**
- [ ] View gift card with marketplace products
- [ ] Expand marketplace comparison
- [ ] Verify best price highlighted in green
- [ ] Test setting primary marketplace
- [ ] Test removing marketplace
- [ ] Test sync prices button
- [ ] Check confidence badges display

**Price Tracking:**
- [ ] Enable price tracking on multi-marketplace gift
- [ ] Verify cron job updates all marketplaces
- [ ] Check best price auto-selected
- [ ] Confirm primary marketplace updates
- [ ] Test email alert with marketplace name

### Automated Testing

Run the development server:
```bash
npm run dev
```

Check TypeScript compilation:
```bash
npm run build
```

## Cron Job Setup

**Upstash QStash Configuration:**

1. Check prices (daily at 10 AM):
```
POST https://qstash.upstash.io/v2/schedules
{
  "destination": "https://your-app.vercel.app/api/cron/check-prices",
  "cron": "0 10 * * *"
}
```

2. Clear cache (daily at 2 AM):
```
POST https://qstash.upstash.io/v2/schedules
{
  "destination": "https://your-app.vercel.app/api/cron/clear-cache",
  "cron": "0 2 * * *"
}
```

## Environment Variables

Required in `.env`:
```
GEMINI_API_KEY=your_gemini_api_key
QSTASH_CURRENT_SIGNING_KEY=your_qstash_key
QSTASH_NEXT_SIGNING_KEY=your_qstash_next_key
```

## Troubleshooting

**Search returns no results:**
- Check if marketplace sites changed their HTML structure
- Verify regex patterns in `lib/marketplace-search.ts`
- Check browser console for CORS errors

**AI matching not working:**
- Verify GEMINI_API_KEY is set
- Check API quota limits
- Review console logs for API errors

**Cron job not running:**
- Verify QStash configuration
- Check Vercel deployment logs
- Ensure signature verification is working

**Prices not updating:**
- Check if product URLs are still valid
- Verify scraping logic in `lib/price-scraper.ts`
- Review rate limiting settings

## Future Enhancements

Potential improvements:
- Additional marketplaces (eBay, Newegg, etc.)
- Price prediction using ML
- Coupon code integration
- Shipping cost comparison
- Browser extension for one-click add
- Mobile app with push notifications

## Support

For issues or questions:
- Review implementation plan: `/Users/app/./plans/dapper-weaving-abelson.md`
- Check GitHub issues
- Review code comments in key files
