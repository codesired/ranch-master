
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { Pool, neonConfig } from '@neondatabase/serverless';
import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

export type DatabaseType = 'postgresql' | 'mysql' | 'sqlite';

export interface DatabaseConfig {
  type: DatabaseType;
  url?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  filename?: string; // For SQLite
}

export class DatabaseProvider {
  private static instance: any;
  private static config: DatabaseConfig;

  static initialize(config: DatabaseConfig) {
    DatabaseProvider.config = config;
    
    switch (config.type) {
      case 'postgresql':
        return DatabaseProvider.initPostgreSQL(config);
      case 'mysql':
        return DatabaseProvider.initMySQL(config);
      case 'sqlite':
        return DatabaseProvider.initSQLite(config);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }

  private static initPostgreSQL(config: DatabaseConfig) {
    if (!config.url) {
      throw new Error("PostgreSQL URL is required");
    }
    
    const pool = new Pool({ connectionString: config.url });
    DatabaseProvider.instance = drizzle({ client: pool, schema });
    return DatabaseProvider.instance;
  }

  private static initMySQL(config: DatabaseConfig) {
    const connectionConfig = config.url ? 
      config.url : 
      {
        host: config.host || 'localhost',
        port: config.port || 3306,
        user: config.user || 'root',
        password: config.password || '',
        database: config.database || 'ranch_manager'
      };

    const connection = mysql.createPool(connectionConfig);
    DatabaseProvider.instance = drizzleMysql(connection, { schema, mode: 'default' });
    return DatabaseProvider.instance;
  }

  private static initSQLite(config: DatabaseConfig) {
    const filename = config.filename || config.url || 'ranch_manager.db';
    const sqlite = new Database(filename);
    DatabaseProvider.instance = drizzleSqlite(sqlite, { schema });
    return DatabaseProvider.instance;
  }

  static getDb() {
    if (!DatabaseProvider.instance) {
      throw new Error("Database not initialized. Call DatabaseProvider.initialize() first.");
    }
    return DatabaseProvider.instance;
  }

  static getConfig() {
    return DatabaseProvider.config;
  }
}
