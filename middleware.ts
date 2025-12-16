import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Routes that don't require authentication
const publicRoutes = ["/login", "/register", "/", "/api"];

// Routes that require specific roles
const roleRoutes: Record<string, string[]> = {
    "/resident": ["resident", "admin", "super_admin"],
    "/admin": ["admin", "super_admin"],
    "/security": ["security", "admin", "super_admin"],
    "/maintenance": ["maintenance", "admin", "super_admin"],
    "/super-admin": ["super_admin"],
};

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session?.user;
    const pathname = nextUrl.pathname;

    // Allow public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        // If logged in and trying to access login/register, redirect to dashboard
        if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
            const redirectUrl = getRedirectUrlForRole(session?.user?.role || "resident");
            return NextResponse.redirect(new URL(redirectUrl, nextUrl));
        }

        // If logged in and accessing root, redirect to dashboard
        if (isLoggedIn && pathname === "/") {
            const redirectUrl = getRedirectUrlForRole(session?.user?.role || "resident");
            return NextResponse.redirect(new URL(redirectUrl, nextUrl));
        }

        return NextResponse.next();
    }

    // Require authentication for protected routes
    if (!isLoggedIn) {
        const callbackUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(
            new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
        );
    }

    // Check role-based access
    const userRole = session?.user?.role || "resident";

    for (const [routePrefix, allowedRoles] of Object.entries(roleRoutes)) {
        if (pathname.startsWith(routePrefix)) {
            if (!allowedRoles.includes(userRole)) {
                // Redirect to appropriate dashboard based on role
                const redirectUrl = getRedirectUrlForRole(userRole);
                return NextResponse.redirect(new URL(redirectUrl, nextUrl));
            }
        }
    }

    return NextResponse.next();
});

function getRedirectUrlForRole(role: string): string {
    switch (role) {
        case "admin":
            return "/admin";
        case "security":
            return "/security";
        case "maintenance":
            return "/maintenance";
        case "super_admin":
            return "/super-admin";
        default:
            return "/resident";
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
