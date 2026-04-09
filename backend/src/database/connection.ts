/**
 * Database Connection - PostgreSQL + pgvector
 */

import { Pool } from "pg";
import Redis from "ioredis";

// Singleton pattern for connections
let pool: Pool | null = null;
let redisClient: Redis | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/geek_gaming_db",
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(
      process.env.REDIS_URL || "redis://localhost:6379",
      {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          return Math.min(times + 1, 3);
        },
      }
    );
  }
  return redisClient;
}

export async function closeConnections() {
  if (pool) {
    await pool.end();
    pool = null;
  }
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
