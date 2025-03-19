# Setup Instructions for Plaid Webhooks and Historical Transactions

This document provides instructions for setting up Plaid webhooks to receive real-time transaction updates and retrieve historical transaction data.

## Why Use Webhooks?

1. **Real-time Updates**: Get notified immediately when new transactions occur
2. **Historical Data**: Receive webhooks when historical data (up to 24 months) becomes available
3. **Reliability**: Avoid missing transactions due to API limitations

## Webhook Setup Steps

### 1. Set Up Public URL with Ngrok

Plaid needs a public URL to send webhooks to. For development, use ngrok:

```bash
# Install ngrok if you haven't already
npm install -g ngrok

# Start ngrok tunnel to your local server (replace 5001 with your port)
ngrok http 5001
```

Note the HTTPS URL provided by ngrok (e.g., `https://a1b2c3d4.ngrok.io`).

### 2. Update Environment Variables

Edit your `.env` file to include the webhook URL:

```
WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/plaid/webhook
```

### 3. Verify Webhook in Plaid Dashboard

1. Log in to the [Plaid Dashboard](https://dashboard.plaid.com/)
2. Go to Platform > Developers > API > Allowed redirect URIs (Add ngrok link "https://your-ngrok-url.ngrok.io/api/plaid/webhook", it will ask for password, only 'Jashanjot Gill' has access to this)

## Accessing Historical Transactions

- Click button "Fetch Historical Transactions (24 Months)" on "plaid-setup/page.tsx" after connecting to bank account using plaid which calls the following route.
- Call the `/api/plaid/transactions/historical` endpoint after connecting an account to fetch up to 24 months of transaction history.

## Troubleshooting

If webhooks aren't working:

1. Check if your ngrok URL is correct in your `.env` file
2. Confirm that your server is running and accessible via the ngrok URL
3. Check server logs for webhook receipt
4. Verify in Plaid Dashboard that webhooks are being sent

## Future Considerations

For production (NOTE):

1. Use a stable, public HTTPS URL instead of ngrok
