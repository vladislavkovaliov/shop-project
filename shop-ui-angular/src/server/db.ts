import postgres from 'postgres';

const connectionString = process.env['DATABASE_URL'] || '';

export const connection = connectionString ? postgres(connectionString) : null;
