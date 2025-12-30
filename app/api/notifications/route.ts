import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { NotificationService } from '@/lib/services/notification.service'

export async function GET() {
    try {
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
