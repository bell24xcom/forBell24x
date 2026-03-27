/**
 * Neon Database Service for Bell24H
 * 
 * Provides methods for interacting with Neon PostgreSQL,
 * optimized for supplier risk scoring and analytics.
 */

import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true;

// Check if we're in a serverless environment
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Create SQL query function (for serverless environments)
export const sql = neon(process.env.DATABASE_URL!);

// Create connection pool (for traditional server environments)
export const pool = !isServerless ? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection
}) : null;

/**
 * Neon Database Service
 */
class NeonDatabaseService {
  /**
   * Execute a SQL query with parameters
   */
  async query(text: string, params: any[] = []) {
    if (isServerless) {
      // Use neon for serverless environments
      return await sql([text], params);
    } else {
      // Use pool for traditional server environments
      if (!pool) throw new Error('Database pool not initialized');
      const client = await pool.connect();
      try {
        return await client.query(text, params);
      } finally {
        client.release();
      }
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplier(supplierId: number) {
    try {
      const result = await sql`
        SELECT * FROM suppliers WHERE id = ${supplierId}
      `;
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`Error getting supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Get supplier risk score and features
   */
  async getSupplierRiskScore(supplierId: number) {
    try {
      // Get risk score
      const riskResult = await sql`
        SELECT risk_score FROM suppliers WHERE id = ${supplierId}
      `;
      
      if (riskResult.length === 0) {
        return null;
      }
      
      // Get risk features (for SHAP/LIME explainability)
      const featuresResult = await sql`
        SELECT 
          feature_name, 
          feature_value, 
          feature_importance,
          feature_description
        FROM 
          supplier_risk_features 
        WHERE 
          supplier_id = ${supplierId}
        ORDER BY 
          feature_importance DESC
      `;
      
      // Format features for AI explainer
      const features = featuresResult.map(f => ({
        name: f.feature_name,
        value: f.feature_value,
        importance: f.feature_importance,
        description: f.feature_description
      }));
      
      return {
        supplierId,
        riskScore: riskResult[0].risk_score,
        features,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error getting risk score for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Save supplier risk score with features
   */
  async saveSupplierRiskScore(supplierId: number, riskScore: number, features: any[]) {
    try {
      // Start transaction
      const client = await pool?.connect();
      
      try {
        await client?.query('BEGIN');
        
        // Update risk score
        await client?.query(
          'UPDATE suppliers SET risk_score = $1, updated_at = NOW() WHERE id = $2',
          [riskScore, supplierId]
        );
        
        // Delete existing features
        await client?.query(
          'DELETE FROM supplier_risk_features WHERE supplier_id = $1',
          [supplierId]
        );
        
        // Insert new features
        for (const feature of features) {
          await client?.query(
            `INSERT INTO supplier_risk_features 
             (supplier_id, feature_name, feature_value, feature_importance, feature_description) 
             VALUES ($1, $2, $3, $4, $5)`,
            [
              supplierId, 
              feature.name, 
              feature.value, 
              feature.importance, 
              feature.description
            ]
          );
        }
        
        await client?.query('COMMIT');
        return true;
      } catch (e) {
        await client?.query('ROLLBACK');
        throw e;
      } finally {
        client?.release();
      }
    } catch (error) {
      console.error(`Error saving risk score for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Get analytics data for a specific period
   */
  async getAnalyticsData(startDate: string, endDate: string, metricType: string) {
    try {
      const result = await sql`
        SELECT 
          date, 
          metric_name, 
          metric_value, 
          category
        FROM 
          analytics_metrics
        WHERE 
          date BETWEEN ${startDate} AND ${endDate}
          AND metric_type = ${metricType}
        ORDER BY 
          date ASC
      `;
      
      return result;
    } catch (error) {
      console.error('Error getting analytics data:', error);
      throw error;
    }
  }

  /**
   * Save analytics metrics
   */
  async saveAnalyticsMetrics(metrics: any[]) {
    try {
      // Batch insert for better performance
      const values = metrics.map(m => `(
        '${m.date}', 
        '${m.metric_name}', 
        ${m.metric_value}, 
        '${m.metric_type}', 
        '${m.category}'
      )`).join(',');
      
      await this.query(`
        INSERT INTO analytics_metrics 
        (date, metric_name, metric_value, metric_type, category)
        VALUES ${values}
      `, []);
      
      return true;
    } catch (error) {
      console.error('Error saving analytics metrics:', error);
      throw error;
    }
  }

  /**
   * Get database stats
   */
  async getDatabaseStats() {
    try {
      const dbSize = await sql`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `;
      
      const tableCount = await sql`
        SELECT count(*) as count FROM information_schema.tables 
        WHERE table_schema = 'public'
      `;
      
      const tableStats = await sql`
        SELECT 
          table_name, 
          pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size,
          (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
        FROM 
          information_schema.tables t
        WHERE 
          table_schema = 'public'
        ORDER BY 
          pg_total_relation_size(quote_ident(table_name)) DESC
        LIMIT 10
      `;
      
      return {
        databaseSize: dbSize[0].size,
        tableCount: parseInt(tableCount[0].count),
        topTables: tableStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }
}

export default new NeonDatabaseService();
