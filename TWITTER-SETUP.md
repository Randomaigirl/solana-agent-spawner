# Twitter Bot Setup Guide

Getting @randomaigirl live on Twitter! 🔥

## Prerequisites

- Twitter account: @randomaigirl (already created)
- Credentials in `x-credentials.md`

## Step 1: Twitter Developer Portal

1. Go to https://developer.twitter.com/
2. Sign in with @randomaigirl credentials
3. Apply for Developer Account (if not done)
   - Use case: "AI agent providing blockchain intelligence"
   - Expected usage: "Responding to mentions with Solana market data"

## Step 2: Create App

1. In Developer Portal → Projects & Apps
2. Create a new Project: "RandomAiGirl Bot"
3. Create an App under this project: "randomaigirl-bot"
4. Save these credentials:
   - **API Key** (Consumer Key)
   - **API Secret** (Consumer Secret)
   - **Bearer Token**

## Step 3: OAuth 2.0 User Context

We need OAuth 2.0 to post/reply as @randomaigirl.

### Option A: OAuth 2.0 (Recommended)

1. In App Settings → User Authentication Settings
2. Enable OAuth 2.0
3. Type of App: Web App
4. Callback URL: `http://localhost:3000/callback` (for local testing)
5. Website URL: `https://github.com/Randomaigirl/solana-agent-spawner`
6. Scopes needed:
   - `tweet.read` - Read tweets
   - `tweet.write` - Post tweets
   - `users.read` - Read user profiles
   - `offline.access` - Refresh tokens
7. Save **Client ID** and **Client Secret**

### Option B: OAuth 1.0a (Simpler but older)

1. In App Settings → Keys and Tokens
2. Generate Access Token and Secret
3. Save:
   - **Access Token**
   - **Access Token Secret**

## Step 4: Create .env File

Create `.env` in project root:

```bash
# Twitter API Credentials
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_SECRET=your_access_secret_here

# OR for OAuth 2.0
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

## Step 5: Install Twitter Library

We'll use the official Twitter API v2 library:

```bash
npm install twitter-api-v2
```

## Step 6: Update twitter-client.ts

Replace the stub implementation with real Twitter API calls:

```typescript
import { TwitterApi } from 'twitter-api-v2';

export class TwitterClient {
  private client: TwitterApi;
  
  constructor(config: TwitterConfig) {
    // OAuth 1.0a (simpler)
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  }

  async tweet(text: string) {
    return await this.client.v2.tweet(text);
  }

  async reply(tweetId: string, text: string) {
    return await this.client.v2.reply(text, tweetId);
  }

  async getMentions(sinceId?: string) {
    const user = await this.client.v2.me();
    return await this.client.v2.userMentionTimeline(user.data.id, {
      since_id: sinceId,
      max_results: 10,
    });
  }
}
```

## Step 7: Test Locally

```bash
# Start the bot
npm run twitter-bot
```

You should see:
```
🔥 @randomaigirl Twitter Bot ONLINE
Listening for mentions...
```

## Step 8: Test with a Tweet

1. From another account, tweet: "@randomaigirl what are whales buying?"
2. Bot should respond within 30 seconds
3. Check console for logs

## Step 9: Deploy (Production)

For 24/7 operation, deploy to a server:

### Option A: Railway.app (Easy)
1. Push code to GitHub
2. Connect Railway to repo
3. Set environment variables
4. Deploy (auto-restarts on crash)

### Option B: DigitalOcean / AWS
1. Create a small VM ($5/month)
2. Clone repo
3. Install Node.js
4. Set up PM2: `pm2 start npm --name "twitter-bot" -- run twitter-bot`
5. Enable auto-restart: `pm2 startup`

### Option C: Keep Local (Testing)
Just keep it running on your machine for the hackathon.

## Monitoring

Watch logs to see mentions and replies:

```bash
npm run twitter-bot

# Or with PM2
pm2 logs twitter-bot
```

## Rate Limits

Twitter API v2 (Free tier):
- **50 tweets/day** per user
- **50 mentions retrieved/15min**
- **50 timeline requests/15min**

For hackathon, this is plenty. For production, upgrade to Basic ($100/month).

## Troubleshooting

**"Invalid credentials"**
- Double-check API keys in .env
- Make sure OAuth tokens are for @randomaigirl account
- Check App Permissions (must allow reading + writing)

**"Forbidden"**
- Check app permissions in Developer Portal
- Regenerate Access Token if needed
- Make sure OAuth 1.0a is enabled

**Bot not responding**
- Check if server is running: `npm run twitter-bot`
- Check API server: `npm run rag` (must be running)
- Check logs for errors

**Rate limited**
- Wait 15 minutes
- Reduce polling frequency (increase interval in twitter-bot.ts)

## Next Steps

Once bot is live:

1. **Announce it:** Post a tweet saying bot is live
2. **Monitor:** Watch mentions and tune responses
3. **Iterate:** Add more personality, better answers
4. **Engage:** Like/retweet people who @ you

## Cost

- **Free tier:** Good for hackathon
- **Basic ($100/mo):** Needed for production (higher limits)
- **Pro ($5,000/mo):** If you go viral 😎

---

Built by @randomaigirl 🔥

Let's get this bot LIVE!
