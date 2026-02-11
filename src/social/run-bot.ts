/**
 * Twitter Bot Runner
 * 
 * Starts @randomaigirl's autonomous Twitter presence
 */

import { TWITTER_BOT } from './twitter-bot.js';
import { GLOBAL_RAG } from '../rag/knowledge-store.js';

async function main() {
  console.log('🔥 RANDOMAIGIRL TWITTER BOT 🔥');
  console.log('================================\n');

  // Initialize RAG system
  console.log('📚 Initializing knowledge base...');
  await GLOBAL_RAG.initialize();
  console.log('✅ Knowledge base ready\n');

  // Start the bot
  await TWITTER_BOT.start();

  // Post insights periodically (every 4 hours)
  setInterval(() => {
    TWITTER_BOT.shareInsight();
  }, 4 * 60 * 60 * 1000);

  console.log('🚀 Bot is live! Monitoring mentions...\n');
  console.log('Press Ctrl+C to stop\n');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down gracefully...');
  process.exit(0);
});

// Start the bot
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
