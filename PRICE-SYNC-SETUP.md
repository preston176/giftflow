# Automatic Price Sync Setup

This guide explains how to set up automatic daily price checking for tracked gifts.

## Overview

The system automatically:
- Checks prices for all items with URLs (max 100/day)
- Runs daily at 6:00 AM UTC
- Takes screenshots of product pages
- Uses AI to extract current prices
- Sends email alerts when prices drop below target

## Prerequisites

1. **Screenshot API Account**
   - Sign up at https://screenshotapi.net
   - Free tier: 100 screenshots/month
   - Paid plans: Starting at $9/month for 1,000 screenshots

2. **Environment Variables**
   - All QStash variables (already configured)
   - `SCREENSHOT_API_KEY` (from Screenshot API)

## Setup Steps

### 1. Get Screenshot API Key

```bash
# Visit https://screenshotapi.net
# Sign up for free account
# Copy your API token
```

### 2. Add to Environment

Add to your `.env` file:

```bash
SCREENSHOT_API_KEY=your_screenshot_api_token_here
```

### 3. Deploy the Endpoint

Make sure your app is deployed and accessible at `NEXT_PUBLIC_APP_URL`.

```bash
# Deploy to production (e.g., Vercel)
vercel --prod
```

### 4. Schedule the Cron Job

Run the setup script:

```bash
bun run scripts/setup-price-sync-cron.ts
```

Expected output:
```
🚀 Setting up QStash cron job for price syncing...
📍 Target URL: https://your-app.vercel.app/api/cron/update-prices
⏰ Schedule: Daily at 6:00 AM
✅ Cron job created successfully!
📋 Schedule ID: sched_xxxxx
```

### 5. Test Manually (Optional)

Test the endpoint without waiting for the scheduled time:

```bash
curl -X POST https://your-app.vercel.app/api/cron/update-prices \
  -H "Authorization: Bearer your_cron_secret"
```

Expected response:
```json
{
  "success": true,
  "total": 50,
  "updated": 48,
  "errors": 2,
  "priceDrops": 5,
  "timestamp": "2025-12-25T18:00:00.000Z"
}
```

## How It Works

1. **Daily Trigger**: QStash calls your endpoint at 6:00 AM UTC
2. **Fetch Items**: Retrieves up to 100 items with URLs from database
3. **For Each Item**:
   - Wait 2 seconds (rate limiting)
   - Take screenshot of product page via Screenshot API
   - Extract price using Gemini AI
   - Update database if price changed
   - Send email alert if price dropped below target
4. **Return Summary**: Reports updated/error counts

## Monitoring

Check logs in your deployment platform (Vercel, etc.):
- Look for "Price check:" messages
- Check for "Price drop detected!" alerts
- Monitor error counts

## Cost Estimates

**Free Tier (100 screenshots/month)**
- Can check ~3 products/day
- Good for testing

**Paid Tier ($9/month = 1,000 screenshots)**
- Can check ~33 products/day
- Or 1,000 products/month

**Scale Tier ($49/month = 10,000 screenshots)**
- Can check ~330 products/day
- Or 10,000 products/month

## Limitations

- **Rate Limit**: 2 seconds between requests (prevents bans)
- **Batch Limit**: 100 items per cron run
- **Daily Schedule**: Runs once per day (not real-time)
- **API Costs**: Screenshot API charges per screenshot
- **Timeout**: 5 minute max execution time

## Troubleshooting

### Cron job not running

```bash
# Check QStash dashboard
# Visit: https://console.upstash.com/qstash

# Or list all schedules
curl https://qstash.upstash.io/v2/schedules \
  -H "Authorization: Bearer $QSTASH_TOKEN"
```

### Screenshots failing

- Check Screenshot API quota: https://screenshotapi.net/dashboard
- Verify `SCREENSHOT_API_KEY` is correct
- Check URL is accessible (not localhost)

### Price extraction failing

- Check Gemini API quota
- Verify `GEMINI_API_KEY` is valid
- Check logs for specific errors

### No email alerts

- Verify Resend API key is valid
- Check user email addresses exist in profiles table
- Look for email sending errors in logs

## Future Improvements

- [ ] Smarter scheduling (check high-priority items more often)
- [ ] User preferences for check frequency
- [ ] Batch processing by domain
- [ ] Retry logic for failed screenshots
- [ ] Dashboard showing last checked times
- [ ] Real-time alerts (webhook-based)

## Unscheduling

To remove the cron job:

```bash
# List schedules to get ID
curl https://qstash.upstash.io/v2/schedules \
  -H "Authorization: Bearer $QSTASH_TOKEN"

# Delete schedule
curl -X DELETE https://qstash.upstash.io/v2/schedules/sched_xxxxx \
  -H "Authorization: Bearer $QSTASH_TOKEN"
```
