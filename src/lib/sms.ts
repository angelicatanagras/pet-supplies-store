// Multi-Provider SMS Service
// Supports: Semaphore (Philippines), Twilio (International), and more

type SMSProvider = 'semaphore' | 'twilio' | 'none';

interface SendSMSParams {
  phone: string;
  message: string;
}

interface SMSProviderConfig {
  provider: SMSProvider;
  apiKey: string;
  senderId: string;
  // Twilio specific
  accountSid?: string;
  authToken?: string;
  twilioPhone?: string;
}

class SMSService {
  private config: SMSProviderConfig;

  constructor() {
    const provider = (process.env.SMS_PROVIDER || 'none') as SMSProvider;

    this.config = {
      provider,
      apiKey: process.env.SMS_API_KEY || process.env.SEMAPHORE_API_KEY || '',
      senderId: process.env.SMS_SENDER_ID || 'PetStore',
      // Twilio specific
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      twilioPhone: process.env.TWILIO_PHONE_NUMBER,
    };
  }

  private formatPhoneNumber(phone: string, provider: SMSProvider): string {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    if (provider === 'semaphore') {
      // Philippine format (63XXXXXXXXXX)
      if (digitsOnly.startsWith('63')) return digitsOnly;
      if (digitsOnly.startsWith('0')) return `63${digitsOnly.substring(1)}`;
      return `63${digitsOnly}`;
    }

    if (provider === 'twilio') {
      // International format with + prefix
      if (digitsOnly.startsWith('63')) return `+${digitsOnly}`;
      if (digitsOnly.startsWith('0')) return `+63${digitsOnly.substring(1)}`;
      if (phone.startsWith('+')) return phone;
      return `+${digitsOnly}`;
    }

    return digitsOnly;
  }

  private async sendViaSemaphore({ phone, message }: SendSMSParams): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone, 'semaphore');

      const response = await fetch('https://api.semaphore.co/api/v4/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          apikey: this.config.apiKey,
          number: formattedPhone,
          message: message,
          sendername: this.config.senderId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.length > 0 && data[0].status === 'success') {
        console.log('SMS sent successfully via Semaphore:', data);
        return true;
      } else {
        console.error('Semaphore SMS failed:', data);
        return false;
      }
    } catch (error) {
      console.error('Error sending SMS via Semaphore:', error);
      return false;
    }
  }

  private async sendViaTwilio({ phone, message }: SendSMSParams): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone, 'twilio');
      const { accountSid, authToken, twilioPhone } = this.config;

      if (!accountSid || !authToken || !twilioPhone) {
        console.error('Twilio credentials not configured');
        return false;
      }

      const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
          },
          body: new URLSearchParams({
            To: formattedPhone,
            From: twilioPhone,
            Body: message,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log('SMS sent successfully via Twilio:', data);
        return true;
      } else {
        console.error('Twilio SMS failed:', data);
        return false;
      }
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      return false;
    }
  }

  async sendSMS({ phone, message }: SendSMSParams): Promise<boolean> {
    // If no provider configured, log the message but don't fail
    if (this.config.provider === 'none' || !this.config.apiKey) {
      console.log('═══════════════════════════════════════════');
      console.log('SMS API not configured. Message would have been sent:');
      console.log(`Provider: ${this.config.provider}`);
      console.log(`To: ${phone}`);
      console.log(`Message:\n${message}`);
      console.log('═══════════════════════════════════════════');
      return true;
    }

    try {
      switch (this.config.provider) {
        case 'semaphore':
          return await this.sendViaSemaphore({ phone, message });
        case 'twilio':
          return await this.sendViaTwilio({ phone, message });
        default:
          console.error(`Unknown SMS provider: ${this.config.provider}`);
          return false;
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  async sendAppointmentConfirmation({
    customerName,
    phone,
    petName,
    service,
    date,
    time,
  }: {
    customerName: string;
    phone: string;
    petName: string;
    service: string;
    date: string;
    time: string;
  }): Promise<boolean> {
    const message = `Hi ${customerName}! Your grooming appointment for ${petName} is confirmed.

Service: ${service}
Date: ${new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })}
Time: ${time}

Thank you for choosing our pet grooming service!`;

    return this.sendSMS({ phone, message });
  }

  async sendAppointmentReminder({
    customerName,
    phone,
    petName,
    service,
    date,
    time,
  }: {
    customerName: string;
    phone: string;
    petName: string;
    service: string;
    date: string;
    time: string;
  }): Promise<boolean> {
    const message = `Reminder: ${customerName}, your pet ${petName} has a grooming appointment tomorrow at ${time}.

Service: ${service}

See you then!`;

    return this.sendSMS({ phone, message });
  }

  async sendOrderConfirmation({
    customerName,
    phone,
    orderNumber,
    total,
  }: {
    customerName: string;
    phone: string;
    orderNumber: string;
    total: number;
  }): Promise<boolean> {
    const message = `Thank you for your purchase, ${customerName}!

Order #: ${orderNumber}
Total: ₱${total.toFixed(2)}

We appreciate your business!`;

    return this.sendSMS({ phone, message });
  }
}

export const smsService = new SMSService();
