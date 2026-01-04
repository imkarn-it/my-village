
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

// Export the db instance - uses a Proxy to provide better error messages if accessed when DATABASE_URL is missing
export const db = new Proxy({} as DbClient, {
    get(target, prop) {
        // If db is available, return the real property
        if (_db) {
            return (_db as any)[prop]
        }

        // Special case for some Drizzle internals or checks
        if (prop === 'then' || prop === 'constructor' || typeof prop === 'symbol') {
            return undefined
        }

        throw new Error(
            `❌ Database connection failed: Cannot access 'db.${String(prop)}' because DATABASE_URL is not defined. ` +
            `Check your environment variables.`
        )
    }
})

/**
 * Safe getter that returns the REAL Drizzle instance.
 * Use this when passing the db to external libraries like Auth.js
 */
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




