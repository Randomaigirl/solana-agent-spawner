/**
 * Whale Watcher Agent
 * Autonomously tracks smart money wallets on Solana
 * Learns patterns and alerts on significant moves
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { BaseAgent, AgentConfig } from '../types/agent.js';

interface WhaleWallet {
  address: string;
  name: string;
  lastSignature?: string;
}

interface WhaleTransaction {
  wallet: string;
  signature: string;
  timestamp: number;
  type: string;
  amount?: number;
  token?: string;
  significance: 'low' | 'medium' | 'high';
}

export class WhaleWatcherAgent extends BaseAgent {
  private connection: Connection;
  private whaleWallets: WhaleWallet[] = [];
  private running: boolean = false;
  private pollInterval: NodeJS.Timeout | null = null;
  
  constructor(config: AgentConfig) {
    super(config);
    
    // Use public Solana RPC for MVP
    const rpcUrl = config.parameters.rpcUrl || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    // Initialize whale wallets from config or use defaults
    this.whaleWallets = config.parameters.whaleWallets || this.getDefaultWhales();
  }
  
  async initialize(): Promise<void> {
    console.log(`[WhaleWatcher-${this.config.id}] 🐋 Initializing...`);
    console.log(`Tracking ${this.whaleWallets.length} whale wallets`);
    
    // Get initial state for each wallet
    for (const whale of this.whaleWallets) {
      try {
        const pubkey = new PublicKey(whale.address);
        const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit: 1 });
        
        if (signatures.length > 0) {
          whale.lastSignature = signatures[0].signature;
        }
      } catch (error) {
        console.error(`Failed to initialize whale ${whale.name}:`, error);
      }
    }
    
    console.log(`[WhaleWatcher-${this.config.id}] ✅ Initialization complete`);
  }
  
  async run(): Promise<void> {
    this.running = true;
    console.log(`[WhaleWatcher-${this.config.id}] 🚀 Starting autonomous monitoring...`);
    
    // Check for new transactions every 2 minutes (avoid rate limits)
    this.pollInterval = setInterval(async () => {
      await this.checkWhaleActivity();
    }, 120000);
    
    // Run first check after 5 seconds (give init time to complete)
    setTimeout(async () => {
      await this.checkWhaleActivity();
    }, 5000);
  }
  
  async stop(): Promise<void> {
    this.running = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    console.log(`[WhaleWatcher-${this.config.id}] 🛑 Stopped`);
  }
  
  private async checkWhaleActivity(): Promise<void> {
    if (!this.running) return;
    
    console.log(`[WhaleWatcher-${this.config.id}] 🔍 Scanning whale activity...`);
    
    for (const whale of this.whaleWallets) {
      try {
        await this.checkWalletActivity(whale);
        // Sleep 2 seconds between wallets to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error checking whale ${whale.name}:`, error);
      }
    }
  }
  
  private async checkWalletActivity(whale: WhaleWallet): Promise<void> {
    const pubkey = new PublicKey(whale.address);
    const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit: 10 });
    
    // Find new transactions since last check
    const newTxs = whale.lastSignature 
      ? signatures.slice(0, signatures.findIndex(s => s.signature === whale.lastSignature))
      : signatures.slice(0, 3); // First run: only check 3 most recent
    
    if (newTxs.length > 0) {
      console.log(`[WhaleWatcher-${this.config.id}] 🎣 Found ${newTxs.length} new transactions from ${whale.name}`);
      
      // Update last signature
      whale.lastSignature = signatures[0].signature;
      
      // Analyze each transaction
      for (const sig of newTxs) {
        try {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          
          if (tx) {
            const analysis = this.analyzeTransaction(whale, sig.signature, tx);
            
            if (analysis.significance !== 'low') {
              console.log(`[WhaleWatcher-${this.config.id}] 🚨 SIGNIFICANT MOVE by ${whale.name}:`);
              console.log(`   Type: ${analysis.type}`);
              console.log(`   Significance: ${analysis.significance.toUpperCase()}`);
              console.log(`   Signature: ${sig.signature}`);
              
              // Save to knowledge base
              await this.saveKnowledge(analysis, 'whale-transaction');
            }
          }
        } catch (error) {
          console.error(`Failed to fetch transaction ${sig.signature}:`, error);
        }
      }
    }
  }
  
  private analyzeTransaction(whale: WhaleWallet, signature: string, tx: any): WhaleTransaction {
    // Simple heuristic analysis for MVP
    // In production: deeper analysis of instructions, tokens, amounts
    
    const preBalance = tx.meta?.preBalances?.[0] || 0;
    const postBalance = tx.meta?.postBalances?.[0] || 0;
    const solChange = Math.abs(postBalance - preBalance) / 1e9; // Convert lamports to SOL
    
    let significance: 'low' | 'medium' | 'high' = 'low';
    let type = 'unknown';
    
    // Determine transaction type and significance
    if (solChange > 100) {
      significance = 'high';
      type = postBalance > preBalance ? 'large_deposit' : 'large_withdrawal';
    } else if (solChange > 10) {
      significance = 'medium';
      type = postBalance > preBalance ? 'deposit' : 'withdrawal';
    } else {
      type = 'trade_or_swap'; // Likely a DEX swap
      if (tx.meta?.logMessages?.some((log: string) => log.includes('jupiter') || log.includes('raydium'))) {
        significance = 'medium';
        type = 'dex_swap';
      }
    }
    
    return {
      wallet: whale.name,
      signature,
      timestamp: tx.blockTime || Date.now(),
      type,
      amount: solChange,
      significance
    };
  }
  
  private getDefaultWhales(): WhaleWallet[] {
    // Known Solana whale/institutional wallets for demo
    return [
      {
        address: 'C9RgCQwHbFXJ3VXaUNqiwvJxm2zQfFhRgNpVvCNLfzrf',
        name: 'Whale-1'
      },
      {
        address: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
        name: 'Jump Trading'
      },
      {
        address: 'GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ',
        name: 'Alameda Research'
      }
    ];
  }
}

// Standalone execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const config: AgentConfig = {
    id: 'whale-watcher-demo',
    type: 'whale-watcher',
    parameters: {},
    createdAt: Date.now(),
    active: true
  };
  
  const agent = new WhaleWatcherAgent(config);
  
  await agent.initialize();
  await agent.run();
  
  // Run for 5 minutes then stop
  setTimeout(async () => {
    await agent.stop();
    console.log('\\n=== KNOWLEDGE GAINED ===');
    console.log(JSON.stringify(agent.getKnowledge(), null, 2));
    process.exit(0);
  }, 300000);
}
