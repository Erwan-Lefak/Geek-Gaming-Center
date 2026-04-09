"use strict";
/**
 * Database Connection - PostgreSQL + pgvector
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
exports.getRedis = getRedis;
exports.closeConnections = closeConnections;
const pg_1 = require("pg");
const ioredis_1 = __importDefault(require("ioredis"));
// Singleton pattern for connections
let pool = null;
let redisClient = null;
function getPool() {
    if (!pool) {
        pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/geek_gaming_db",
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }
    return pool;
}
function getRedis() {
    if (!redisClient) {
        redisClient = new ioredis_1.default(process.env.REDIS_URL || "redis://localhost:6379", {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                return Math.min(times + 1, 3);
            },
        });
    }
    return redisClient;
}
async function closeConnections() {
    if (pool) {
        await pool.end();
        pool = null;
    }
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
    }
}
//# sourceMappingURL=connection.js.map