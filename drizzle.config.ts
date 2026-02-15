import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || '',
    // Using Postgres SSL configuration workaround
    ssl: process.env.DATABASE_SSL === 'true' ? true : undefined
  },
  // Verbose output for better debugging during migration
  verbose: true,
  // Strict mode for safer migrations
  strict: true,
} satisfies Config;
