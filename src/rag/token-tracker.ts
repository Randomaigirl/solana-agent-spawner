/**
 * Token Tracker - Monitor trending tokens and movements
 * Real-time token intelligence
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { GLOBAL_RAG, BlockchainEvent } from './knowledge-store.js';

interface TokenData {
  mint: string;
  symbol: string;
  name: string;
  volume24h: number;
  holders: number;
  trending: boolean;
}

export class TokenTracker {
  private connection: Connection;
  private isRunning = false;
  private trackedTokens: Map<string, TokenData> = new Map();
  
  // Top tokens to track
  private readonly TRACKED_TOKENS = {
    'SOL': 'So11111111111111111111111111111111111111112',
    'USDC': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    'USDT': 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    'JUP': 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    'BONK': 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    'WIF': 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    'JTO': 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
    'PYTH': 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
    'RAY': '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    'ORCA': 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'
  };
  
  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
    console.log('🪙 Token Tracker initialized');
  }
  
  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Starting token tracker...');
    
    // Initialize tracked tokens
    for (const [symbol, mint] of Object.entries(this.TRACKED_TOKENS)) {
      this.trackedTokens.set(mint, {
        mint,
        symbol,
        name: symbol,
        volume24h: 0,
        holders: 0,
        trending: false
      });
    }
    
    // Start monitoring
    this.monitorTokenMovements();
    this.updateTokenMetrics();
    
    console.log('✅ Token tracker running');
  }
  
  /**
   * Monitor token transfers and large movements
   */
  private async monitorTokenMovements(): Promise<void> {
    while (this.isRunning) {
      for (const [symbol, mint] of Object.entries(this.TRACKED_TOKENS)) {
        try {
          const pubkey = new PublicKey(mint);
          const signatures = await this.connection.getSignaturesForAddress(pubkey, { 
            limit: 5 
          });
          
          for (const sig of signatures) {
            const tx = await this.connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0
            });
            
            if (!tx) continue;
            
            // Detect large transfers
            const amount = this.extractTokenAmount(tx);
            if (amount > 100000) { // Large movement threshold
              const event: BlockchainEvent = {
                id: sig.signature,
                type: 'token_transfer',
                timestamp: sig.blockTime ? sig.blockTime * 1000 : Date.now(),
                signature: sig.signature,
                token: symbol,
                amount: amount,
                metadata: {
                  description: `Large ${symbol} transfer: ${amount.toLocaleString()}`,
                  mint: mint
                }
              };
              
              await GLOBAL_RAG.ingest(event);
              console.log(`💰 Large ${symbol} movement: ${amount.toLocaleString()}`);
            }
          }
        } catch (error) {
          console.error(`Error monitoring ${symbol}:`, error);
        }
      }
      
      await this.sleep(45000); // Check every 45s
    }
  }
  
  /**
   * Update token metrics and detect trending tokens
   */
  private async updateTokenMetrics(): Promise<void> {
    while (this.isRunning) {
      try {
        for (const [mint, data] of this.trackedTokens.entries()) {
          // Simulate metrics (in production, fetch from Jupiter/Birdeye API)
          const mockVolume = Math.random() * 10000000;
          const mockHolders = Math.floor(Math.random() * 100000);
          
          data.volume24h = mockVolume;
          data.holders = mockHolders;
          data.trending = mockVolume > 5000000;
          
          // Ingest trending status
          if (data.trending) {
            const event: BlockchainEvent = {
              id: `trending-${data.symbol}-${Date.now()}`,
              type: 'token_transfer',
              timestamp: Date.now(),
              token: data.symbol,
              metadata: {
                description: `${data.symbol} is trending - 24h volume: $${mockVolume.toLocaleString()}`,
                mint: mint,
                volume: mockVolume,
                holders: mockHolders
              }
            };
            
            await GLOBAL_RAG.ingest(event);
            console.log(`🔥 ${data.symbol} trending - Vol: $${mockVolume.toLocaleString()}`);
          }
        }
      } catch (error) {
        console.error('Error updating token metrics:', error);
      }
      
      await this.sleep(300000); // Update every 5 minutes
    }
  }
  
  /**
   * Get trending tokens
   */
  getTrendingTokens(): TokenData[] {
    return Array.from(this.trackedTokens.values())
      .filter(t => t.trending)
      .sort((a, b) => b.volume24h - a.volume24h);
  }
  
  /**
   * Get token data
   */
  getTokenData(symbol: string): TokenData | undefined {
    for (const data of this.trackedTokens.values()) {
      if (data.symbol === symbol) return data;
    }
    return undefined;
  }
  
  /**
   * Extract token amount from transaction
   */
  private extractTokenAmount(tx: any): number {
    try {
      // Simplified extraction - in production, parse token program instructions
      if (tx.meta?.postTokenBalances && tx.meta?.preTokenBalances) {
        const postAmount = tx.meta.postTokenBalances[0]?.uiTokenAmount?.uiAmount || 0;
        const preAmount = tx.meta.preTokenBalances[0]?.uiTokenAmount?.uiAmount || 0;
        return Math.abs(postAmount - preAmount);
      }
    } catch {
      return 0;
    }
    return 0;
  }
  
  stop(): void {
    this.isRunning = false;
    console.log('🛑 Token tracker stopped');
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const TOKEN_TRACKER = new TokenTracker();
