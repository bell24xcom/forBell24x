import { db } from '../db';
import { sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { QueryResult } from '../types/db-types';

export interface ProductShowcase {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  video_url?: string;
  thumbnail_url?: string;
  public_id?: string;
  user_id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a new product showcase
 */
export async function createProductShowcase(data: ProductShowcase): Promise<ProductShowcase> {
  const query = sql`
    INSERT INTO product_showcases (
      id, title, description, category, price, video_url, thumbnail_url, 
      public_id, user_id, status, created_at, updated_at
    ) VALUES (
      ${data.id},
      ${data.title},
      ${data.description},
      ${data.category},
      ${data.price || null},
      ${data.video_url || null},
      ${data.thumbnail_url || null},
      ${data.public_id || null},
      ${data.user_id},
      ${data.status},
      ${data.created_at},
      ${data.updated_at}
    )
    RETURNING *
  `;

  const result = await db.execute<ProductShowcase>(query);
  return result[0];
}

/**
 * Get a product showcase by ID
 */
export async function getProductShowcase(id: string): Promise<ProductShowcase | null> {
  const query = sql`
    SELECT ps.*, u.name as user_name, u.email as user_email
    FROM product_showcases ps
    LEFT JOIN users u ON ps.user_id = u.id
    WHERE ps.id = ${id}
  `;

  const result = await db.execute(query);
  return result.length > 0 ? result[0] : null;
}

/**
 * Get product showcases with optional filters
 */
export async function getProductShowcases(filters: {
  user_id?: string;
  category?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<ProductShowcase[]> {
  const { user_id, category, status, limit = 50, offset = 0 } = filters;

  // Build the WHERE clause based on filters
  const conditions = [];
  const params = [];

  if (user_id) {
    conditions.push('ps.user_id = ?');
    params.push(user_id);
  }

  if (category) {
    conditions.push('ps.category = ?');
    params.push(category);
  }

  if (status) {
    conditions.push('ps.status = ?');
    params.push(status);
  } else {
    // Default to published showcases only
    conditions.push('ps.status = ?');
    params.push('published');
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  const query = `
    SELECT ps.*, u.name as user_name, u.email as user_email
    FROM product_showcases ps
    LEFT JOIN users u ON ps.user_id = u.id
    ${whereClause}
    ORDER BY ps.created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);
  const result = await db.execute(sql.raw(query, ...params));
  return result;
}

/**
 * Update a product showcase
 */
export async function updateProductShowcase(
  id: string, 
  updates: Partial<Omit<ProductShowcase, 'id' | 'user_id' | 'created_at'>>
): Promise<ProductShowcase | null> {
  const updateFields = [];
  const updateValues = [];

  // Create update statements for each field
  Object.entries(updates).forEach(([key, value]) => {
    updateFields.push(`${key} = ?`);
    updateValues.push(value === undefined ? null : value);
  });

  // Add the updated_at field
  updateFields.push('updated_at = ?');
  updateValues.push(updates.updated_at || new Date());

  if (updateFields.length === 0) {
    // Nothing to update
    return getProductShowcase(id);
  }

  const query = `
    UPDATE product_showcases
    SET ${updateFields.join(', ')}
    WHERE id = ?
    RETURNING *
  `;

  updateValues.push(id);
  const result = await db.execute(sql.raw(query, ...updateValues));
  
  if (result.length === 0) {
    return null;
  }
  
  return result[0];
}

/**
 * Delete a product showcase
 */
export async function deleteProductShowcase(id: string): Promise<boolean> {
  const query = sql`
    DELETE FROM product_showcases
    WHERE id = ${id}
  `;

  await db.execute(query);
  
  // Verify deletion
  const showcase = await getProductShowcase(id);
  return showcase === null;
}

/**
 * Get product showcases by user ID
 */
export async function getUserProductShowcases(userId: string): Promise<ProductShowcase[]> {
  const query = sql`
    SELECT * FROM product_showcases
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return await db.execute<ProductShowcase>(query);
}

/**
 * Get video analytics for a specific product showcase
 */
export async function getProductShowcaseVideoAnalytics(showcaseId: string) {
  const showcase = await getProductShowcase(showcaseId);
  
  if (!showcase || !showcase.public_id) {
    return null;
  }
  
  // Import dynamically to avoid circular dependencies
  const { getVideoAnalytics } = require('./video-analytics');
  return getVideoAnalytics(showcase.public_id);
}

/**
 * Get featured product showcases
 */
export async function getFeaturedProductShowcases(limit: number = 10): Promise<ProductShowcase[]> {
  const query = sql`
    SELECT ps.*, u.name as user_name, u.email as user_email,
           (SELECT COUNT(*) FROM video_activities 
            WHERE resource_type = 'product_showcase' 
            AND resource_id = ps.id 
            AND activity_type = 'view') as view_count
    FROM product_showcases ps
    LEFT JOIN users u ON ps.user_id = u.id
    WHERE ps.status = 'published'
    AND ps.video_url IS NOT NULL
    ORDER BY view_count DESC, ps.created_at DESC
    LIMIT ${limit}
  `;

  return await db.execute<ProductShowcase>(query);
}

/**
 * Search product showcases
 */
export async function searchProductShowcases(query: string, limit: number = 20): Promise<ProductShowcase[]> {
  const searchQuery = `%${query}%`;
  
  const sqlQuery = sql`
    SELECT ps.*, u.name as user_name, u.email as user_email
    FROM product_showcases ps
    LEFT JOIN users u ON ps.user_id = u.id
    WHERE ps.status = 'published'
    AND (
      ps.title ILIKE ${searchQuery}
      OR ps.description ILIKE ${searchQuery}
      OR ps.category ILIKE ${searchQuery}
    )
    ORDER BY ps.created_at DESC
    LIMIT ${limit}
  `;

  return await db.execute<ProductShowcase>(sqlQuery);
}

/**
 * Count total product showcases
 */
export async function countProductShowcases(filters: {
  user_id?: string;
  category?: string;
  status?: string;
}): Promise<number> {
  const { user_id, category, status } = filters;

  // Build the WHERE clause based on filters
  const conditions = [];
  const params = [];

  if (user_id) {
    conditions.push('user_id = ?');
    params.push(user_id);
  }

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  } else {
    // Default to published showcases only
    conditions.push('status = ?');
    params.push('published');
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}` 
    : '';

  const query = `
    SELECT COUNT(*) as count
    FROM product_showcases
    ${whereClause}
  `;

  const result = await db.execute<{ count: number }>(sql.raw(query, ...params));
  return result[0]?.count || 0;
}
