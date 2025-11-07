import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

// Crear base de datos SQLite para desarrollo
const sqlite = new Database('dev.db');
export const db = drizzle(sqlite, { schema });

console.log("🚀 Usando base de datos SQLite para desarrollo");