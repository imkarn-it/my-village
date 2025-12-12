import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
    try {
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

        // Create Supabase Admin Client to bypass RLS
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // Generate unique filename
        const timestamp = Date.now()
        const fileExt = file.name.split('.').pop()
        const fileName = `slips/${billId}_${timestamp}.${fileExt}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { error } = await supabase.storage
            .from('payment-slips')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (error) {
            console.error("Supabase storage error:", error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        const { data: { publicUrl } } = supabase.storage
            .from('payment-slips')
            .getPublicUrl(fileName)

        return NextResponse.json({ success: true, url: publicUrl })

    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        )
    }
}
