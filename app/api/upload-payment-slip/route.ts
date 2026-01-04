import { NextResponse } from "next/server"
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "@/lib/services/cloudinary.service"

export async function POST(req: Request) {
    try {
        // Dynamic import to prevent DATABASE_URL error during build
        const { auth } = await import("@/lib/auth")

        const session = await auth()
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            )
        }

        const formData = await req.formData()
        const file = formData.get("file") as File
        const billId = formData.get("billId") as string
        const oldUrl = formData.get("oldUrl") as string

        if (!file || !billId) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validate file type (images only)
        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                { success: false, error: "Invalid file type" },
                { status: 400 }
            )
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: "File too large (max 10MB)" },
                { status: 400 }
            )
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Cloudinary in payment-slips folder
        const publicUrl = await uploadToCloudinary(buffer, 'payment-slips')

        // Delete old file if provided
        if (oldUrl) {
            const oldPublicId = getPublicIdFromUrl(oldUrl)
            if (oldPublicId) {
                try {
                    await deleteFromCloudinary(oldPublicId)
                } catch (err) {
                    console.error("Error deleting old payment slip from Cloudinary:", err)
                }
            }
        }

        return NextResponse.json({ success: true, url: publicUrl })

    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        )
    }
}
