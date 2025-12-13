import { describe, expect, test, beforeEach, vi } from 'vitest'
import { userService } from '../user.service'
import { db } from '../../db'

// Mock the database
vi.mock('../../db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

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

      const mockSelect = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockUser])
        })
      })
      vi.mocked(db.select).mockReturnValue(mockSelect as any)

      const result = await userService.getUserById('user-1')

      expect(result).toEqual(mockUser)
      expect(db.select).toHaveBeenCalled()
    })

    test('should return null when user not found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([])
        })
      })
      vi.mocked(db.select).mockReturnValue(mockSelect as any)

      const result = await userService.getUserById('non-existent')

      expect(result).toBeNull()
    })

    test('should handle database errors', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockRejectedValue(new Error('Database error'))
        })
      })
      vi.mocked(db.select).mockReturnValue(mockSelect as any)

      await expect(userService.getUserById('user-1')).rejects.toThrow('Database error')
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

      const mockSelect = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockUser])
        })
      })
      vi.mocked(db.select).mockReturnValue(mockSelect as any)

      const result = await userService.getUserByEmail('test@example.com')

      expect(result).toEqual(mockUser)
    })

    test('should return null when user not found', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([])
        })
      })
      vi.mocked(db.select).mockReturnValue(mockSelect as any)

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

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockUser])
        })
      })
      vi.mocked(db.insert).mockReturnValue(mockInsert as any)

      const result = await userService.createUser(newUser)

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

      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUser])
          })
        })
      })
      vi.mocked(db.update).mockReturnValue(mockUpdate as any)

      const result = await userService.updateUser(userId, updates)

      expect(result).toEqual(mockUser)
      expect(db.update).toHaveBeenCalled()
    })

    test('should return null when user not found', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([])
          })
        })
      })
      vi.mocked(db.update).mockReturnValue(mockUpdate as any)

      const result = await userService.updateUser('non-existent', { name: 'Test' })

      expect(result).toBeNull()
    })
  })

  describe('deleteUser', () => {
    test('should delete user', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(1)
      })
      vi.mocked(db.delete).mockReturnValue(mockDelete as any)

      await expect(userService.deleteUser('user-1')).resolves.not.toThrow()
      expect(db.delete).toHaveBeenCalled()
    })

    test('should handle when user not found', async () => {
      const mockDelete = vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(0)
      })
      vi.mocked(db.delete).mockReturnValue(mockDelete as any)

      await expect(userService.deleteUser('non-existent')).resolves.not.toThrow()
    })
  })
})