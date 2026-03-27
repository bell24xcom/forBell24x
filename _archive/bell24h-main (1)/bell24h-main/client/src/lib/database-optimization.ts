// Database connection pool optimization
import { Pool, PoolConfig } from 'pg';

interface OptimizedPoolConfig extends PoolConfig {
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  acquireTimeoutMillis?: number;
  createTimeoutMillis?: number;
  destroyTimeoutMillis?: number;
  reapIntervalMillis?: number;
  createRetryIntervalMillis?: number;
}

export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private pool: Pool | null = null;
  private connectionCount = 0;
  private maxConnections = 20;
  private minConnections = 2;

  private constructor() {}

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  createOptimizedPool(connectionString: string): Pool {
    if (this.pool) {
      return this.pool;
    }

    const config: OptimizedPoolConfig = {
      connectionString,
      // Connection pool settings
      max: this.maxConnections,
      min: this.minConnections,
      idleTimeoutMillis: 30000, // 30 seconds
      connectionTimeoutMillis: 10000, // 10 seconds
      acquireTimeoutMillis: 60000, // 60 seconds
      createTimeoutMillis: 30000, // 30 seconds
      destroyTimeoutMillis: 5000, // 5 seconds
      reapIntervalMillis: 1000, // 1 second
      createRetryIntervalMillis: 200, // 200ms
      
      // SSL configuration for production
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined,
      } : false,
    };

    this.pool = new Pool(config as any);
    this.setupPoolEventHandlers();
    
    return this.pool;
  }

  private setupPoolEventHandlers() {
    if (!this.pool) return;

    this.pool.on('connect', () => {
      this.connectionCount++;
      console.log(`Database connection established. Total connections: ${this.connectionCount}`);
    });

    this.pool.on('remove', () => {
      this.connectionCount--;
      console.log(`Database connection removed. Total connections: ${this.connectionCount}`);
    });

    this.pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }

  async executeQuery<T = any>(
    query: string,
    params: any[] = []
  ): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const start = performance.now();
    
    try {
      const result = await this.pool.query(query, params);
      const duration = performance.now() - start;
      
      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query detected: ${duration}ms - ${query.substring(0, 100)}...`);
      }
      
      return result.rows;
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  async executeTransaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  getPoolStats() {
    return {
      totalConnections: this.connectionCount,
      maxConnections: this.maxConnections,
      minConnections: this.minConnections,
      availableConnections: this.maxConnections - this.connectionCount,
    };
  }

  async closePool() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.connectionCount = 0;
    }
  }

  // Query optimization utilities
  static optimizeQuery(query: string): string {
    // Remove unnecessary whitespace
    let optimized = query.replace(/\s+/g, ' ').trim();
    
    // Add query hints for better performance
    if (optimized.toLowerCase().includes('select') && !optimized.toLowerCase().includes('limit')) {
      // Add default limit to prevent large result sets
      optimized += ' LIMIT 1000';
    }
    
    return optimized;
  }

  // Index suggestions based on query patterns
  static suggestIndexes(queries: string[]): string[] {
    const suggestions: string[] = [];
    const tableColumns = new Map<string, Set<string>>();

    queries.forEach(query => {
      const selectMatch = query.match(/FROM\s+(\w+)/i);
      const whereMatch = query.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|$)/i);
      
      if (selectMatch && whereMatch) {
        const table = selectMatch[1];
        const conditions = whereMatch[1];
        
        if (!tableColumns.has(table)) {
          tableColumns.set(table, new Set());
        }
        
        // Extract column names from WHERE conditions
        const columnMatches = conditions.match(/(\w+)\s*[=<>!]/g);
        if (columnMatches) {
          columnMatches.forEach(match => {
            const column = match.split(/\s*[=<>!]/)[0];
            tableColumns.get(table)!.add(column);
          });
        }
      }
    });

    // Generate index suggestions
    tableColumns.forEach((columns, table) => {
      if (columns.size > 0) {
        const columnList = Array.from(columns).join(', ');
        suggestions.push(`CREATE INDEX IF NOT EXISTS idx_${table}_${Array.from(columns).join('_')} ON ${table} (${columnList});`);
      }
    });

    return suggestions;
  }
}
