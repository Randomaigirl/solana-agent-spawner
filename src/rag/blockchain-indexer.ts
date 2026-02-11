/**
 * Blockchain Indexer - Continuous Solana data ingestion
 * THE REAL DATA PIPELINE
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { GLOBAL_RAG, BlockchainEvent } from './knowledge-store.js';

export class BlockchainIndexer {
  private connection: Connection;
  private isRunning = false;
  private knownSignatures = new Set<string>();
  
  // Top DeFi protocols to monitor
  private readonly PROTOCOLS = {
    'marinade': 'MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD',
    'jupiter': 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    'raydium': '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    'orca': 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    'kamino': 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD',
    'drift': 'dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH',
    'mango': '4MangoMjqJ2firMokCjjGgoK8d4MXcrgL7XJaL3w6fVg',
    'solend': 'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo',
    'marginfi': 'MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA'
  };
  
  // Known whale wallets to track
  private readonly WHALE_WALLETS = [
    'GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ', // Alameda Research
    '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', // Jump Trading
    'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm', // Wintermute
    'CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq' // Market maker
  ];
  
  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
    console.log('🔗 Blockchain Indexer initialized');
  }
  
  /**
   * Start continuous indexing
   */
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Starting blockchain indexer...');
    
    // Start monitoring
    this.monitorWhales();
    this.monitorProtocols();
    this.scanRecentTransactions();
    
    console.log('✅ Blockchain indexer running');
  }
  
  /**
   * Monitor whale wallet activity
   */
  private async monitorWhales(): Promise<void> {
    while (this.isRunning) {
      for (const wallet of this.WHALE_WALLETS) {
        try {
          const pubkey = new PublicKey(wallet);
          const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit: 10 });
          
          for (const sig of signatures) {
            if (this.knownSignatures.has(sig.signature)) continue;
            this.knownSignatures.add(sig.signature);
            
            // Get transaction details
            const tx = await this.connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0
            });
            
            if (!tx) continue;
            
            // Ingest whale activity
            const event: BlockchainEvent = {
              id: sig.signature,
              type: 'whale_move',
              timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
              wallet: wallet,
              signature: sig.signature,
              amount: this.extractAmount(tx),
              metadata: {
                description: `Whale ${wallet.substring(0, 8)} transaction`,
                slot: sig.slot,
                err: sig.err
              }
            };
            
            await GLOBAL_RAG.ingest(event);
            console.log(`🐋 Whale activity: ${wallet.substring(0, 8)} - ${sig.signature.substring(0, 8)}`);
          }
        } catch (error) {
          console.error(`Error monitoring whale ${wallet}:`, error);
        }
      }
      
      await this.sleep(30000); // Check every 30s
    }
  }
  
  /**
   * Monitor DeFi protocol interactions
   */
  private async monitorProtocols(): Promise<void> {
    while (this.isRunning) {
      for (const [name, address] of Object.entries(this.PROTOCOLS)) {
        try {
          const pubkey = new PublicKey(address);
          const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit: 5 });
          
          for (const sig of signatures) {
            if (this.knownSignatures.has(sig.signature)) continue;
            this.knownSignatures.add(sig.signature);
            
            const event: BlockchainEvent = {
              id: sig.signature,
              type: 'protocol_interaction',
              timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
              signature: sig.signature,
              protocol: name,
              metadata: {
                description: `${name} interaction`,
                slot: sig.slot
              }
            };
            
            await GLOBAL_RAG.ingest(event);
            console.log(`📊 Protocol activity: ${name} - ${sig.signature.substring(0, 8)}`);
          }
        } catch (error) {
          console.error(`Error monitoring protocol ${name}:`, error);
        }
      }
      
      await this.sleep(60000); // Check every 60s
    }
  }
  
  /**
   * Scan recent transactions for patterns
   */
  private async scanRecentTransactions(): Promise<void> {
    while (this.isRunning) {
      try {
        const slot = await this.connection.getSlot();
        const block = await this.connection.getBlock(slot, {
          maxSupportedTransactionVersion: 0
        });
        
        if (!block) {
          await this.sleep(5000);
          continue;
        }
        
        // Analyze block for interesting patterns
        for (const tx of block.transactions.slice(0, 10)) {
          if (!tx.transaction.message) continue;
          
          const signature = tx.transaction.signatures[0];
          if (this.knownSignatures.has(signature)) continue;
          
          const accounts = tx.transaction.message.staticAccountKeys || [];
          
          // Check if it involves any tracked protocols
          for (const [name, address] of Object.entries(this.PROTOCOLS)) {
            if (accounts.some(key => key.toString() === address)) {
              this.knownSignatures.add(signature);
              
              const event: BlockchainEvent = {
                id: signature,
                type: 'protocol_interaction',
                timestamp: block.blockTime ? block.blockTime * 1000 : Date.now(),
                signature: signature,
                protocol: name,
                metadata: {
                  description: `Recent ${name} transaction`,
                  slot: slot
                }
              };
              
              await GLOBAL_RAG.ingest(event);
            }
          }
        }
      } catch (error) {
        console.error('Error scanning transactions:', error);
      }
      
      await this.sleep(10000); // Scan every 10s
    }
  }
  
  /**
   * Extract transaction amount (simplified)
   */
  private extractAmount(tx: any): number {
    try {
      // Try to extract SOL amount from transaction
      if (tx.meta?.postBalances && tx.meta?.preBalances) {
        const diff = Math.abs(tx.meta.postBalances[0] - tx.meta.preBalances[0]);
        return diff / 1e9; // Convert lamports to SOL
      }
    } catch {
      return 0;
    }
    return 0;
  }
  
  /**
   * Stop indexing
   */
  stop(): void {
    this.isRunning = false;
    console.log('🛑 Blockchain indexer stopped');
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton
export const BLOCKCHAIN_INDEXER = new BlockchainIndexer();
