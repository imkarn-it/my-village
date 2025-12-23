import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "@/lib/services/cloudinary.service"

interface UploadResult {
    success: boolean
    url?: string
    error?: string
}

/**
 * Upload a payment slip to Cloudinary
 * @param file - File to upload
 * @param billId - Bill ID for organizing files
 * @returns Upload result with public URL or error
 */
export async function uploadPaymentSlip(
    file: File,
    billId: string
): Promise<UploadResult> {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Cloudinary in payment-slips folder
        const publicUrl = await uploadToCloudinary(buffer, 'payment-slips')

        return {
            success: true,
            url: publicUrl,
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
 * Delete a payment slip from Cloudinary
 * @param url - Public URL of the file to delete
 * @returns Success status
 */
export async function deletePaymentSlip(url: string): Promise<boolean> {
    try {
        const publicId = getPublicIdFromUrl(url)
        if (!publicId) return false

        await deleteFromCloudinary(publicId)
        return true
    } catch (err) {
        console.error('Delete error:', err)
        return false
    }
}
