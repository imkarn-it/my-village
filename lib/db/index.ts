
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import * as dotenv from 'dotenv'

// Load environment variables if not already loaded
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: '.env.local' })
}

const connectionString = process.env.DATABASE_URL

// Only throw error at runtime, not during build
// During build, Next.js collects page data which shouldn't require DB
let pool: Pool | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

if (connectionString) {
    pool = new Pool({ connectionString })
    _db = drizzle(pool, { schema })
}

// Type for the db client
export type DbClient = ReturnType<typeof drizzle<typeof schema>>

// Create a properly typed proxy that throws at runtime if DATABASE_URL is missing
// This allows the build to succeed while still catching configuration errors at runtime
const dbProxy = new Proxy({} as DbClient, {
    get(_target, prop) {
        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined')
        }
        if (!_db) {
            throw new Error('Database not initialized')
        }
        return (_db as any)[prop]
    }
})

// Export db - properly typed as DbClient
export const db: DbClient = _db ?? dbProxy



