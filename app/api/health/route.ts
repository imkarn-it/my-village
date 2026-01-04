import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

type HealthStatus = 'ok' | 'error' | 'degraded'

type HealthCheck = {
    status: HealthStatus
    latency?: number
    message?: string
}

type HealthResponse = {
    status: HealthStatus
    timestamp: string
    uptime: number
    checks: {
        database: HealthCheck
        memory: HealthCheck
    }
}

const startTime = Date.now()

/**
 * Health Check Endpoint
 * GET /api/health
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
    const checks = {
        database: await checkDatabase(),
        memory: checkMemory(),
    }

    const overallStatus = determineOverallStatus(checks)

    const response: HealthResponse = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - startTime) / 1000),
        checks,
    }

    return NextResponse.json(response, {
        status: overallStatus === 'ok' ? 200 : 503,
    })
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<HealthCheck> {
    const start = Date.now()

    try {
        // Dynamic import to prevent DATABASE_URL error during build
        const { db } = await import('@/lib/db')
        await db.execute(sql`SELECT 1`)
        return {
            status: 'ok',
            latency: Date.now() - start,
        }
    } catch (error) {
        return {
            status: 'error',
            latency: Date.now() - start,
            message: error instanceof Error ? error.message : 'Database connection failed',
        }
    }
}

/**
 * Check memory usage
 */
function checkMemory(): HealthCheck {
    if (typeof process === 'undefined' || !process.memoryUsage) {
        return { status: 'ok', message: 'Memory check not available' }
    }

    const usage = process.memoryUsage()
    const heapUsed = usage.heapUsed / 1024 / 1024 // MB
    const heapTotal = usage.heapTotal / 1024 / 1024 // MB
    const heapPercentage = (heapUsed / heapTotal) * 100

    if (heapPercentage > 90) {
        return {
            status: 'error',
            message: `High memory usage: ${heapPercentage.toFixed(1)}%`,
        }
    }

    if (heapPercentage > 75) {
        return {
            status: 'degraded',
            message: `Elevated memory usage: ${heapPercentage.toFixed(1)}%`,
        }
    }

    return {
        status: 'ok',
        message: `Memory usage: ${heapUsed.toFixed(1)}MB / ${heapTotal.toFixed(1)}MB (${heapPercentage.toFixed(1)}%)`,
    }
}

/**
 * Determine overall health status
 */
function determineOverallStatus(checks: Record<string, HealthCheck>): HealthStatus {
    const statuses = Object.values(checks).map(c => c.status)

    if (statuses.includes('error')) {
        return 'error'
    }
    if (statuses.includes('degraded')) {
        return 'degraded'
    }
    return 'ok'
}
