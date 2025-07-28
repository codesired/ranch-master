
export interface AppConfig {
  port: number;
  nodeEnv: string;
  sessionSecret: string;
  corsOrigins: string[];
  database: {
    type: 'postgresql' | 'mysql' | 'sqlite';
    url?: string;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    filename?: string;
  };
  security: {
    bcryptRounds: number;
    sessionMaxAge: number;
    rateLimitWindowMs: number;
    rateLimitMax: number;
  };
  logging: {
    level: string;
    enableRequestLogging: boolean;
  };
  uploads: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    uploadPath: string;
  };
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5000'],
  
  database: {
    type: (process.env.DATABASE_TYPE as any) || 'postgresql',
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    filename: process.env.SQLITE_FILE,
  },

  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || (process.env.NODE_ENV === 'development' ? '1000' : '100'), 10)
  },

  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
  },

  uploads: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
