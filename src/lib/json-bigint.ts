/**
 * BigInt Safe JSON Serialization Helper
 * Converts BigInt values to strings before JSON serialization
 * Prevents "Do not know how to serialize a BigInt" errors in Vercel
 */

export const safeJson = (data: any): any => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (value && typeof value === 'object' && value.constructor === Object) {
        // Handle nested objects
        const result: any = {};
        for (const [key, val] of Object.entries(value)) {
          result[key] = typeof val === 'bigint' ? val.toString() : val;
        }
        return result;
      }
      return value;
    })
  );
};

/**
 * Safe JSON Response helper for Next.js API routes
 */
export const safeJsonResponse = (data: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(safeJson(data)), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
};

/**
 * Convert Prisma result to safe JSON
 */
export const prismaToSafeJson = <T>(result: T): T => {
  return safeJson(result) as T;
};
