import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { NotificationService } from '@/lib/services/notification.service'

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const notification = await NotificationService.delete(id, session.user.id)

        if (!notification) {
            return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: notification })
    } catch (error) {
        console.error('Failed to delete notification:', error)
        return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 })
    }
}
