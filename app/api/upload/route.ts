import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File
        const bucket = formData.get("bucket") as string
        const folder = formData.get("folder") as string || "uploads"

        if (!file || !bucket) {
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

        // Create Supabase Admin Client to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const fileExt = file.name.split(".").pop()
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { error } = await supabase.storage
            .from(bucket)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (error) {
            console.error("Supabase storage error:", error)
            return new NextResponse("Upload failed", { status: 500 })
        }

        // Delete old file if provided
        const oldUrl = formData.get("oldUrl") as string
        if (oldUrl) {
            try {
                // Extract path from URL
                // URL format: https://.../storage/v1/object/public/bucket/folder/filename
                const urlParts = oldUrl.split(`${bucket}/`)
                if (urlParts.length > 1) {
                    const oldPath = urlParts[1]
                    await supabase.storage.from(bucket).remove([oldPath])
                }
            } catch (err) {
                console.error("Error deleting old file:", err)
                // Continue even if delete fails
            }
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)

        return NextResponse.json({ url: publicUrl })

    } catch (error) {
        console.error("Upload error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
