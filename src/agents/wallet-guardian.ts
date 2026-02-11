/**
 * Wallet Guardian Agent
 * Autonomous security monitoring and anomaly detection
 * Watches for suspicious activity, unauthorized transactions, and risks
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { BaseAgent, AgentConfig } from '../types/agent.js';

interface SecurityEvent {
  type: 'suspicious_transaction' | 'unusual_token' | 'high_value_transfer' | 'new_authority' | 'drain_pattern';
  severity: 'info' | 'warning' | 'critical';
  wallet: string;
  description: string;
  signature?: string;
  detectedAt: number;
  recommendation: string;
}

interface WalletProfile {
  address: string;
  avgDailyTxCount: number;
  avgTransactionValue: number;
  knownTokens: Set<string>;
  lastActivity: number;
  riskScore: number; // 0-100, higher = riskier
}

export class WalletGuardianAgent extends BaseAgent {
  private connection: Connection;
  private watchedWallets: Map<string, WalletProfile> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private running: boolean = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  
  constructor(config: AgentConfig) {
    super(config);
    
    const rpcUrl = config.parameters.rpcUrl || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    // Add wallets to watch
    if (config.parameters.wallets) {
      for (const wallet of config.parameters.wallets) {
        this.watchedWallets.set(wallet, {
          address: wallet,
          avgDailyTxCount: 0,
          avgTransactionValue: 0,
          knownTokens: new Set(),
          lastActivity: 0,
          riskScore: 0
        });
      }
    }
  }
  
  async initialize(): Promise<void> {
    console.log(`[WalletGuardian-${this.config.id}] 🚨 Initializing security monitoring...`);
    
    // Build baseline profiles for each wallet
    for (const [address, profile] of this.watchedWallets.entries()) {
      try {
        await this.buildWalletProfile(address, profile);
      } catch (error) {
        console.error(`Failed to profile ${address}:`, error);
      }
    }
    
    console.log(`[WalletGuardian-${this.config.id}] ✅ Monitoring ${this.watchedWallets.size} wallet(s)`);
  }
  
  async run(): Promise<void> {
    this.running = true;
    console.log(`[WalletGuardian-${this.config.id}] 🚀 Starting autonomous security monitoring...`);
    
    // Monitor every 5 minutes
    this.monitorInterval = setInterval(async () => {
      await this.monitorWallets();
    }, 300000);
    
    // First scan after 10 seconds
    setTimeout(async () => {
      await this.monitorWallets();
    }, 10000);
  }
  
  async stop(): Promise<void> {
    this.running = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    console.log(`[WalletGuardian-${this.config.id}] 🛑 Stopped`);
  }
  
  private async buildWalletProfile(address: string, profile: WalletProfile): Promise<void> {
    console.log(`[WalletGuardian-${this.config.id}] 📊 Building profile for ${address.substring(0, 8)}...`);
    
    try {
      const pubkey = new PublicKey(address);
      
      // Get recent transaction history
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit: 50 });
      
      if (signatures.length === 0) {
        console.log(`[WalletGuardian-${this.config.id}] No activity found for ${address.substring(0, 8)}`);
        return;
      }
      
      profile.lastActivity = signatures[0].blockTime || Date.now() / 1000;
      profile.avgDailyTxCount = signatures.length / 7; // Approximate based on recent week
      
      // Analyze transaction patterns
      let totalValue = 0;
      let txCount = 0;
      
      for (const sig of signatures.slice(0, 10)) { // Sample 10 recent
        try {
          const tx = await this.connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          
          if (tx && tx.meta) {
            const preBalance = tx.meta.preBalances[0] || 0;
            const postBalance = tx.meta.postBalances[0] || 0;
            const value = Math.abs(postBalance - preBalance) / 1e9;
            totalValue += value;
            txCount++;
          }
        } catch (error) {
          // Skip failed tx fetches
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (txCount > 0) {
        profile.avgTransactionValue = totalValue / txCount;
      }
      
      // Calculate initial risk score (0 = safe, 100 = risky)
      profile.riskScore = this.calculateRiskScore(profile);
      
      console.log(`[WalletGuardian-${this.config.id}] Profile complete: ${address.substring(0, 8)} (risk: ${profile.riskScore})`);
      
    } catch (error) {
      console.error(`Error profiling ${address}:`, error);
    }
  }
  
  private calculateRiskScore(profile: WalletProfile): number {
    let score = 0;
    
    // High transaction frequency = slight risk
    if (profile.avgDailyTxCount > 50) score += 10;
    else if (profile.avgDailyTxCount > 20) score += 5;
    
    // Very high transaction values = moderate risk
    if (profile.avgTransactionValue > 100) score += 15;
    else if (profile.avgTransactionValue > 50) score += 10;
    
    // Inactive wallets = lower risk
    const daysSinceActivity = (Date.now() / 1000 - profile.lastActivity) / 86400;
    if (daysSinceActivity > 30) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private async monitorWallets(): Promise<void> {
    if (!this.running || this.watchedWallets.size === 0) return;
    
    console.log(`[WalletGuardian-${this.config.id}] 🔍 Scanning ${this.watchedWallets.size} wallet(s) for threats...`);
    
    for (const [address, profile] of this.watchedWallets.entries()) {
      try {
        const events = await this.checkWalletSecurity(address, profile);
        
        for (const event of events) {
          this.securityEvents.push(event);
          
          if (event.severity === 'critical') {
            console.log(`[WalletGuardian-${this.config.id}] 🚨 CRITICAL: ${event.description}`);
          } else if (event.severity === 'warning') {
            console.log(`[WalletGuardian-${this.config.id}] ⚠️  WARNING: ${event.description}`);
          }
          
          await this.saveKnowledge({
            type: 'security_event',
            severity: event.severity,
            eventType: event.type,
            wallet: address.substring(0, 8)
          }, 'security-monitor');
        }
      } catch (error) {
        console.error(`Error monitoring ${address}:`, error);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    const criticalCount = this.securityEvents.filter(e => e.severity === 'critical').length;
    const warningCount = this.securityEvents.filter(e => e.severity === 'warning').length;
    
    if (criticalCount > 0 || warningCount > 0) {
      console.log(`[WalletGuardian-${this.config.id}] 📊 Detected: ${criticalCount} critical, ${warningCount} warnings`);
    } else {
      console.log(`[WalletGuardian-${this.config.id}] ✅ All wallets secure`);
    }
  }
  
  private async checkWalletSecurity(address: string, profile: WalletProfile): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];
    
    try {
      const pubkey = new PublicKey(address);
      
      // Get recent transactions since last check
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit: 10 });
      
      if (signatures.length === 0) return events;
      
      // Check for new activity
      const latestTx = signatures[0];
      const latestTime = latestTx.blockTime || Date.now() / 1000;
      
      if (latestTime > profile.lastActivity) {
        // New transactions since last check
        const newTxCount = signatures.findIndex(s => (s.blockTime || 0) <= profile.lastActivity);
        const newTransactions = newTxCount === -1 ? signatures : signatures.slice(0, newTxCount);
        
        for (const sig of newTransactions) {
          try {
            const tx = await this.connection.getTransaction(sig.signature, {
              maxSupportedTransactionVersion: 0
            });
            
            if (tx && tx.meta) {
              // Check for suspicious patterns
              const preBalance = tx.meta.preBalances[0] || 0;
              const postBalance = tx.meta.postBalances[0] || 0;
              const solChange = Math.abs(postBalance - preBalance) / 1e9;
              
              // Large unexpected transfer
              if (solChange > profile.avgTransactionValue * 5 && solChange > 10) {
                events.push({
                  type: 'high_value_transfer',
                  severity: 'warning',
                  wallet: address,
                  description: `Unusually large transaction: ${solChange.toFixed(2)} SOL (${(solChange / profile.avgTransactionValue).toFixed(1)}x normal)`,
                  signature: sig.signature,
                  detectedAt: Date.now(),
                  recommendation: 'Verify this transaction was authorized. Check for phishing attempts.'
                });
              }
              
              // Potential drain pattern (multiple large outflows)
              if (postBalance < preBalance * 0.5 && postBalance < 1e9) {
                events.push({
                  type: 'drain_pattern',
                  severity: 'critical',
                  wallet: address,
                  description: `Significant balance reduction: ${((preBalance - postBalance) / 1e9).toFixed(2)} SOL drained. Balance now: ${(postBalance / 1e9).toFixed(4)} SOL`,
                  signature: sig.signature,
                  detectedAt: Date.now(),
                  recommendation: 'URGENT: Check if wallet was compromised. Revoke approvals and transfer remaining assets to secure wallet.'
                });
              }
            }
          } catch (error) {
            // Skip failed tx fetches
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Update profile
        profile.lastActivity = latestTime;
      }
      
      // Check current balance
      const balance = await this.connection.getBalance(pubkey);
      
      // Warn if balance is very low (possible compromise)
      if (balance < 0.01 * 1e9 && profile.avgTransactionValue > 1) {
        events.push({
          type: 'suspicious_transaction',
          severity: 'warning',
          wallet: address,
          description: `Wallet balance critically low: ${(balance / 1e9).toFixed(4)} SOL. Possible compromise or complete drain.`,
          detectedAt: Date.now(),
          recommendation: 'Investigate recent transactions. Check for unauthorized access.'
        });
      }
      
    } catch (error) {
      console.error(`Error checking security for ${address}:`, error);
    }
    
    return events;
  }
  
  getSecurityEvents(): SecurityEvent[] {
    return this.securityEvents.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }
  
  getWalletProfiles(): Map<string, WalletProfile> {
    return this.watchedWallets;
  }
}

// Standalone execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const config: AgentConfig = {
    id: 'wallet-guardian-demo',
    type: 'wallet-guardian',
    parameters: {
      wallets: process.argv.slice(2) // Pass wallet addresses to monitor
    },
    createdAt: Date.now(),
    active: true
  };
  
  const agent = new WalletGuardianAgent(config);
  
  await agent.initialize();
  await agent.run();
  
  // Monitor for 1 minute then report
  setTimeout(async () => {
    await agent.stop();
    
    console.log('\n=== WALLET PROFILES ===');
    for (const [address, profile] of agent.getWalletProfiles().entries()) {
      console.log(`\n${address.substring(0, 16)}...`);
      console.log(`  Risk Score: ${profile.riskScore}/100`);
      console.log(`  Avg Daily Tx: ${profile.avgDailyTxCount.toFixed(1)}`);
      console.log(`  Avg Tx Value: ${profile.avgTransactionValue.toFixed(2)} SOL`);
      console.log(`  Last Activity: ${new Date(profile.lastActivity * 1000).toLocaleString()}`);
    }
    
    console.log('\n=== SECURITY EVENTS ===');
    const events = agent.getSecurityEvents();
    if (events.length === 0) {
      console.log('No security issues detected. All wallets secure! ✅');
    } else {
      for (const event of events) {
        console.log(`\n[${event.severity.toUpperCase()}] ${event.type}`);
        console.log(`  ${event.description}`);
        console.log(`  → ${event.recommendation}`);
        if (event.signature) {
          console.log(`  Tx: ${event.signature}`);
        }
      }
    }
    
    console.log('\n=== KNOWLEDGE GAINED ===');
    console.log(JSON.stringify(agent.getKnowledge(), null, 2));
    
    process.exit(0);
  }, 60000);
}
