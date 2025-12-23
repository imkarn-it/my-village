import { describe, expect, test, beforeEach, vi } from 'vitest'

// Mock the database
vi.mock('../../db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Import after mock is set up
import { db } from '../../db'

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserById', () => {
    test('should return user when found', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'resident',
      }

      const mockBuilder = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser])
          })
        })
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

      // Import service after mock
      const { userService } = await import('../user.service')
      const result = await userService.getUserById('user-1')

      expect(result).toEqual(mockUser)
      expect(db.select).toHaveBeenCalled()
    })

    test('should return null when user not found', async () => {
      const mockBuilder = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

      const { userService } = await import('../user.service')
      const result = await userService.getUserById('non-existent')

      expect(result).toBeNull()
    })

    test('should handle database errors', async () => {
      const mockBuilder = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

      const { userService } = await import('../user.service')

      try {
        await userService.getUserById('user-1')
        expect(true).toBe(false)
      } catch (e: unknown) {
        expect((e as Error).message).toBe('Database error')
      }
    })
  })

  describe('getUserByEmail', () => {
    test('should return user when found', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'resident',
      }

      const mockBuilder = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser])
          })
        })
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

      const { userService } = await import('../user.service')
      const result = await userService.getUserByEmail('test@example.com')

      expect(result).toEqual(mockUser)
    })

    test('should return null when user not found', async () => {
      const mockBuilder = {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([])
          })
        })
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

      const { userService } = await import('../user.service')
      const result = await userService.getUserByEmail('nonexistent@example.com')

      expect(result).toBeNull()
    })
  })

  describe('createUser', () => {
    test('should create and return user', async () => {
      const newUser = {
        email: 'new@example.com',
        name: 'New User',
        password: 'hashedpassword',
        role: 'resident',
      }

      const mockUser = {
        id: 'new-user-id',
        ...newUser,
        createdAt: new Date(),
      }

      const mockBuilder = {
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockUser])
        })
      };
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

      const { userService } = await import('../user.service')
      const result = await userService.createUser(newUser as Parameters<typeof userService.createUser>[0])

      expect(result).toEqual(mockUser)
      expect(db.insert).toHaveBeenCalled()
    })
  })

  describe('updateUser', () => {
    test('should update and return user', async () => {
      const userId = 'user-1'
      const updates = {
        name: 'Updated Name',
        phone: '0812345678',
      }

      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Updated Name',
        phone: '0812345678',
        role: 'resident',
      }

      const mockBuilder = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUser])
          })
        })
      };
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

      const { userService } = await import('../user.service')
      const result = await userService.updateUser(userId, updates)

      expect(result).toEqual(mockUser)
      expect(db.update).toHaveBeenCalled()
    })

    test('should return null when user not found', async () => {
      const mockBuilder = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([])
          })
        })
      };
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

      const { userService } = await import('../user.service')
      const result = await userService.updateUser('non-existent', { name: 'Test' })

      expect(result).toBeNull()
    })
  })

  describe('deleteUser', () => {
    test('should delete user', async () => {
      const mockBuilder = {
        where: vi.fn().mockResolvedValue(1)
      };
      (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

      const { userService } = await import('../user.service')
      await userService.deleteUser('user-1')
      expect(db.delete).toHaveBeenCalled()
    })

    test('should handle when user not found', async () => {
      const mockBuilder = {
        where: vi.fn().mockResolvedValue(0)
      };
      (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(mockBuilder)

      const { userService } = await import('../user.service')
      await userService.deleteUser('non-existent')
    })
  })
})