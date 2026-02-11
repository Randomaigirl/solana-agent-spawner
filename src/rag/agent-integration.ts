/**
 * Agent Integration with RandomAiGirl R-A-G
 * All agents feed knowledge into and query from the universal store
 */

import { GLOBAL_RAG, BlockchainEvent, Knowledge } from './knowledge-store.js';
import { BaseAgent } from '../types/agent.js';

/**
 * RAG-Enhanced Agent Base
 * Extends agents with universal knowledge capabilities
 */
export class RAGAgent extends BaseAgent {
  /**
   * Ingest event into universal RAG
   * Every agent's learnings benefit ALL agents
   */
  protected async ingestToRAG(event: BlockchainEvent): Promise<void> {
    await GLOBAL_RAG.ingest(event);
  }
  
  /**
   * Query universal RAG
   * Agents can access collective intelligence
   */
  protected async queryRAG(question: string) {
    return await GLOBAL_RAG.query(question);
  }
  
  /**
   * Get domain-specific knowledge
   * Specialized queries for each agent type
   */
  protected async getRAGDomain(
    domain: 'whales' | 'airdrops' | 'defi' | 'security'
  ): Promise<Knowledge[]> {
    return await GLOBAL_RAG.queryDomain(domain);
  }
  
  /**
   * Contribute learning to RAG
   * Override in agents to feed their discoveries
   */
  protected async contributeKnowledge(
    category: 'whale_behavior' | 'defi_patterns' | 'airdrops' | 'security' | 'market_trends',
    content: string,
    confidence: number,
    sources: string[]
  ): Promise<void> {
    const knowledge: Knowledge = {
      id: `k-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      category,
      content,
      confidence,
      sources,
      learnedAt: Date.now()
    };
    
    // Direct injection into global knowledge base
    (GLOBAL_RAG as any).knowledge.set(knowledge.id, knowledge);
    
    console.log(`[RAG] ${this.config.id} contributed: ${content.substring(0, 60)}...`);
  }
}

/**
 * RAG Query Examples
 * Show developers how to use the universal API
 */
export const RAG_QUERY_EXAMPLES = {
  whales: [
    "What are whale wallets buying today?",
    "Show me recent large transactions",
    "Which whales are most active?",
    "Are whales accumulating or distributing?"
  ],
  
  airdrops: [
    "Find unclaimed airdrops for wallet ADDRESS",
    "What are the latest airdrop opportunities?",
    "Which protocols are planning airdrops?",
    "Estimate airdrop value for my activity"
  ],
  
  defi: [
    "What's the best yield for USDC?",
    "Compare lending rates across protocols",
    "Find arbitrage opportunities",
    "What are the risks of protocol X?"
  ],
  
  security: [
    "Is this transaction suspicious?",
    "Has wallet ADDRESS been involved in exploits?",
    "What are recent security threats?",
    "Analyze wallet risk score"
  ],
  
  general: [
    "What's happening on Solana right now?",
    "Summarize market trends today",
    "What tokens are trending?",
    "Give me alpha for today"
  ]
};

/**
 * Export the universal RAG for direct access
 */
export { GLOBAL_RAG };
