
#!/usr/bin/env node

const { execSync } = require('child_process');

const dbType = process.env.DATABASE_TYPE || 'postgresql';
const action = process.argv[2] || 'push';

console.log(`Running ${action} for database type: ${dbType}`);

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

try {
  const command = `npx drizzle-kit ${action} --config=${drizzleConfig}`;
  console.log(`Executing: ${command}`);
  
  execSync(command, { 
    stdio: 'inherit',
    env: { ...process.env, DATABASE_TYPE: dbType }
  });
  
  console.log(`Migration ${action} completed successfully!`);
} catch (error) {
  console.error(`Migration ${action} failed:`, error.message);
  process.exit(1);
}
