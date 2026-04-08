import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  TEST_DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(10),
  ADMIN_NAME: z.string().default('Admin'),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
  ADMIN_DEPARTMENT: z.string().default('Management'),
});

const parsedEnv = envSchema.parse(process.env);

if (parsedEnv.NODE_ENV === 'test') {
  if (!parsedEnv.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL must be defined for E2E tests inside .env');
  }
  parsedEnv.DATABASE_URL = parsedEnv.TEST_DATABASE_URL;
}

export const env = parsedEnv;
