import { describe, expect, test, beforeAll, afterAll } from 'vitest'
import { TestClient } from '../../helpers/test-client'

const client = new TestClient()

describe('Users API', () => {
  let testUserId: string
  const testUser = {
    email: 'testuser@example.com',
    name: 'Test User',
    password: 'TestPass123!',
    role: 'resident' as const,
  }

  beforeAll(async () => {
    // Setup test database and auth
    await client.setup()
  })

  afterAll(async () => {
    // Cleanup
    await client.cleanup()
  })

  describe('POST /api/users', () => {
    test('should create a new user', async () => {
      const response = await client.request('POST', '/api/users', {
        body: testUser,
        auth: 'admin', // Use admin token
      })

      expect(response.status).toBe(201)
      expect(response.data).toMatchObject({
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
      })
      expect(response.data).toHaveProperty('id')
      expect(response.data).not.toHaveProperty('password')

      testUserId = response.data.id
    })

    test('should reject duplicate email', async () => {
      const response = await client.request('POST', '/api/users', {
        body: testUser,
        auth: 'admin',
      })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Email already exists')
    })

    test('should validate required fields', async () => {
      const response = await client.request('POST', '/api/users', {
        body: { name: 'Test' },
        auth: 'admin',
      })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Email is required')
    })
  })

  describe('GET /api/users', () => {
    test('should list users with pagination', async () => {
      const response = await client.request('GET', '/api/users', {
        auth: 'admin',
      })

      expect(response.status).toBe(200)
      expect(response.data).toHaveProperty('users')
      expect(response.data).toHaveProperty('pagination')
      expect(Array.isArray(response.data.users)).toBe(true)
      expect(response.data.users.length).toBeGreaterThan(0)
    })

    test('should filter by role', async () => {
      const response = await client.request('GET', '/api/users?role=resident', {
        auth: 'admin',
      })

      expect(response.status).toBe(200)
      expect(response.data.users.every((user: any) => user.role === 'resident')).toBe(true)
    })

    test('should search by name', async () => {
      const response = await client.request('GET', '/api/users?search=Test User', {
        auth: 'admin',
      })

      expect(response.status).toBe(200)
      expect(response.data.users.some((user: any) => user.name.includes('Test User'))).toBe(true)
    })
  })

  describe('GET /api/users/:id', () => {
    test('should get user by ID', async () => {
      const response = await client.request('GET', `/api/users/${testUserId}`, {
        auth: 'admin',
      })

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        id: testUserId,
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
      })
    })

    test('should return 404 for non-existent user', async () => {
      const response = await client.request('GET', '/api/users/non-existent', {
        auth: 'admin',
      })

      expect(response.status).toBe(404)
      expect(response.error).toContain('User not found')
    })

    test('should allow users to view their own profile', async () => {
      // First login as the test user
      const loginResponse = await client.request('POST', '/api/auth/login', {
        body: {
          email: testUser.email,
          password: testUser.password,
        },
      })

      const { token } = loginResponse.data

      // Then get their own profile
      const response = await client.request('GET', `/api/users/${testUserId}`, {
        auth: token,
      })

      expect(response.status).toBe(200)
      expect(response.data.id).toBe(testUserId)
    })
  })

  describe('PATCH /api/users/:id', () => {
    test('should update user details', async () => {
      const updates = {
        name: 'Updated Name',
        phone: '0812345678',
      }

      const response = await client.request('PATCH', `/api/users/${testUserId}`, {
        body: updates,
        auth: 'admin',
      })

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject(updates)
    })

    test('should validate phone number format', async () => {
      const updates = {
        phone: 'invalid-phone',
      }

      const response = await client.request('PATCH', `/api/users/${testUserId}`, {
        body: updates,
        auth: 'admin',
      })

      expect(response.status).toBe(400)
      expect(response.error).toContain('Invalid phone number')
    })
  })

  describe('DELETE /api/users/:id', () => {
    test('should delete user', async () => {
      const response = await client.request('DELETE', `/api/users/${testUserId}`, {
        auth: 'admin',
      })

      expect(response.status).toBe(200)
    })

    test('should verify user is deleted', async () => {
      const response = await client.request('GET', `/api/users/${testUserId}`, {
        auth: 'admin',
      })

      expect(response.status).toBe(404)
    })
  })

  describe('Authentication', () => {
    test('should reject unauthenticated requests', async () => {
      const response = await client.request('GET', '/api/users')

      expect(response.status).toBe(401)
    })

    test('should reject non-admin users from accessing all users', async () => {
      // Create a regular user
      const userResponse = await client.request('POST', '/api/users', {
        body: {
          email: 'regular@example.com',
          name: 'Regular User',
          password: 'TestPass123!',
          role: 'resident',
        },
        auth: 'admin',
      })
      const userId = userResponse.data.id

      // Login as regular user
      const loginResponse = await client.request('POST', '/api/auth/login', {
        body: {
          email: 'regular@example.com',
          password: 'TestPass123!',
        },
      })
      const { token } = loginResponse.data

      // Try to access all users list
      const response = await client.request('GET', '/api/users', {
        auth: token,
      })

      expect(response.status).toBe(403)
      expect(response.error).toContain('Admin access required')

      // Cleanup
      await client.request('DELETE', `/api/users/${userId}`, {
        auth: 'admin',
      })
    })
  })
})