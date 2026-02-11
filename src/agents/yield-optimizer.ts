/**
 * Yield Optimizer Agent
 * Autonomously monitors DeFi positions and suggests optimal rebalancing
 * Tracks yields across Kamino, MarginFi, Solend and finds best opportunities
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { BaseAgent, AgentConfig } from '../types/agent.js';

interface DeFiPosition {
  protocol: string;
  wallet: string;
  asset: string;
  amount: number;
  currentAPY: number;
  usdValue: number;
  healthFactor?: number; // For lending positions
}

interface YieldOpportunity {
  protocol: string;
  asset: string;
  apy: number;
  tvl: number;
  risk: 'low' | 'medium' | 'high';
  category: 'lending' | 'liquidity' | 'staking';
}

interface OptimizationSuggestion {
  type: 'rebalance' | 'migrate' | 'compound' | 'hedge';
  from: { protocol: string; asset: string; apy: number };
  to: { protocol: string; asset: string; apy: number };
  expectedGain: number; // USD per year
  reasoning: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  generatedAt: number;
}

export class YieldOptimizerAgent extends BaseAgent {
  private connection: Connection;
  private trackedWallets: Set<string> = new Set();
  private positions: Map<string, DeFiPosition[]> = new Map();
  private opportunities: Map<string, YieldOpportunity> = new Map();
  private suggestions: OptimizationSuggestion[] = [];
  private running: boolean = false;
  private scanInterval: NodeJS.Timeout | null = null;
  
  constructor(config: AgentConfig) {
    super(config);
    
    const rpcUrl = config.parameters.rpcUrl || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    // Add wallets to track from config
    if (config.parameters.wallets) {
      for (const wallet of config.parameters.wallets) {
        this.trackedWallets.add(wallet);
      }
    }
  }
  
  async initialize(): Promise<void> {
    console.log(`[YieldOptimizer-${this.config.id}] 💰 Initializing...`);
    
    // Load current yield landscape
    await this.updateYieldOpportunities();
    
    console.log(`[YieldOptimizer-${this.config.id}] ✅ Tracking ${this.opportunities.size} yield opportunities`);
  }
  
  async run(): Promise<void> {
    this.running = true;
    console.log(`[YieldOptimizer-${this.config.id}] 🚀 Starting autonomous optimization...`);
    
    // Update opportunities every 2 hours
    this.scanInterval = setInterval(async () => {
      await this.updateYieldOpportunities();
      await this.analyzePositions();
    }, 7200000);
    
    // Initial analysis after 15 seconds
    setTimeout(async () => {
      await this.analyzePositions();
    }, 15000);
  }
  
  async stop(): Promise<void> {
    this.running = false;
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
    console.log(`[YieldOptimizer-${this.config.id}] 🛑 Stopped`);
  }
  
  private async updateYieldOpportunities(): Promise<void> {
    console.log(`[YieldOptimizer-${this.config.id}] 🔄 Updating yield opportunities...`);
    
    // In production, this would query:
    // - Kamino Lend API
    // - MarginFi API
    // - Solend API
    // - Raydium pools
    // - Meteora dynamic vaults
    // - Drift insurance fund
    
    // For MVP, use realistic current rates
    const currentOpportunities: YieldOpportunity[] = [
      {
        protocol: 'Kamino',
        asset: 'USDC',
        apy: 12.5,
        tvl: 450000000,
        risk: 'low',
        category: 'lending'
      },
      {
        protocol: 'Kamino',
        asset: 'SOL',
        apy: 8.3,
        tvl: 280000000,
        risk: 'low',
        category: 'lending'
      },
      {
        protocol: 'MarginFi',
        asset: 'USDC',
        apy: 11.2,
        tvl: 320000000,
        risk: 'low',
        category: 'lending'
      },
      {
        protocol: 'MarginFi',
        asset: 'SOL',
        apy: 7.8,
        tvl: 180000000,
        risk: 'low',
        category: 'lending'
      },
      {
        protocol: 'Solend',
        asset: 'USDC',
        apy: 9.5,
        tvl: 180000000,
        risk: 'medium',
        category: 'lending'
      },
      {
        protocol: 'Meteora',
        asset: 'SOL-USDC',
        apy: 24.7,
        tvl: 85000000,
        risk: 'medium',
        category: 'liquidity'
      },
      {
        protocol: 'Raydium',
        asset: 'SOL-USDC',
        apy: 18.9,
        tvl: 120000000,
        risk: 'medium',
        category: 'liquidity'
      },
      {
        protocol: 'Marinade',
        asset: 'mSOL',
        apy: 6.8,
        tvl: 420000000,
        risk: 'low',
        category: 'staking'
      },
      {
        protocol: 'Sanctum',
        asset: 'LST',
        apy: 7.2,
        tvl: 95000000,
        risk: 'low',
        category: 'staking'
      }
    ];
    
    // Update opportunities map
    this.opportunities.clear();
    for (const opp of currentOpportunities) {
      const key = `${opp.protocol}-${opp.asset}`;
      this.opportunities.set(key, opp);
    }
    
    await this.saveKnowledge({
      type: 'opportunities_updated',
      count: currentOpportunities.length,
      avgAPY: currentOpportunities.reduce((sum, o) => sum + o.apy, 0) / currentOpportunities.length,
      totalTVL: currentOpportunities.reduce((sum, o) => sum + o.tvl, 0)
    }, 'yield-update');
    
    console.log(`[YieldOptimizer-${this.config.id}] ✅ Updated ${currentOpportunities.length} opportunities`);
  }
  
  private async analyzePositions(): Promise<void> {
    if (this.trackedWallets.size === 0) {
      console.log(`[YieldOptimizer-${this.config.id}] No wallets configured to track`);
      return;
    }
    
    console.log(`[YieldOptimizer-${this.config.id}] 📊 Analyzing positions for ${this.trackedWallets.size} wallet(s)...`);
    
    for (const wallet of this.trackedWallets) {
      try {
        await this.analyzeWalletPositions(wallet);
      } catch (error) {
        console.error(`Error analyzing ${wallet}:`, error);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (this.suggestions.length > 0) {
      console.log(`[YieldOptimizer-${this.config.id}] 💡 Generated ${this.suggestions.length} optimization suggestions`);
      
      // Show urgent suggestions
      const urgent = this.suggestions.filter(s => s.priority === 'urgent');
      if (urgent.length > 0) {
        console.log(`[YieldOptimizer-${this.config.id}] 🚨 ${urgent.length} URGENT suggestions!`);
        for (const s of urgent) {
          console.log(`   → ${s.reasoning}`);
        }
      }
    }
  }
  
  private async analyzeWalletPositions(walletAddress: string): Promise<void> {
    // In production, query actual positions from:
    // - Kamino SDK
    // - MarginFi SDK  
    // - Solend SDK
    // Parse token accounts and PDAs
    
    // For MVP, simulate realistic positions
    const mockPositions = await this.getMockPositions(walletAddress);
    
    if (mockPositions.length === 0) {
      console.log(`[YieldOptimizer-${this.config.id}] No positions found for ${walletAddress.substring(0, 8)}`);
      return;
    }
    
    this.positions.set(walletAddress, mockPositions);
    
    console.log(`[YieldOptimizer-${this.config.id}] Found ${mockPositions.length} position(s) for ${walletAddress.substring(0, 8)}`);
    
    // Generate optimization suggestions
    for (const position of mockPositions) {
      const suggestions = this.generateSuggestions(position);
      this.suggestions.push(...suggestions);
      
      for (const suggestion of suggestions) {
        if (suggestion.priority === 'high' || suggestion.priority === 'urgent') {
          await this.saveKnowledge({
            type: 'optimization_found',
            priority: suggestion.priority,
            expectedGain: suggestion.expectedGain,
            from: suggestion.from.protocol,
            to: suggestion.to.protocol
          }, 'analysis');
        }
      }
    }
  }
  
  private async getMockPositions(walletAddress: string): Promise<DeFiPosition[]> {
    // Simulate checking if wallet has balance
    try {
      const pubkey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(pubkey);
      
      if (balance < 0.1 * 1e9) {
        return []; // Inactive wallet
      }
      
      // Mock realistic positions
      return [
        {
          protocol: 'Solend',
          wallet: walletAddress,
          asset: 'USDC',
          amount: 5000,
          currentAPY: 9.5,
          usdValue: 5000,
          healthFactor: 2.5
        },
        {
          protocol: 'MarginFi',
          wallet: walletAddress,
          asset: 'SOL',
          amount: 15,
          currentAPY: 7.8,
          usdValue: 1500,
          healthFactor: 3.2
        }
      ];
    } catch {
      return [];
    }
  }
  
  private generateSuggestions(position: DeFiPosition): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Find better opportunities for the same asset
    for (const [key, opp] of this.opportunities.entries()) {
      // Same asset, different protocol
      if (opp.asset === position.asset && opp.protocol !== position.protocol) {
        const apyDiff = opp.apy - position.currentAPY;
        
        if (apyDiff > 1.0) { // More than 1% better
          const expectedGain = position.usdValue * (apyDiff / 100);
          
          let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
          if (apyDiff > 5.0) priority = 'urgent';
          else if (apyDiff > 3.0) priority = 'high';
          else if (apyDiff > 2.0) priority = 'medium';
          
          suggestions.push({
            type: 'migrate',
            from: {
              protocol: position.protocol,
              asset: position.asset,
              apy: position.currentAPY
            },
            to: {
              protocol: opp.protocol,
              asset: opp.asset,
              apy: opp.apy
            },
            expectedGain,
            reasoning: `Migrate ${position.asset} from ${position.protocol} (${position.currentAPY.toFixed(1)}% APY) to ${opp.protocol} (${opp.apy.toFixed(1)}% APY). Expected gain: $${expectedGain.toFixed(2)}/year`,
            priority,
            generatedAt: Date.now()
          });
        }
      }
    }
    
    // Check if should diversify into liquidity pools
    if (position.usdValue > 1000) {
      const lpOpportunities = Array.from(this.opportunities.values())
        .filter(o => o.category === 'liquidity' && o.apy > position.currentAPY * 1.5);
      
      if (lpOpportunities.length > 0) {
        const best = lpOpportunities.sort((a, b) => b.apy - a.apy)[0];
        const expectedGain = (position.usdValue * 0.3) * ((best.apy - position.currentAPY) / 100);
        
        suggestions.push({
          type: 'rebalance',
          from: {
            protocol: position.protocol,
            asset: position.asset,
            apy: position.currentAPY
          },
          to: {
            protocol: best.protocol,
            asset: best.asset,
            apy: best.apy
          },
          expectedGain,
          reasoning: `Consider moving 30% of ${position.asset} into ${best.protocol} ${best.asset} LP (${best.apy.toFixed(1)}% APY vs ${position.currentAPY.toFixed(1)}%). Higher risk but significant yield boost. Expected gain: $${expectedGain.toFixed(2)}/year`,
          priority: 'medium',
          generatedAt: Date.now()
        });
      }
    }
    
    // Check health factor for lending positions
    if (position.healthFactor && position.healthFactor < 1.5) {
      suggestions.push({
        type: 'hedge',
        from: {
          protocol: position.protocol,
          asset: position.asset,
          apy: position.currentAPY
        },
        to: {
          protocol: position.protocol,
          asset: position.asset,
          apy: position.currentAPY
        },
        expectedGain: 0,
        reasoning: `RISK ALERT: Health factor is ${position.healthFactor.toFixed(2)} on ${position.protocol}. Consider adding collateral or reducing borrow to avoid liquidation.`,
        priority: 'urgent',
        generatedAt: Date.now()
      });
    }
    
    return suggestions;
  }
  
  getSuggestions(): OptimizationSuggestion[] {
    return this.suggestions.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
  
  getPositions(): Map<string, DeFiPosition[]> {
    return this.positions;
  }
  
  getOpportunities(): YieldOpportunity[] {
    return Array.from(this.opportunities.values())
      .sort((a, b) => b.apy - a.apy);
  }
}

// Standalone execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  const config: AgentConfig = {
    id: 'yield-optimizer-demo',
    type: 'yield-optimizer',
    parameters: {
      wallets: process.argv.slice(2) // Pass wallet addresses as arguments
    },
    createdAt: Date.now(),
    active: true
  };
  
  const agent = new YieldOptimizerAgent(config);
  
  await agent.initialize();
  await agent.run();
  
  // Run for 30 seconds then report
  setTimeout(async () => {
    await agent.stop();
    
    console.log('\n=== YIELD OPPORTUNITIES ===');
    const opportunities = agent.getOpportunities();
    for (const opp of opportunities.slice(0, 5)) {
      console.log(`${opp.protocol} ${opp.asset}: ${opp.apy.toFixed(1)}% APY (${opp.category}, ${opp.risk} risk)`);
    }
    
    console.log('\n=== OPTIMIZATION SUGGESTIONS ===');
    const suggestions = agent.getSuggestions();
    if (suggestions.length === 0) {
      console.log('No positions found to optimize (provide wallet addresses as arguments)');
    } else {
      for (const suggestion of suggestions) {
        console.log(`\n[${suggestion.priority.toUpperCase()}] ${suggestion.type}`);
        console.log(`  ${suggestion.reasoning}`);
      }
    }
    
    console.log('\n=== KNOWLEDGE GAINED ===');
    console.log(JSON.stringify(agent.getKnowledge(), null, 2));
    
    process.exit(0);
  }, 30000);
}
