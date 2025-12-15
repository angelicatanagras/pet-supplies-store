# Email Notifications Setup Guide

This application uses email notifications to keep customers informed about their appointments and purchases.

## Email Configuration

The application uses Nodemailer to send emails through SMTP. It works with any SMTP provider including Gmail, Outlook, and dedicated email services.

## Setup Instructions

### Option 1: Gmail (Recommended for Testing)

#### 1. Enable App Passwords

For security, Gmail requires App Passwords instead of your regular password:

1. Go to your Google Account: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Select **Security** from the left menu
3. Under "How you sign in to Google," enable **2-Step Verification** (if not already enabled)
4. Once 2-Step is enabled, go back to Security
5. Under "How you sign in to Google," click **App passwords**
6. Select app: **Mail**
7. Select device: **Other (Custom name)** - enter "Pet Store App"
8. Click **Generate**
9. Copy the 16-character password (remove spaces)

#### 2. Configure Environment Variables

Add to your `.env` file:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 16-char app password from step 1
EMAIL_FROM_NAME=Pet Supplies Store
```

#### 3. Test

Create a new appointment with your email address and check your inbox for the confirmation email.

---

### Option 2: Outlook/Hotmail

#### 1. Configure Environment Variables

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM_NAME=Pet Supplies Store
```

No app password needed for Outlook - use your regular password.

---

### Option 3: Other SMTP Providers

#### Popular SMTP Services:

**SendGrid** (Free tier: 100 emails/day)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Mailgun** (Free tier: 5,000 emails/month)
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASSWORD=your-mailgun-smtp-password
```

**AWS SES** (Free tier: 62,000 emails/month)
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-ses-username
EMAIL_PASSWORD=your-aws-ses-password
```

---

### Development Mode (No Email Sending)

If you don't configure email credentials, the app runs in **TEST MODE**:

```env
EMAIL_USER=your-email@gmail.com  # Leave as placeholder
EMAIL_PASSWORD=your-app-password-here  # Leave as placeholder
```

In test mode:
- No actual emails are sent
- Email content is logged to the server console
- Great for testing without setting up email

---

## Email Notifications

### Appointment Booking Confirmation

When a customer books a grooming appointment, they automatically receive an email with:
- Pet name and service type
- Date and time
- Formatted HTML email with branding

**Example:**
```
Subject: Grooming Appointment Confirmed for Max

Hi John,

Your grooming appointment for Max has been confirmed.

Pet Name: Max
Service: Full Grooming
Date: December 10, 2025
Time: 10:00 AM

We look forward to seeing you and Max!
```

### Order/Purchase Confirmation

When a customer makes a purchase, they receive:
- Order number
- Itemized list of products
- Total amount
- Professional HTML email template

---

## Testing Email Notifications

### Without Configuration (Test Mode)

1. Leave email credentials as placeholders in `.env`
2. Create a test appointment
3. Check your server terminal/logs for output:

```
═══════════════════════════════════════════
EMAIL TEST MODE - Message would have been sent:
To: customer@example.com
Subject: Grooming Appointment Confirmed for Max
Content:
[Email content here]
═══════════════════════════════════════════
```

### With Real Email Configuration

1. Configure Gmail App Password (see instructions above)
2. Update `.env` with your credentials
3. Restart the development server: `npm run dev`
4. Create a test appointment with your email
5. Check your inbox for the confirmation email
6. Check spam folder if not received

---

## Troubleshooting

### Email Not Sending

**Check server logs** for error messages:
```bash
# Look for these in your terminal where npm run dev is running
Email sent successfully: <message-id>
# OR
Error sending email: [error details]
```

**Common Issues:**

1. **Gmail "Less secure app" error**
   - Solution: Use App Password (not regular password)
   - Enable 2-Step Verification first

2. **Wrong credentials**
   - Double-check email and password in `.env`
   - Make sure there are no extra spaces
   - Restart server after changing `.env`

3. **Port blocked**
   - Try port 465 with `EMAIL_PORT=465` (SSL)
   - Some networks block port 587

4. **Emails going to spam**
   - Add your email to contacts
   - Check spam folder
   - Mark as "Not Spam"

### Test Mode Not Working

If logs aren't showing:
1. Make sure email credentials are placeholders
2. Check terminal where `npm run dev` is running
3. Look for the "EMAIL TEST MODE" message

---

## Email Templates

The application includes professional HTML email templates with:
- Branded header with color
- Responsive design (mobile-friendly)
- Clean formatting
- Professional footer

You can customize templates in `/src/lib/email.ts`

---

## Security Best Practices

1. **Never commit credentials** to version control
   - Keep `.env` in `.gitignore`
   - Use `.env.example` for documentation

2. **Use App Passwords** for Gmail
   - Never use your main Google password
   - Revoke app passwords when not needed

3. **Rotate credentials** periodically
   - Change passwords every 6-12 months
   - Update `.env` file

4. **Monitor usage**
   - Check email logs for unusual activity
   - Set up alerts for high volume sending

---

## Cost Comparison

### Free Options
- **Gmail**: Free (with daily sending limits ~500/day)
- **Outlook**: Free (with daily limits ~300/day)
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free

### Paid Options (for high volume)
- **SendGrid**: $19.95/month for 50,000 emails
- **Mailgun**: $35/month for 50,000 emails
- **AWS SES**: $0.10 per 1,000 emails

**Recommendation:**
- **Testing/Low Volume**: Gmail with App Password (free)
- **Medium Volume**: SendGrid or Mailgun free tier
- **High Volume**: AWS SES (most cost-effective)

---

## Support

For issues with:
- **Email service**: Check server logs and troubleshooting section
- **Gmail**: [Google Account Help](https://support.google.com/accounts)
- **Application**: Check this documentation

---

## Appendix: Email HTML Preview

Emails are sent with beautiful HTML templates including:
- Header with brand colors
- Appointment/order details in a styled card
- Professional footer
- Mobile-responsive design

The plain text version is also included for email clients that don't support HTML.
