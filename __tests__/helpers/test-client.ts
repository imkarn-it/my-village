import { eq } from 'drizzle-orm'
import { db } from '../../../lib/db'
import { users } from '../../../lib/db/schema'

export interface TestResponse {
  status: number
  data: any
  error?: string
}

export class TestClient {
  private baseUrl: string
  private authTokens: Map<string, string> = new Map()

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  async setup() {
    // Create test admin user
    const hashedPassword = await this.hashPassword('TestAdmin123!')

    const [admin] = await db.insert(users).values({
      email: 'admin@test.com',
      name: 'Test Admin',
      password: hashedPassword,
      role: 'admin',
    }).returning()

    // Get admin token
    const loginResponse = await this.request('POST', '/api/auth/login', {
      body: {
        email: 'admin@test.com',
        password: 'TestAdmin123!',
      },
    })

    if (loginResponse.data?.token) {
      this.authTokens.set('admin', loginResponse.data.token)
    }
  }

  async cleanup() {
    // Clean up test users
    await db.delete(users).where(eq(users.email, 'admin@test.com'))
    await db.delete(users).where(eq(users.email, 'testuser@example.com'))
    await db.delete(users).where(eq(users.email, 'regular@example.com'))
  }

  async request(method: string, endpoint: string, options: {
    body?: any
    auth?: string
    headers?: Record<string, string>
  } = {}): Promise<TestResponse> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add authorization header
    if (options.auth) {
      const token = this.authTokens.get(options.auth) || options.auth
      headers['Authorization'] = `Bearer ${token}`
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    }

    if (options.body && method !== 'GET') {
      requestOptions.body = JSON.stringify(options.body)
    }

    try {
      const response = await fetch(url, requestOptions)
      const data = await response.json().catch(() => null)

      return {
        status: response.status,
        data,
        error: data?.error || response.statusText,
      }
    } catch (error) {
      return {
        status: 500,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs')
    return bcrypt.hash(password, 10)
  }

  // Helper methods for common operations
  async createTestUser(userData: {
    email: string
    name: string
    role: 'resident' | 'admin' | 'security' | 'maintenance'
  }) {
    const hashedPassword = await this.hashPassword('TestPass123!')

    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
    }).returning()

    return user
  }

  async loginTestUser(email: string, password: string = 'TestPass123!') {
    const response = await this.request('POST', '/api/auth/login', {
      body: { email, password },
    })

    return response.data?.token
  }

  // Create test data helpers
  async createTestFacility(data: Partial<{
    name: string
    description: string
    capacity: number
    hourlyRate: number
  }> = {}) {
    const facility = {
      name: data.name || 'Test Facility',
      description: data.description || 'Test facility description',
      capacity: data.capacity || 10,
      hourlyRate: data.hourlyRate || 100,
    }

    const response = await this.request('POST', '/api/facilities', {
      body: facility,
      auth: 'admin',
    })

    return response.data
  }

  async createTestBooking(userId: string, facilityId: string, data: Partial<{
    startTime: string
    endTime: string
    purpose: string
  }> = {}) {
    const booking = {
      userId,
      facilityId,
      startTime: data.startTime || new Date(Date.now() + 86400000).toISOString(),
      endTime: data.endTime || new Date(Date.now() + 90000000).toISOString(),
      purpose: data.purpose || 'Test booking',
    }

    const response = await this.request('POST', '/api/bookings', {
      body: booking,
      auth: 'admin',
    })

    return response.data
  }

  async createTestAnnouncement(data: Partial<{
    title: string
    content: string
    priority: 'low' | 'medium' | 'high'
  }> = {}) {
    const announcement = {
      title: data.title || 'Test Announcement',
      content: data.content || 'Test announcement content',
      priority: data.priority || 'medium',
    }

    const response = await this.request('POST', '/api/announcements', {
      body: announcement,
      auth: 'admin',
    })

    return response.data
  }
}