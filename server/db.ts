// Reference: javascript_database blueprint integration
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";

// Configuración según el entorno
let db: any;

if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  // Producción: usar PostgreSQL con Neon
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema });
} else {
  // Desarrollo: usar SQLite
  console.log('🚀 Usando SQLite para desarrollo');
  const sqlite = new Database('dev.db');
  db = drizzleSqlite({ client: sqlite, schema });
}

export { db };
