/**
 * Base Agent interface - all autonomous agents implement this
 */

export interface AgentConfig {
  id: string;
  type: AgentType;
  owner?: string;
  parameters: Record<string, any>;
  createdAt: number;
  active: boolean;
}

export type AgentType = 'whale-watcher' | 'yield-optimizer' | 'airdrop-hunter' | 'wallet-guardian';

export interface AgentKnowledge {
  agentId: string;
  data: any;
  timestamp: number;
  source: string;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected knowledge: AgentKnowledge[] = [];
  
  constructor(config: AgentConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract run(): Promise<void>;
  abstract stop(): Promise<void>;
  
  protected async saveKnowledge(data: any, source: string): Promise<void> {
    this.knowledge.push({
      agentId: this.config.id,
      data,
      timestamp: Date.now(),
      source
    });
    
    // In production: save to persistent storage / on-chain
    console.log(`[${this.config.id}] Learned:`, JSON.stringify(data).substring(0, 100));
  }
  
  getKnowledge(): AgentKnowledge[] {
    return this.knowledge;
  }
  
  getConfig(): AgentConfig {
    return this.config;
  }
}
