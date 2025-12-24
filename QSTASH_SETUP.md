# Upstash QStash Setup Guide

This guide walks you through setting up automated daily price checks using Upstash QStash.

## Why QStash?

- **Generous free tier**: 500 requests/day (vs Vercel's 100/month)
- **No timeout issues**: Unlike Vercel's 10-second limit
- **Built-in retries**: Automatic retry on failures
- **Better for production**: More reliable than hobby-tier cron jobs

## Setup Steps

### 1. Create Upstash Account

1. Go to [https://console.upstash.com/qstash](https://console.upstash.com/qstash)
2. Sign up (free account)
3. Navigate to QStash section

### 2. Get Your Signing Keys

1. In the QStash console, find your credentials:
   - `QSTASH_CURRENT_SIGNING_KEY`
   - `QSTASH_NEXT_SIGNING_KEY`
   - `QSTASH_TOKEN`

2. Add them to your `.env` file:
   ```bash
   QSTASH_CURRENT_SIGNING_KEY=sig_xxxxx
   QSTASH_NEXT_SIGNING_KEY=sig_xxxxx
   QSTASH_TOKEN=xxxxx
   ```

3. Add to Vercel environment variables:
   ```bash
   vercel env add QSTASH_CURRENT_SIGNING_KEY
   vercel env add QSTASH_NEXT_SIGNING_KEY
   vercel env add QSTASH_TOKEN
   ```

### 3. Create Scheduled Job

After deploying to Vercel, create a schedule using QStash:

**Option A: Using the QStash Dashboard**
1. Go to [https://console.upstash.com/qstash](https://console.upstash.com/qstash)
2. Click "Schedules" → "Create Schedule"
3. Fill in:
   - **Destination URL**: `https://your-app.vercel.app/api/cron/check-prices`
   - **Cron Expression**: `0 10 * * *` (10 AM daily)
   - **Method**: GET
4. Click "Create"

**Option B: Using cURL**
```bash
curl -X POST https://qstash.upstash.io/v2/schedules \
  -H "Authorization: Bearer YOUR_QSTASH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "https://your-app.vercel.app/api/cron/check-prices",
    "cron": "0 10 * * *"
  }'
```

**Option C: Using the QStash SDK**
```typescript
import { Client } from "@upstash/qstash";

const client = new Client({ token: process.env.QSTASH_TOKEN! });

await client.schedules.create({
  destination: "https://your-app.vercel.app/api/cron/check-prices",
  cron: "0 10 * * *",
});
```

### 4. Verify Setup

Test your endpoint manually:
```bash
curl -X GET https://your-app.vercel.app/api/cron/check-prices \
  -H "Upstash-Signature: test"
```

Check the QStash dashboard for:
- Schedule status
- Execution logs
- Success/failure rates

## Cron Schedule Examples

```bash
# Every day at 10 AM UTC
0 10 * * *

# Twice daily (10 AM and 6 PM UTC)
0 10,18 * * *

# Every 12 hours
0 */12 * * *

# Monday through Friday at 9 AM UTC
0 9 * * 1-5
```

## Monitoring

View execution logs in the QStash dashboard:
1. Go to [https://console.upstash.com/qstash](https://console.upstash.com/qstash)
2. Click "Logs"
3. See all executions with:
   - Status codes
   - Response times
   - Error messages
   - Retry attempts

## Free Tier Limits

- **500 messages/day** (plenty for daily price checks)
- **3-day log retention**
- **Up to 3 retries** per message

For most use cases, the free tier is more than sufficient.

## Troubleshooting

**401 Unauthorized Error**
- Check that signing keys are correctly set in Vercel environment variables
- Verify keys haven't been rotated in QStash console

**Timeout Errors**
- QStash has no timeout limits (unlike Vercel Cron)
- If still timing out, consider batching gifts into smaller groups

**Signature Verification Failed**
- Ensure `@upstash/qstash` package is installed
- Check that `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY` are set

## Need Help?

- [QStash Documentation](https://upstash.com/docs/qstash)
- [QStash Discord](https://upstash.com/discord)
