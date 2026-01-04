
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import * as dotenv from 'dotenv'

// Load environment variables if not already loaded
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: '.env.local' })
}

const connectionString = process.env.DATABASE_URL

// Type for the db client
export type DbClient = ReturnType<typeof drizzle<typeof schema>>

// Create db instance only if DATABASE_URL is available
let _pool: Pool | null = null
let _db: DbClient | null = null

if (connectionString) {
    _pool = new Pool({ connectionString })
    _db = drizzle(_pool, { schema })
}

// Export the db instance - may be null during build if no DATABASE_URL
// Runtime code should handle null or use getDb() for safety
export const db = _db as DbClient

// Safe getter that throws a helpful error if db is not initialized
export function getDb(): DbClient {
    if (!_db) {
        throw new Error('DATABASE_URL is not defined - database is not available')
    }
    return _db
}

// Check if database is available
export function isDatabaseAvailable(): boolean {
    return _db !== null
}




