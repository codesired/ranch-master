


import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const dbType = process.env.DATABASE_TYPE || 'sqlite';

console.log(`Setting up database for: ${dbType}`);

// Create directories
const migrationsDir = join('migrations', dbType);
if (!existsSync(migrationsDir)) {
  mkdirSync(migrationsDir, { recursive: true });
  console.log(`Created migrations directory: ${migrationsDir}`);
}

// Create uploads directory
const uploadsDir = process.env.UPLOAD_PATH || './uploads';
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadsDir}`);
}

// Run database migrations
try {
  let drizzleConfig;
  switch (dbType) {
    case 'mysql':
      drizzleConfig = 'drizzle.config.mysql.ts';
      break;
    case 'sqlite':
      drizzleConfig = 'drizzle.config.sqlite.ts';
      break;
    default:
      drizzleConfig = 'drizzle.config.ts';
  }

  console.log(`Running migrations with config: ${drizzleConfig}`);
  execSync(`npx drizzle-kit push --config=${drizzleConfig}`, { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_TYPE: dbType }
  });
  
  console.log('Database setup completed successfully!');
} catch (error) {
  console.error('Database setup failed:', error.message);
  process.exit(1);
}
