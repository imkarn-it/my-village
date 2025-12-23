import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

/**
 * Credentials validation schema
 */
const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

type CredentialsInput = z.infer<typeof credentialsSchema>

/**
 * Finds a user by email and verifies password
 */
async function authenticateUser(
    email: string,
    password: string
): Promise<{ id: string; email: string; name: string | null; role: string; projectId: string | null } | null> {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
        columns: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            projectId: true,
        },
    })

    if (!user?.password) {
        return null
    }

    const passwordsMatch = await bcrypt.compare(password, user.password)

    if (!passwordsMatch) {
        return null
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        projectId: user.projectId,
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    adapter: DrizzleAdapter(db),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = credentialsSchema.safeParse(credentials)
                if (!parsed.success) {
                    return null
                }

                const { email, password } = parsed.data
                return authenticateUser(email, password)
            },
        }),
    ],
})
