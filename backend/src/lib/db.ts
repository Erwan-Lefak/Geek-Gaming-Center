/**
 * Database Module - Geek Gaming Center
 * Singleton Pool configuration
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

let pool: Pool | null = null;

/**
 * Obtenir ou créer le pool de connexion
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://erwan:erwan@localhost:5432/geek_gaming_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

/**
 * Fermer le pool et réinitialiser
 */
export function closePool(): void {
  if (pool) {
    pool.end();
    pool = null;
  }
}
