import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import * as dotenv from 'dotenv'

// Load environment variables if not already loaded
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: '.env.local' })
}

const connectionString = process.env.DATABASE_URL!

if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
}

// Create connection pool
const pool = new Pool({
    connectionString,
})

// Create drizzle instance
export const db = drizzle(pool, { schema })

// Export types
export type DbClient = typeof db
