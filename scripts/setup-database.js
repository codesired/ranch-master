
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dbType = process.env.DATABASE_TYPE || 'postgresql';

console.log(`Setting up database for: ${dbType}`);

// Create directories
const migrationsDir = path.join('migrations', dbType);
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
  console.log(`Created migrations directory: ${migrationsDir}`);
}

// Create uploads directory
const uploadsDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
