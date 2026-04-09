/**
 * Database Connection - PostgreSQL + pgvector
 */
import { Pool } from "pg";
import Redis from "ioredis";
export declare function getPool(): Pool;
export declare function getRedis(): Redis;
export declare function closeConnections(): Promise<void>;
//# sourceMappingURL=connection.d.ts.map