
import { DatabaseProvider } from './database-providers';

// Parse database configuration from environment
const getDatabaseConfig = () => {
  const dbType = (process.env.DATABASE_TYPE || 'postgresql').toLowerCase();
  
  switch (dbType) {
    case 'mysql':
      return {
        type: 'mysql' as const,
        url: process.env.DATABASE_URL,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      };
    
    case 'sqlite':
      return {
        type: 'sqlite' as const,
        filename: process.env.DATABASE_URL || process.env.SQLITE_FILE || 'ranch_manager.db'
      };
    
    default: // postgresql
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL must be set for PostgreSQL. Did you forget to provision a database?");
      }
      return {
        type: 'postgresql' as const,
        url: process.env.DATABASE_URL
      };
  }
};

const config = getDatabaseConfig();
export const db = DatabaseProvider.initialize(config);
export { DatabaseProvider };
