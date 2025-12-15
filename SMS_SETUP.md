# SMS Notifications Setup Guide

This application uses SMS notifications to keep customers informed about their bookings and purchases.

## Supported SMS Providers

The application supports multiple SMS providers:

### 1. **Semaphore** (Recommended for Philippines)
- 🇵🇭 Philippine-based provider
- ✅ Best for local businesses
- 💰 Competitive pricing (~₱0.50-₱1.00/SMS)
- 🔗 [semaphore.co](https://semaphore.co/)

### 2. **Twilio** (International)
- 🌍 Global coverage
- ✅ Best for international businesses
- 💰 Pay-as-you-go pricing (varies by country)
- 🔗 [twilio.com](https://www.twilio.com/)

### 3. **None** (Development Mode)
- 🔧 For testing without sending real SMS
- ✅ Logs messages to console
- 💰 Free

## Setup Instructions

Choose one provider and follow its setup guide:

---

## Option A: Semaphore Setup (Philippines)

### 1. Create Account
1. Go to [https://semaphore.co/](https://semaphore.co/)
2. Sign up for a free account
3. Verify your account through email

### 2. Get API Key
1. Log in to your Semaphore dashboard
2. Navigate to "API" section
3. Copy your API key

### 3. Configure Environment Variables
Add to your `.env` file:

```env
SMS_PROVIDER=semaphore
SEMAPHORE_API_KEY=your-api-key-here
SMS_SENDER_ID=PetStore
```

### 4. Purchase Credits
1. Go to your Semaphore dashboard
2. Navigate to "Billing" or "Credits"
3. Purchase SMS credits (~₱0.50-₱1.00 per SMS)

---

## Option B: Twilio Setup (International)

### 1. Create Account
1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Sign up for a free trial account
3. Verify your account (phone + email)

### 2. Get Credentials
1. Log in to Twilio Console
2. Find your **Account SID** and **Auth Token** on dashboard
3. Go to "Phone Numbers" and get a Twilio number

### 3. Configure Environment Variables
Add to your `.env` file:

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
SMS_SENDER_ID=PetStore
```

### 4. Add Credits
1. Add payment method in Twilio Console
2. Pay-as-you-go pricing (varies by country)
3. Trial account includes $15 credit

**Twilio Pricing Examples:**
- USA: ~$0.0075/SMS
- Philippines: ~$0.035/SMS
- International rates vary

---

## Option C: Development Mode (No SMS)

For testing without sending real SMS:

```env
SMS_PROVIDER=none
SMS_SENDER_ID=PetStore
```

All SMS will be logged to console instead of being sent.

## SMS Notifications

### Appointment Booking Confirmation

When a customer books a grooming appointment, they automatically receive an SMS with:
- Pet name
- Service type
- Date and time
- Confirmation message

**Example:**
```
Hi John! Your grooming appointment for Max is confirmed.

Service: Full Grooming
Date: Dec 10, 2025
Time: 10:00 AM

Thank you for choosing our pet grooming service!
```

### Order/Purchase Confirmation

When a customer makes a purchase (if phone number is provided), they receive:
- Order number
- Total amount
- Thank you message

**Example:**
```
Thank you for your purchase, Maria!

Order #: ORD-1733339200-0001
Total: ₱1,250.00

We appreciate your business!
```

## Testing SMS Notifications

### Without API Key (Development)

If no API key is configured, the SMS service will:
- Log the message to the console
- Continue processing without errors
- Allow you to test the flow without sending actual SMS

Check your server logs to see the SMS messages that would have been sent.

### With API Key (Production)

Once configured with a valid API key:
1. Create a test appointment with a real phone number
2. Check that the SMS is received
3. Verify the message format and content

## Phone Number Format

The system automatically formats phone numbers to Philippine format:
- Input: `0917 123 4567` → Output: `639171234567`
- Input: `917 123 4567` → Output: `639171234567`
- Input: `63917 123 4567` → Output: `639171234567`

## Cost Comparison

### Semaphore (Philippines)
- Philippine networks: ~₱0.50 - ₱1.00 per SMS
- Volume discounts available
- No monthly fees
- Pay per SMS only

### Twilio (International)
- USA: ~$0.0075/SMS (~₱0.42)
- Philippines: ~$0.035/SMS (~₱2.00)
- International rates vary
- Free trial: $15 credit
- No monthly fees

### Cost Estimates (Monthly)
- **100 SMS/month**: ₱50-100 (Semaphore) | $3-4 (Twilio)
- **500 SMS/month**: ₱250-500 (Semaphore) | $18-20 (Twilio)
- **1000 SMS/month**: ₱500-1000 (Semaphore) | $35-40 (Twilio)

**Recommendation:**
- Use **Semaphore** for Philippine customers (lower cost)
- Use **Twilio** for international customers or advanced features

## Troubleshooting

### SMS Not Sending

1. **Check API Key**: Ensure your API key is correct in `.env`
2. **Check Credits**: Verify you have sufficient SMS credits
3. **Check Logs**: Look at server logs for error messages
4. **Phone Format**: Ensure phone numbers are in correct format

### SMS Delayed

- SMS delivery can take 5-30 seconds
- Check Semaphore dashboard for delivery status
- Network congestion can cause delays

### Testing Tips

1. Use your own phone number for initial tests
2. Test with different phone formats
3. Monitor the Semaphore dashboard for delivery reports
4. Check spam/blocked messages on recipient phone

## Security Notes

- Never commit your API key to version control
- Keep `.env` file in `.gitignore`
- Rotate API keys periodically
- Monitor SMS usage for unusual activity

## Support

For issues with:
- **Semaphore API**: Contact [support@semaphore.co](mailto:support@semaphore.co)
- **Application SMS**: Check server logs and this documentation
