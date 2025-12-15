// Email Service for Notifications
import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const emailPort = parseInt(process.env.EMAIL_PORT || '587');

    // If credentials are not configured, use test mode
    if (!emailUser || !emailPassword || emailUser === 'your-email@gmail.com') {
      console.log('Email service running in TEST MODE (no credentials configured)');
      this.transporter = null;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });

      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  async sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
    // Test mode - log to console instead of sending
    if (!this.transporter) {
      console.log('═══════════════════════════════════════════');
      console.log('EMAIL TEST MODE - Message would have been sent:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content:\n${text || html.replace(/<[^>]*>/g, '')}`);
      console.log('═══════════════════════════════════════════');
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Pet Supplies Store'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendAppointmentConfirmation({
    customerName,
    email,
    petName,
    service,
    date,
    time,
  }: {
    customerName: string;
    email: string;
    petName: string;
    service: string;
    date: string;
    time: string;
  }): Promise<boolean> {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const subject = `Grooming Appointment Confirmed for ${petName}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .appointment-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .detail-value { color: #111827; }
            .footer { background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>Your grooming appointment for <strong>${petName}</strong> has been confirmed.</p>

              <div class="appointment-details">
                <div class="detail-row">
                  <span class="detail-label">Pet Name:</span>
                  <span class="detail-value">${petName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Service:</span>
                  <span class="detail-value">${service}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">${time}</span>
                </div>
              </div>

              <p>We look forward to seeing you and ${petName}!</p>
              <p>If you need to reschedule or have any questions, please contact us.</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing our pet grooming service!</p>
              <p>Pet Supplies Store</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Hi ${customerName},

Your grooming appointment for ${petName} has been confirmed.

Pet Name: ${petName}
Service: ${service}
Date: ${formattedDate}
Time: ${time}

We look forward to seeing you and ${petName}!

Thank you for choosing our pet grooming service!
Pet Supplies Store`;

    return this.sendEmail({ to: email, subject, html, text });
  }

  async sendOrderConfirmation({
    customerName,
    email,
    orderNumber,
    total,
    items,
  }: {
    customerName: string;
    email: string;
    orderNumber: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    const subject = `Order Confirmation - ${orderNumber}`;

    const itemsHtml = items
      .map(
        (item) => `
        <div class="detail-row">
          <span>${item.name} (x${item.quantity})</span>
          <span>₱${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .order-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .total-row { display: flex; justify-content: space-between; padding: 15px 0; font-size: 18px; font-weight: bold; margin-top: 10px; }
            .footer { background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${customerName},</p>
              <p>Thank you for your purchase! Your order has been confirmed.</p>

              <div class="order-details">
                <h3>Order #${orderNumber}</h3>
                ${itemsHtml}
                <div class="total-row">
                  <span>Total:</span>
                  <span>₱${total.toFixed(2)}</span>
                </div>
              </div>

              <p>We appreciate your business!</p>
            </div>
            <div class="footer">
              <p>Thank you for shopping with us!</p>
              <p>Pet Supplies Store</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const itemsText = items
      .map((item) => `${item.name} (x${item.quantity}) - ₱${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const text = `Hi ${customerName},

Thank you for your purchase! Your order has been confirmed.

Order #${orderNumber}

Items:
${itemsText}

Total: ₱${total.toFixed(2)}

We appreciate your business!

Thank you for shopping with us!
Pet Supplies Store`;

    return this.sendEmail({ to: email, subject, html, text });
  }
}

export const emailService = new EmailService();
