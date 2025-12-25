#!/bin/bash

# QStash Schedule Setup for Price Sync
# This script creates a QStash schedule for automated price syncing

set -e

# Load from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

QSTASH_TOKEN="${QSTASH_TOKEN}"
CRON_SECRET="${CRON_SECRET}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL}"

echo "🚀 QStash Price Sync Schedule Setup"
echo "===================================="
echo ""

# Check if required vars are set
if [ -z "$QSTASH_TOKEN" ]; then
  echo "❌ Error: QSTASH_TOKEN not found in .env"
  exit 1
fi

if [ -z "$CRON_SECRET" ]; then
  echo "❌ Error: CRON_SECRET not found in .env"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
  echo "❌ Error: NEXT_PUBLIC_APP_URL not found in .env"
  exit 1
fi

echo "✓ Environment variables loaded"
echo "📍 App URL: $NEXT_PUBLIC_APP_URL"
echo ""

# Create daily price sync schedule using publish endpoint with cron header
echo "Creating daily price sync schedule (6 AM UTC)..."
RESPONSE=$(curl -s -X POST "https://qstash.upstash.io/v2/publish/$NEXT_PUBLIC_APP_URL/api/cron/update-prices" \
  -H "Authorization: Bearer $QSTASH_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Upstash-Cron: 0 6 * * *" \
  -H "Upstash-Forward-Authorization: Bearer $CRON_SECRET" \
  -d '{}')

if echo "$RESPONSE" | grep -q "messageId"; then
  MESSAGE_ID=$(echo "$RESPONSE" | grep -o '"messageId":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Created! Message ID: $MESSAGE_ID"
  echo "   This will run daily at 6:00 AM UTC"
else
  echo "❌ Failed to create schedule"
  echo "Response: $RESPONSE"
  exit 1
fi

echo ""
echo "🎉 Price sync schedule created successfully!"
echo ""
echo "📊 Next steps:"
echo "   1. View schedule: https://console.upstash.com/qstash"
echo "   2. Test manually:"
echo "      curl -X POST \"$NEXT_PUBLIC_APP_URL/api/cron/update-prices\" \\"
echo "        -H \"Authorization: Bearer $CRON_SECRET\""
echo ""
echo "   3. Monitor execution logs in QStash dashboard"
echo ""
