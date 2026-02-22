import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

interface PaymobConfig {
    apiKey: string;
    integrationId: string;
    iframeId: string;
    walletIntegrationId?: string;
    hmacSecret: string;
}

interface AuthResponse {
    token: string;
}

interface OrderResponse {
    id: number;
    created_at: string;
    delivery_needed: boolean;
    merchant: object;
    collector: null;
    amount_cents: number;
    shipping_data: object;
    currency: string;
    is_payment_locked: boolean;
    is_return: boolean;
    is_cancel: boolean;
    is_returned: boolean;
    is_canceled: boolean;
    items: object[];
}

interface PaymentKeyResponse {
    token: string;
}

interface BillingData {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    street: string;
    building: string;
    floor: string;
    apartment: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
}

interface OrderItem {
    name: string;
    amount_cents: number;
    description: string;
    quantity: number;
}

class PaymobClient {
    private config: PaymobConfig;
    private client: AxiosInstance;
    private authToken: string | null = null;
    private tokenExpiry: number = 0;

    constructor() {
        this.config = {
            apiKey: process.env.PAYMOB_API_KEY || '',
            integrationId: process.env.PAYMOB_INTEGRATION_ID || '',
            iframeId: process.env.PAYMOB_IFRAME_ID || '',
            walletIntegrationId: process.env.PAYMOB_WALLET_INTEGRATION_ID,
            hmacSecret: process.env.PAYMOB_HMAC_SECRET || '',
        };

        this.client = axios.create({
            baseURL: 'https://accept.paymob.com/api',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Step 1: Authentication Request
    async authenticate(): Promise<string> {
        const now = Date.now();

        // Return cached token if still valid (1 hour expiry)
        if (this.authToken && this.tokenExpiry > now) {
            return this.authToken;
        }

        const response = await this.client.post<AuthResponse>('/auth/tokens', {
            api_key: this.config.apiKey,
        });

        this.authToken = response.data.token;
        this.tokenExpiry = now + 3600000; // 1 hour

        return this.authToken;
    }

    // Step 2: Order Registration
    async createOrder(
        amountCents: number,
        currency: string = 'EGP',
        items: OrderItem[] = [],
        merchantOrderId?: string
    ): Promise<OrderResponse> {
        const token = await this.authenticate();

        const response = await this.client.post<OrderResponse>('/ecommerce/orders', {
            auth_token: token,
            delivery_needed: false,
            amount_cents: amountCents,
            currency: currency,
            items: items,
            merchant_order_id: merchantOrderId,
        });

        return response.data;
    }

    // Step 3: Payment Key Request
    async getPaymentKey(
        orderId: number,
        amountCents: number,
        billingData: BillingData,
        currency: string = 'EGP',
        integrationId?: string
    ): Promise<string> {
        const token = await this.authenticate();

        const response = await this.client.post<PaymentKeyResponse>('/acceptance/payment_keys', {
            auth_token: token,
            amount_cents: amountCents,
            expiration: 3600, // 1 hour
            order_id: orderId,
            billing_data: billingData,
            currency: currency,
            integration_id: parseInt(integrationId || this.config.integrationId),
        });

        return response.data.token;
    }

    // Get iframe URL for card payments
    getIframeUrl(paymentKey: string): string {
        return `https://accept.paymob.com/api/acceptance/iframes/${this.config.iframeId}?payment_token=${paymentKey}`;
    }

    // Verify HMAC from callback
    verifyHmac(data: Record<string, string | number | boolean>, receivedHmac: string): boolean {
        // Paymob HMAC verification fields in specific order
        const hmacFields = [
            'amount_cents',
            'created_at',
            'currency',
            'error_occured',
            'has_parent_transaction',
            'id',
            'integration_id',
            'is_3d_secure',
            'is_auth',
            'is_capture',
            'is_refunded',
            'is_standalone_payment',
            'is_voided',
            'order',
            'owner',
            'pending',
            'source_data_pan',
            'source_data_sub_type',
            'source_data_type',
            'success',
        ];

        const concatenated = hmacFields
            .map((field) => {
                const value = data[field];
                if (typeof value === 'boolean') {
                    return value ? 'true' : 'false';
                }
                return String(value ?? '');
            })
            .join('');

        const calculatedHmac = crypto
            .createHmac('sha512', this.config.hmacSecret)
            .update(concatenated)
            .digest('hex');

        return calculatedHmac === receivedHmac;
    }

    // Complete payment flow helper
    async initiatePayment(
        amountInEGP: number,
        billingData: BillingData,
        items: OrderItem[] = [],
        merchantOrderId?: string
    ): Promise<{
        orderId: number;
        paymentKey: string;
        iframeUrl: string;
    }> {
        const amountCents = Math.round(amountInEGP * 100);

        // Create order
        const order = await this.createOrder(amountCents, 'EGP', items, merchantOrderId);

        // Get payment key
        const paymentKey = await this.getPaymentKey(order.id, amountCents, billingData);

        // Get iframe URL
        const iframeUrl = this.getIframeUrl(paymentKey);

        return {
            orderId: order.id,
            paymentKey,
            iframeUrl,
        };
    }

    // Mobile wallet payment
    async initiateMobileWalletPayment(
        amountInEGP: number,
        billingData: BillingData,
        walletNumber: string,
        merchantOrderId?: string
    ): Promise<{
        orderId: number;
        redirectUrl: string;
    }> {
        const amountCents = Math.round(amountInEGP * 100);

        // Create order
        const order = await this.createOrder(amountCents, 'EGP', [], merchantOrderId);

        // Get payment key for wallet
        const paymentKey = await this.getPaymentKey(
            order.id,
            amountCents,
            billingData,
            'EGP',
            this.config.walletIntegrationId
        );

        // Initiate wallet payment
        const response = await this.client.post<{ redirect_url: string }>('/acceptance/payments/pay', {
            source: {
                identifier: walletNumber,
                subtype: 'WALLET',
            },
            payment_token: paymentKey,
        });

        return {
            orderId: order.id,
            redirectUrl: response.data.redirect_url,
        };
    }
}

// Singleton instance
const globalForPaymob = globalThis as unknown as {
    paymob: PaymobClient | undefined;
};

export const paymob = globalForPaymob.paymob ?? new PaymobClient();

if (process.env.NODE_ENV !== 'production') globalForPaymob.paymob = paymob;

export default paymob;
