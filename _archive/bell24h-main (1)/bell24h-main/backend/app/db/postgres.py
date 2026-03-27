"""
PostgreSQL Database Connection (Alternative to Supabase)
Uses psycopg2 for direct PostgreSQL connection
"""
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from contextlib import contextmanager
from typing import Optional, Dict, List, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Connection pool
_pool: Optional[SimpleConnectionPool] = None

def get_pool():
    """Get or create connection pool"""
    global _pool
    if _pool is None:
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL environment variable is required")
        try:
            _pool = SimpleConnectionPool(
                minconn=1,
                maxconn=10,
                dsn=DATABASE_URL
            )
            logger.info("✅ PostgreSQL connection pool created")
        except Exception as e:
            logger.error(f"Error creating connection pool: {e}")
            raise
    return _pool

@contextmanager
def get_connection():
    """Get database connection from pool"""
    pool = get_pool()
    conn = pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        pool.putconn(conn)

def execute_query(query: str, params: tuple = None) -> List[Dict[str, Any]]:
    """Execute SELECT query and return results as list of dicts"""
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)
            return [dict(row) for row in cur.fetchall()]

def execute_one(query: str, params: tuple = None) -> Optional[Dict[str, Any]]:
    """Execute SELECT query and return single result"""
    results = execute_query(query, params)
    return results[0] if results else None

def execute_update(query: str, params: tuple = None) -> int:
    """Execute INSERT/UPDATE/DELETE and return row count"""
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            return cur.rowcount

def table_exists(table_name: str) -> bool:
    """Check if table exists"""
    query = """
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = %s
        );
    """
    result = execute_one(query, (table_name,))
    return result['exists'] if result else False

