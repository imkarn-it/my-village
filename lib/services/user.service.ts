import { eq } from 'drizzle-orm'
import { db } from '../db'
import { users } from '../db/schema'

export const userService = {
  async getUserById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
    return user || null
  },

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
    return user || null
  },

  async createUser(userData: {
    email: string
    name: string
    password: string
    role: 'resident' | 'admin' | 'security' | 'maintenance'
    projectId?: string
  }) {
    const [user] = await db.insert(users).values(userData).returning()
    return user
  },

  async updateUser(id: string, updates: {
    name?: string
    phone?: string
    role?: string
    [key: string]: any
  }) {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning()
    return user || null
  },

  async deleteUser(id: string) {
    const result = await db.delete(users).where(eq(users.id, id))
    return result
  },

  async listUsers(options: {
    page?: number
    limit?: number
    search?: string
    role?: string
  } = {}) {
    const { page = 1, limit = 20, search, role } = options
    const offset = (page - 1) * limit

    // @ts-ignore - Complex Drizzle query typing
    let baseQuery: any = db.select().from(users)

    if (search) {
      baseQuery = baseQuery.where(eq(users.name, `%${search}%`))
    }

    if (role) {
      baseQuery = baseQuery.where(eq(users.role, role))
    }

    const userList = await baseQuery.limit(limit).offset(offset)
    return userList
  },
}