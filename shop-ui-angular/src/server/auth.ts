import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/postgres-js';
import { connection } from './db';
import { schema } from './auth-schema';

if (!connection) {
  throw new Error('DATABASE_URL is required for auth');
}

const db = drizzle(connection, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ['http://localhost:4200'],
  secret: process.env['AUTH_SECRET'] || '',
});
