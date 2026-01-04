import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Dynamic imports to prevent DATABASE_URL error during build
        const { auth } = await import('@/lib/auth')
        const { NotificationService } = await import('@/lib/services/notification.service')

        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const notification = await NotificationService.markAsRead(id, session.user.id)

        if (!notification) {
            return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: notification })
    } catch (error) {
        console.error('Failed to mark notification as read:', error)
        return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 })
    }
}
