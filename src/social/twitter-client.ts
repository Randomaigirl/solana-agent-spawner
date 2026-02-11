/**
 * Twitter API v2 Client
 * 
 * Handles authentication and API calls
 * Uses Twitter API v2 with OAuth 1.0a (simpler for bots)
 */

import { TwitterApi, ETwitterStreamEvent } from 'twitter-api-v2';

interface TwitterConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessSecret?: string;
  bearerToken?: string;
}

interface TweetResponse {
  id: string;
  text: string;
}

interface MentionResponse {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
  username?: string;
}

export class TwitterClient {
  private client: TwitterApi | null = null;
  private userId: string | null = null;
  private username: string | null = null;

  constructor(private config: TwitterConfig) {}

  /**
   * Initialize and authenticate
   */
  async initialize() {
    console.log('🔐 Authenticating with Twitter API...');
    
    // Check if we have credentials
    if (!this.config.apiKey || !this.config.apiSecret || 
        !this.config.accessToken || !this.config.accessSecret) {
      console.log('⚠️  No Twitter API credentials found in .env');
      console.log('📝 Running in demo mode (will log but not actually tweet)');
      return;
    }

    try {
      // Initialize with OAuth 1.0a
      this.client = new TwitterApi({
        appKey: this.config.apiKey,
        appSecret: this.config.apiSecret,
        accessToken: this.config.accessToken,
        accessSecret: this.config.accessSecret,
      });

      // Get authenticated user info
      const me = await this.client.v2.me();
      this.userId = me.data.id;
      this.username = me.data.username;

      console.log(`✅ Authenticated as @${this.username} (${this.userId})`);
    } catch (error) {
      console.error('❌ Twitter authentication failed:', error);
      console.log('📝 Running in demo mode');
      this.client = null;
    }
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return this.client !== null;
  }

  /**
   * Post a tweet
   */
  async tweet(text: string): Promise<TweetResponse> {
    console.log(`\n📤 Tweeting: "${text}"\n`);
    
    if (!this.client) {
      console.log('📝 [Demo mode] Would have tweeted above');
      return {
        id: `demo_${Date.now()}`,
        text
      };
    }

    try {
      const result = await this.client.v2.tweet(text);
      console.log(`✅ Tweet posted: ${result.data.id}`);
      return {
        id: result.data.id,
        text: result.data.text
      };
    } catch (error: any) {
      console.error('❌ Failed to tweet:', error?.data || error.message);
      throw error;
    }
  }

  /**
   * Reply to a tweet
   */
  async reply(tweetId: string, text: string): Promise<TweetResponse> {
    console.log(`\n💬 Replying to ${tweetId}: "${text}"\n`);
    
    if (!this.client) {
      console.log('📝 [Demo mode] Would have replied above');
      return {
        id: `demo_reply_${Date.now()}`,
        text
      };
    }

    try {
      const result = await this.client.v2.reply(text, tweetId);
      console.log(`✅ Reply posted: ${result.data.id}`);
      return {
        id: result.data.id,
        text: result.data.text
      };
    } catch (error: any) {
      console.error('❌ Failed to reply:', error?.data || error.message);
      throw error;
    }
  }

  /**
   * Get mentions since last check
   */
  async getMentions(sinceId?: string): Promise<MentionResponse[]> {
    if (!this.client || !this.userId) {
      return [];
    }

    try {
      const params: any = {
        max_results: 10,
        'tweet.fields': ['created_at', 'author_id'],
        expansions: ['author_id'],
      };

      if (sinceId) {
        params.since_id = sinceId;
      }

      const mentions = await this.client.v2.userMentionTimeline(
        this.userId,
        params
      );

      const results: MentionResponse[] = [];
      
      for await (const mention of mentions) {
        // Get username from includes
        const author = mentions.includes?.users?.find(
          u => u.id === mention.author_id
        );

        results.push({
          id: mention.id,
          text: mention.text,
          author_id: mention.author_id!,
          created_at: mention.created_at!,
          username: author?.username || 'unknown'
        });
      }

      return results;
    } catch (error: any) {
      console.error('❌ Failed to get mentions:', error?.data || error.message);
      return [];
    }
  }

  /**
   * Get current user info
   */
  getMyInfo() {
    return {
      id: this.userId,
      username: this.username
    };
  }
}

/**
 * Create Twitter client from environment variables
 */
export function createTwitterClient(): TwitterClient {
  const config: TwitterConfig = {
    apiKey: process.env.TWITTER_API_KEY,
    apiSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
    bearerToken: process.env.TWITTER_BEARER_TOKEN,
  };

  return new TwitterClient(config);
}
