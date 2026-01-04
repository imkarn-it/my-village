import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
    try {
        // Dynamic imports to prevent DATABASE_URL error during build
        const { auth } = await import('@/lib/auth')
        const { NotificationService } = await import('@/lib/services/notification.service')

        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const notifications = await NotificationService.getByUserId(session.user.id)
        const unreadCount = await NotificationService.getUnreadCount(session.user.id)

        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount
        })
    } catch (error) {
        console.error('Failed to fetch notifications:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 })
    }
}
