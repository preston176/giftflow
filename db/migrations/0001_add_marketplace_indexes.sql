-- Add indexes for marketplace products queries
CREATE INDEX IF NOT EXISTS idx_marketplace_products_gift_id ON marketplace_products(gift_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_marketplace ON marketplace_products(marketplace);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_gift_marketplace ON marketplace_products(gift_id, marketplace);

-- Add indexes for search cache queries
CREATE INDEX IF NOT EXISTS idx_search_cache_query ON marketplace_search_cache(search_query);
CREATE INDEX IF NOT EXISTS idx_search_cache_expiry ON marketplace_search_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_search_cache_query_marketplace ON marketplace_search_cache(search_query, marketplace);

-- Add indexes for match history queries
CREATE INDEX IF NOT EXISTS idx_match_history_gift ON product_match_history(gift_id);
CREATE INDEX IF NOT EXISTS idx_match_history_created ON product_match_history(created_at);

-- Add index for gifts with marketplace tracking
CREATE INDEX IF NOT EXISTS idx_gifts_primary_marketplace ON gifts(primary_marketplace) WHERE primary_marketplace IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gifts_marketplace_sync ON gifts(last_marketplace_sync) WHERE last_marketplace_sync IS NOT NULL;
