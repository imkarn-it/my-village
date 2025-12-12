import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Use Service Role Key to bypass RLS (admin access)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

interface UploadResult {
    success: boolean
    url?: string
    error?: string
}

/**
 * Upload a payment slip to Supabase Storage
 * @param file - File to upload
 * @param billId - Bill ID for organizing files
 * @returns Upload result with public URL or error
 */
export async function uploadPaymentSlip(
    file: File,
    billId: string
): Promise<UploadResult> {
    try {
        // Generate unique filename with timestamp
        const timestamp = Date.now()
        const fileExt = file.name.split('.').pop()
        const fileName = `${billId}_${timestamp}.${fileExt}`
        const filePath = `slips/${fileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('payment-slips')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (error) {
            console.error('Upload error:', error)
            return {
                success: false,
                error: error.message,
            }
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('payment-slips')
            .getPublicUrl(filePath)

        return {
            success: true,
            url: urlData.publicUrl,
        }
    } catch (err) {
        console.error('Upload exception:', err)
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
        }
    }
}

/**
 * Delete a payment slip from Supabase Storage
 * @param url - Public URL of the file to delete
 * @returns Success status
 */
export async function deletePaymentSlip(url: string): Promise<boolean> {
    try {
        // Extract file path from URL
        const path = url.split('/payment-slips/').pop()
        if (!path) return false

        const { error } = await supabase.storage
            .from('payment-slips')
            .remove([path])

        return !error
    } catch (err) {
        console.error('Delete error:', err)
        return false
    }
}
