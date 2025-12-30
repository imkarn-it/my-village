import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { NotificationService } from '@/lib/services/notification.service'

export async function POST() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const notifications = await NotificationService.markAllAsRead(session.user.id)

        return NextResponse.json({
            success: true,
            data: notifications,
            message: `Marked ${notifications.length} notifications as read`
        })
    } catch (error) {
        console.error('Failed to mark all as read:', error)
        return NextResponse.json({ success: false, error: 'Failed to mark all as read' }, { status: 500 })
    }
}
