import type { NextAuthConfig } from "next-auth"

/**
 * Auth configuration for NextAuth.js
 * Separated from main auth file for edge compatibility
 */

export const authConfig = {
    pages: {
        signIn: "/login",
        signOut: "/logout",
        error: "/login",
        newUser: "/register",
    },
    callbacks: {
        authorized({ auth }) {
            return !!auth?.user
        },
        session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
            }
            if (session.user && token.role) {
                session.user.role = token.role as string
            }
            if (session.user && token.projectId) {
                (session.user as any).projectId = token.projectId as string
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id
                token.role = user.role
                token.projectId = (user as any).projectId
            }
            return token
        },
    },
    providers: [], // Configured in auth.ts
    session: {
        strategy: "jwt",
    },
    trustHost: true,
} satisfies NextAuthConfig
