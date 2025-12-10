/**
 * Service Layer
 * 
 * All services follow these principles:
 * 1. Pure business logic (no HTTP concerns)
 * 2. Database operations centralized here
 * 3. Reusable across API routes and other services
 * 4. Throw errors for API to handle
 * 5. Type-safe inputs and outputs
 */

export * from './announcement.service'
export * from './bill.service'
export * from './maintenance.service'
export * from './facility.service'
export * from './booking.service'
