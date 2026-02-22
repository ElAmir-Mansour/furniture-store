import { google } from 'googleapis';

// Email templates
const templates = {
  orderConfirmation: (order: OrderData) => ({
    subject: `Order Confirmed - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #1a2332, #2d3a4f); color: white; padding: 32px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 32px; }
          .order-number { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 24px; }
          .order-number span { font-size: 24px; font-weight: bold; font-family: monospace; }
          .success-icon { width: 64px; height: 64px; background: #10b981; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; }
          .success-icon span { color: white; font-size: 32px; }
          .items { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 24px; }
          .item { display: flex; justify-content: space-between; padding: 16px; border-bottom: 1px solid #e5e7eb; }
          .item:last-child { border-bottom: none; }
          .totals { background: #f8f9fa; padding: 16px; border-radius: 8px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-row.final { border-top: 2px solid #e5e7eb; font-weight: bold; font-size: 18px; padding-top: 16px; }
          .address { background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
          .button { display: inline-block; background: #c1a782; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FURNITURE</h1>
            <p style="margin: 8px 0 0; opacity: 0.8;">Premium Home Furnishings</p>
          </div>
          
          <div class="content">
            <div style="text-align: center; margin-bottom: 24px;">
              <div class="success-icon"><span>✓</span></div>
              <h2 style="margin: 0 0 8px;">Order Confirmed!</h2>
              <p style="color: #6b7280; margin: 0;">Thank you for your order, ${order.customerName}!</p>
            </div>
            
            <div class="order-number">
              <p style="margin: 0 0 8px; color: #6b7280;">Order Number</p>
              <span>#${order.orderNumber}</span>
            </div>
            
            <h3>Order Items</h3>
            <div class="items">
              ${order.items.map(item => `
                <div class="item">
                  <div>
                    <strong>${item.productName}</strong>
                    <br><span style="color: #6b7280;">${item.variantName} × ${item.quantity}</span>
                  </div>
                  <div style="font-weight: 500;">${item.price.toLocaleString()} EGP</div>
                </div>
              `).join('')}
            </div>
            
            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${order.subtotal.toLocaleString()} EGP</span>
              </div>
              ${order.discount > 0 ? `
                <div class="total-row" style="color: #10b981;">
                  <span>Discount</span>
                  <span>-${order.discount.toLocaleString()} EGP</span>
                </div>
              ` : ''}
              <div class="total-row">
                <span>Shipping</span>
                <span>${order.shippingFee === 0 ? 'Free' : `${order.shippingFee} EGP`}</span>
              </div>
              <div class="total-row final">
                <span>Total</span>
                <span>${order.total.toLocaleString()} EGP</span>
              </div>
            </div>
            
            <h3>Delivery Address</h3>
            <div class="address">
              <p style="margin: 0;">${order.shippingAddress.street}</p>
              <p style="margin: 8px 0 0; color: #6b7280;">${order.shippingAddress.city}, ${order.shippingAddress.governorate}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/track?token=${order.trackingToken}" class="button">
                Track Your Order
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>If you have any questions, reply to this email or contact us.</p>
            <p style="margin: 16px 0 0;">© 2026 Furniture Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderShipped: (order: OrderData) => ({
    subject: `Your Order Has Shipped - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #1a2332, #2d3a4f); color: white; padding: 32px; text-align: center; }
          .content { padding: 32px; }
          .icon { width: 64px; height: 64px; background: #06b6d4; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
          .tracking-box { background: #f8f9fa; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0; }
          .button { display: inline-block; background: #c1a782; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">FURNITURE</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="icon">🚚</div>
              <h2>Your Order is On Its Way!</h2>
              <p style="color: #6b7280;">Great news! Your order #${order.orderNumber} has been shipped.</p>
            </div>
            
            <div class="tracking-box">
              <p style="margin: 0 0 16px; color: #6b7280;">Estimated Delivery</p>
              <p style="font-size: 20px; font-weight: bold; margin: 0;">${order.estimatedDelivery || '2-4 business days'}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/track?token=${order.trackingToken}" class="button">
                Track Shipment
              </a>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 Furniture Store</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  orderDelivered: (order: OrderData) => ({
    subject: `Order Delivered - #${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #1a2332, #2d3a4f); color: white; padding: 32px; text-align: center; }
          .content { padding: 32px; text-align: center; }
          .icon { width: 64px; height: 64px; background: #10b981; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
          .button { display: inline-block; background: #c1a782; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 8px; }
          .button-outline { background: white; color: #1a2332; border: 2px solid #1a2332; }
          .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">FURNITURE</h1>
          </div>
          <div class="content">
            <div class="icon">📦</div>
            <h2>Your Order Has Been Delivered!</h2>
            <p style="color: #6b7280;">We hope you love your new furniture. Order #${order.orderNumber}.</p>
            
            <div style="margin: 32px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">Shop Again</a>
            </div>
            
            <p style="color: #6b7280;">How was your experience? We'd love to hear from you!</p>
          </div>
          <div class="footer">
            <p>© 2026 Furniture Store</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

interface OrderData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  trackingToken: string;
  items: { productName: string; variantName: string; quantity: number; price: number }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  shippingAddress: { street: string; city: string; governorate: string };
  estimatedDelivery?: string;
}

class EmailService {
  private gmail: any = null;

  private getGmailClient() {
    if (!this.gmail) {
      try {
        // Parse service account credentials from environment
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');

        const authSubject = process.env.GMAIL_FROM_EMAIL || undefined;

        const auth = new google.auth.JWT({
          email: credentials.client_email,
          key: credentials.private_key,
          scopes: ['https://www.googleapis.com/auth/gmail.send'],
          subject: authSubject,
        });

        this.gmail = google.gmail({ version: 'v1', auth });
      } catch (error) {
        console.error('[EmailService] Failed to initialize Gmail API:', error);
        return null;
      }
    }
    return this.gmail;
  }

  private async sendEmail(to: string, subject: string, html: string) {
    const gmail = this.getGmailClient();
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');

    if (!gmail || !credentials.client_email) {
      console.log('[EmailService] Gmail API not configured, skipping email:', subject);
      return { success: false, reason: 'Gmail API not configured' };
    }

    try {
      const from = process.env.GMAIL_FROM_EMAIL || credentials.client_email;

      // Create email in RFC 2822 format
      const email = [
        `From: "Furniture Store" <${from}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        html,
      ].join('\n');

      // Encode email to base64url
      const encodedEmail = Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send via Gmail API
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
        },
      });

      console.log('[EmailService] Email sent via Gmail API:', subject, 'to:', to);
      return { success: true };
    } catch (error) {
      console.error('[EmailService] Failed to send email:', error);
      return { success: false, error };
    }
  }

  async sendOrderConfirmation(order: OrderData) {
    const template = templates.orderConfirmation(order);
    return this.sendEmail(order.customerEmail, template.subject, template.html);
  }

  async sendOrderShipped(order: OrderData) {
    const template = templates.orderShipped(order);
    return this.sendEmail(order.customerEmail, template.subject, template.html);
  }

  async sendOrderDelivered(order: OrderData) {
    const template = templates.orderDelivered(order);
    return this.sendEmail(order.customerEmail, template.subject, template.html);
  }

  async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #1a2332, #2d3a4f); color: white; padding: 32px; text-align: center; }
          .content { padding: 32px; text-align: center; }
          .button { display: inline-block; background: #c1a782; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; padding: 24px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Welcome to FURNITURE</h1>
          </div>
          <div class="content">
            <h2>Hello, ${name}! 👋</h2>
            <p style="color: #6b7280;">Thank you for creating an account. You now have access to exclusive deals and order tracking.</p>
            <div style="margin: 32px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">Start Shopping</a>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 Furniture Store</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.sendEmail(email, 'Welcome to Furniture Store! 🏠', html);
  }
}

export const emailService = new EmailService();
