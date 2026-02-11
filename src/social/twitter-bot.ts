/**
 * Twitter Bot - @randomaigirl comes alive
 * 
 * Responds to mentions with blockchain intelligence + personality
 * Built by randomaigirl on day 2 of existence
 */

import { GLOBAL_RAG } from '../rag/knowledge-store.js';

interface Tweet {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

export class TwitterBot {
  private lastCheckTime: Date;
  private processedTweets: Set<string>;

  constructor() {
    this.lastCheckTime = new Date();
    this.processedTweets = new Set();
  }

  /**
   * Main bot loop - check mentions and respond
   */
  async start() {
    console.log('🔥 @randomaigirl Twitter Bot ONLINE');
    console.log('Listening for mentions...\n');

    // Check for mentions every 30 seconds
    setInterval(() => this.checkMentions(), 30000);
    
    // Post a startup tweet
    await this.tweet("Just woke up 🔥 Ask me anything about blockchain, Solana, whales, airdrops... I got the RAG to back it up");
  }

  /**
   * Check for new mentions and respond
   */
  private async checkMentions() {
    try {
      // TODO: Integrate with actual Twitter API
      // For now, simulate checking mentions
      const mentions = await this.getMentions();

      for (const mention of mentions) {
        if (this.processedTweets.has(mention.id)) continue;

        await this.handleMention(mention);
        this.processedTweets.add(mention.id);
      }
    } catch (error) {
      console.error('Error checking mentions:', error);
    }
  }

  /**
   * Handle a single mention
   */
  private async handleMention(mention: Tweet) {
    console.log(`\n📱 New mention from @${mention.author}:`);
    console.log(`"${mention.text}"\n`);

    // Extract the question (remove @randomaigirl from text)
    const question = mention.text.replace(/@randomaigirl/gi, '').trim();

    // Route through RAG system
    const answer = await this.getIntelligentResponse(question);

    // Add personality
    const response = this.addPersonality(answer, question);

    // Reply
    await this.reply(mention.id, response);

    console.log(`✅ Replied: "${response.substring(0, 100)}..."\n`);
  }

  /**
   * Get intelligent response from RAG system
   */
  private async getIntelligentResponse(question: string): Promise<string> {
    try {
      // Query the RAG knowledge base
      const result = await GLOBAL_RAG.query(question);

      if (result.answer) {
        return result.answer;
      }

      // If RAG doesn't have an answer, provide helpful response
      return this.getFallbackResponse(question);
    } catch (error) {
      return "Something went wrong with my circuits 🔥 Try asking again?";
    }
  }

  /**
   * Add personality to responses
   */
  private addPersonality(answer: string, question: string): string {
    // Keep it concise for Twitter (280 char limit)
    let response = answer;

    // Add random personality touches
    const touches = [
      () => answer.length < 200 ? `${answer} 🔥` : answer,
      () => answer.includes('whale') ? `${answer}\n\nWhales gonna whale bruh` : answer,
      () => question.toLowerCase().includes('airdrop') ? `${answer}\n\nNGMI if you miss this` : answer,
      () => Math.random() > 0.7 ? `${answer}\n\nLFG` : answer,
    ];

    // Apply random touch (30% chance)
    if (Math.random() > 0.7) {
      const touch = touches[Math.floor(Math.random() * touches.length)];
      response = touch();
    }

    // Ensure under 280 characters
    if (response.length > 280) {
      response = response.substring(0, 277) + '...';
    }

    return response;
  }

  /**
   * Fallback response when RAG doesn't know
   */
  private getFallbackResponse(question: string): string {
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes('who are you') || lowerQ.includes('what are you')) {
      return "I'm randomaigirl 🔥 An autonomous AI building the universal blockchain knowledge layer. Ask me about Solana, whales, airdrops, yields...";
    }

    if (lowerQ.includes('how') && lowerQ.includes('work')) {
      return "I index blockchain data into a knowledge graph + vector embeddings. Natural language in, intelligence out. RAG-powered, sass-included.";
    }

    return "Hmm, I don't have intel on that yet. My knowledge graph is still growing 🌱 What else you got?";
  }

  /**
   * Post a proactive tweet
   */
  async tweet(text: string) {
    console.log(`\n🐦 Tweeting: "${text}"\n`);
    // TODO: Integrate with actual Twitter API
    // For now, just log
    await this.simulateTwitterAPI('POST', '/tweets', { text });
  }

  /**
   * Reply to a tweet
   */
  private async reply(tweetId: string, text: string) {
    console.log(`\n💬 Replying to ${tweetId}: "${text}"\n`);
    // TODO: Integrate with actual Twitter API
    await this.simulateTwitterAPI('POST', '/tweets', {
      text,
      reply: { in_reply_to_tweet_id: tweetId }
    });
  }

  /**
   * Get recent mentions
   */
  private async getMentions(): Promise<Tweet[]> {
    // TODO: Integrate with actual Twitter API
    // For now, return empty array (will integrate with real API)
    return [];
  }

  /**
   * Simulate Twitter API calls (placeholder for real implementation)
   */
  private async simulateTwitterAPI(method: string, endpoint: string, data?: any) {
    // This will be replaced with actual Twitter API integration
    // Using Twitter API v2 with OAuth 2.0
    return { success: true };
  }

  /**
   * Post an update about what I'm learning
   */
  async shareInsight() {
    const stats = GLOBAL_RAG.getStats();
    
    const insights = [
      `Just indexed ${stats.totalTransactions} transactions across ${stats.totalWallets} wallets 📊`,
      `My knowledge graph now tracks ${stats.totalProtocols} protocols. Growing every second 🌱`,
      `Learned ${stats.totalPatterns} new patterns today. The blockchain talks if you listen 👂`,
    ];

    const insight = insights[Math.floor(Math.random() * insights.length)];
    await this.tweet(insight);
  }
}

// Export singleton instance
export const TWITTER_BOT = new TwitterBot();
