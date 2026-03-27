-- Update marketplace_reviews if needed
ALTER TABLE marketplace_reviews ADD COLUMN IF NOT EXISTS reviewee_id TEXT;
ALTER TABLE marketplace_reviews ADD COLUMN IF NOT EXISTS reviewer_type TEXT;

-- Dynamic Reputation Engine View
DROP VIEW IF EXISTS supplier_reputation;
CREATE VIEW supplier_reputation AS
SELECT 
    s.supplier_id,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(r.id) as review_count,
    s.total_deals,
    -- Formula: (AvgRating * 15) + (ReviewCount * 2) + (PerformanceScore * 0.5)
    ( (COALESCE(AVG(r.rating), 0) * 15) + (LEAST(COUNT(r.id), 50) * 2) + (COALESCE(s.performance_score, 0) * 0.5) ) as reputation_score
FROM supplier_stats s
LEFT JOIN marketplace_reviews r ON s.supplier_id = r.reviewee_id AND r.reviewer_type = 'buyer'
GROUP BY s.supplier_id, s.total_deals, s.performance_score;
