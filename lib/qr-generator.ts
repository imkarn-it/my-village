import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'

export type PromptPayType = 'phone' | 'tax_id' | 'ewallet'

export interface PromptPayQRConfig {
    promptpayId: string
    amount: number
}

export interface QRCodeResult {
    payload: string
    dataUrl: string // Base64 QR code image
}

/**
 * Generate PromptPay QR Code payload and image
 * @param config - PromptPay configuration (ID and amount)
 * @returns QR Code payload string and base64 image data URL
 */
export async function generatePromptPayQR(
    config: PromptPayQRConfig
): Promise<QRCodeResult> {
    // Generate PromptPay payload
    const payload = generatePayload(config.promptpayId, { amount: config.amount })

    // Generate QR code image as data URL
    const dataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        width: 300,
        margin: 2,
    })

    return {
        payload,
        dataUrl,
    }
}

/**
 * Generate a generic QR Code image from text
 * @param text - Text content for the QR code
 * @returns Base64 image data URL
 */
export async function generateQRCode(text: string): Promise<string> {
    return await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'M',
        width: 300,
        margin: 2,
    })
}

/**
 * Validate PromptPay ID format
 * @param id - PromptPay ID (phone number or tax ID)
 * @param type - Type of PromptPay ID
 * @returns true if valid, false otherwise
 */
export function validatePromptPayId(id: string, type: PromptPayType): boolean {
    // Remove all non-digit characters
    const cleanId = id.replace(/\D/g, '')

    switch (type) {
        case 'phone':
            // Thai mobile phone: 10 digits starting with 0
            return /^0[0-9]{9}$/.test(cleanId)

        case 'tax_id':
            // Thai tax ID: 13 digits
            return /^[0-9]{13}$/.test(cleanId)

        case 'ewallet':
            // E-wallet ID: could be various formats
            return cleanId.length >= 10 && cleanId.length <= 15

        default:
            return false
    }
}

/**
 * Format PromptPay ID for display
 * @param id - PromptPay ID
 * @param type - Type of PromptPay ID
 * @returns Formatted ID string
 */
export function formatPromptPayId(id: string, type: PromptPayType): string {
    const cleanId = id.replace(/\D/g, '')

    switch (type) {
        case 'phone':
            // Format: 0XX-XXX-XXXX
            return cleanId.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')

        case 'tax_id':
            // Format: X-XXXX-XXXXX-XX-X
            return cleanId.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, '$1-$2-$3-$4-$5')

        case 'ewallet':
            // Format: XXXX-XXXX-XXXX
            return cleanId.replace(/(\d{4})(?=\d)/g, '$1-')

        default:
            return cleanId
    }
}
