import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "@/lib/services/cloudinary.service"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File
        const folder = formData.get("folder") as string || "uploads"

        if (!file) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            return new NextResponse("Invalid file type", { status: 400 })
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return new NextResponse("File too large", { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Cloudinary
        const publicUrl = await uploadToCloudinary(buffer, folder)

        // Delete old file if provided
        const oldUrl = formData.get("oldUrl") as string
        if (oldUrl) {
            const oldPublicId = getPublicIdFromUrl(oldUrl)
            if (oldPublicId) {
                try {
                    await deleteFromCloudinary(oldPublicId)
                } catch (err) {
                    console.error("Error deleting old file from Cloudinary:", err)
                }
            }
        }

        return NextResponse.json({ url: publicUrl })

    } catch (error) {
        console.error("Upload error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { url } = await req.json()
        if (!url) {
            return new NextResponse("Missing URL", { status: 400 })
        }

        const publicId = getPublicIdFromUrl(url)
        if (!publicId) {
            return new NextResponse("Invalid URL", { status: 400 })
        }

        await deleteFromCloudinary(publicId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
