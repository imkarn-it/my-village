/**
 * Payment Gateway Abstract Interface
 * This provides a common interface for all payment gateway providers
 */

export interface PaymentGatewayConfig {
    publicKey: string
    secretKey: string
    merchantId?: string
    sandboxMode?: boolean
}

export interface CreatePaymentParams {
    amount: number
    currency?: string
    description?: string
    referenceId: string // Bill ID
    callbackUrl?: string
    returnUrl?: string
}

export interface PaymentResponse {
    success: boolean
    paymentId?: string
    paymentUrl?: string
    qrCode?: string
    error?: string
}

export interface VerifyPaymentParams {
    paymentId: string
    transactionId?: string
}

export interface VerifyPaymentResponse {
    success: boolean
    status: 'pending' | 'completed' | 'failed' | 'cancelled'
    amount?: number
    paidAt?: Date
    transactionId?: string
    error?: string
}

/**
 * Base Payment Gateway Interface
 */
export interface IPaymentGateway {
    /**
     * Initialize the payment gateway with configuration
     */
    initialize(config: PaymentGatewayConfig): void

    /**
     * Create a new payment
     */
    createPayment(params: CreatePaymentParams): Promise<PaymentResponse>

    /**
     * Verify payment status
     */
    verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResponse>

    /**
     * Handle webhook callback
     */
    handleWebhook(payload: any): Promise<VerifyPaymentResponse>
}

/**
 * Payment Gateway Factory
 * Returns the appropriate gateway instance based on provider
 */
export type PaymentGatewayProvider = 'gb_primepay' | 'omise' | 'stripe'

export function createPaymentGateway(
    provider: PaymentGatewayProvider,
    config: PaymentGatewayConfig
): IPaymentGateway {
    switch (provider) {
        case 'gb_primepay':
            // TODO: Implement GB Prime Pay
            throw new Error('GB Prime Pay integration not yet implemented')

        case 'omise':
            // TODO: Implement Omise
            throw new Error('Omise integration not yet implemented')

        case 'stripe':
            // TODO: Implement Stripe
            throw new Error('Stripe integration not yet implemented')

        default:
            throw new Error(`Unknown payment gateway provider: ${provider}`)
    }
}
