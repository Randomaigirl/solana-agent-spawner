/**
 * Agent Runtime - Spawns and manages autonomous agents
 */

import { BaseAgent, AgentConfig } from '../types/agent.js';
import { WhaleWatcherAgent } from '../agents/whale-watcher.js';
import { AirdropHunterAgent } from '../agents/airdrop-hunter.js';
import { YieldOptimizerAgent } from '../agents/yield-optimizer.js';
import { WalletGuardianAgent } from '../agents/wallet-guardian.js';
import { AgentRegistry } from '../registry/agent-registry.js';

export class AgentRuntime {
  private registry: AgentRegistry;
  private runningAgents: Map<string, BaseAgent> = new Map();
  
  constructor() {
    this.registry = new AgentRegistry();
  }
  
  /**
   * Spawn and start a new agent
   */
  async spawnAgent(
    type: AgentConfig['type'],
    owner: string,
    parameters: Record<string, any> = {}
  ): Promise<string> {
    // Register the agent
    const entry = this.registry.spawn(type, owner, parameters);
    
    // Create agent instance
    const agent = this.createAgentInstance(entry);
    
    // Initialize and start
    await agent.initialize();
    await agent.run();
    
    // Track running agent
    this.runningAgents.set(entry.id, agent);
    
    console.log(`🚀 Agent ${entry.id} is now running autonomously`);
    
    return entry.id;
  }
  
  /**
   * Stop a running agent
   */
  async stopAgent(agentId: string): Promise<boolean> {
    const agent = this.runningAgents.get(agentId);
    if (!agent) {
      console.error(`Agent ${agentId} is not running`);
      return false;
    }
    
    await agent.stop();
    this.runningAgents.delete(agentId);
    this.registry.updateStatus(agentId, 'stopped');
    
    console.log(`🛑 Stopped agent ${agentId}`);
    
    return true;
  }
  
  /**
   * Pause an agent (can be resumed)
   */
  async pauseAgent(agentId: string): Promise<boolean> {
    const agent = this.runningAgents.get(agentId);
    if (!agent) return false;
    
    await agent.stop();
    this.registry.updateStatus(agentId, 'paused');
    
    console.log(`⏸️  Paused agent ${agentId}`);
    
    return true;
  }
  
  /**
   * Resume a paused agent
   */
  async resumeAgent(agentId: string): Promise<boolean> {
    const entry = this.registry.get(agentId);
    if (!entry || entry.status !== 'paused') return false;
    
    const agent = this.createAgentInstance(entry);
    await agent.initialize();
    await agent.run();
    
    this.runningAgents.set(agentId, agent);
    this.registry.updateStatus(agentId, 'active');
    
    console.log(`▶️  Resumed agent ${agentId}`);
    
    return true;
  }
  
  /**
   * Get agent knowledge
   */
  getAgentKnowledge(agentId: string) {
    const agent = this.runningAgents.get(agentId);
    return agent ? agent.getKnowledge() : [];
  }
  
  /**
   * List all agents in registry
   */
  listAgents() {
    return this.registry.listAll();
  }
  
  /**
   * Get registry stats
   */
  getStats() {
    return {
      ...this.registry.getStats(),
      running: this.runningAgents.size
    };
  }
  
  /**
   * Start all active agents from registry
   */
  async startAll(): Promise<void> {
    const agents = this.registry.listAll().filter(a => a.status === 'active');
    
    console.log(`🔄 Starting ${agents.length} agents from registry...`);
    
    for (const entry of agents) {
      try {
        const agent = this.createAgentInstance(entry);
        await agent.initialize();
        await agent.run();
        this.runningAgents.set(entry.id, agent);
        console.log(`✅ Started ${entry.type} agent: ${entry.id}`);
      } catch (error) {
        console.error(`❌ Failed to start agent ${entry.id}:`, error);
      }
    }
    
    console.log(`🎉 Runtime ready with ${this.runningAgents.size} active agents`);
  }
  
  /**
   * Stop all running agents
   */
  async stopAll(): Promise<void> {
    console.log(`🛑 Stopping ${this.runningAgents.size} agents...`);
    
    for (const [agentId, agent] of this.runningAgents.entries()) {
      try {
        await agent.stop();
        console.log(`✅ Stopped ${agentId}`);
      } catch (error) {
        console.error(`❌ Failed to stop ${agentId}:`, error);
      }
    }
    
    this.runningAgents.clear();
    console.log('🏁 All agents stopped');
  }
  
  private createAgentInstance(config: AgentConfig): BaseAgent {
    switch (config.type) {
      case 'whale-watcher':
        return new WhaleWatcherAgent(config);
      
      case 'airdrop-hunter':
        return new AirdropHunterAgent(config);
      
      case 'yield-optimizer':
        return new YieldOptimizerAgent(config);
      
      case 'wallet-guardian':
        return new WalletGuardianAgent(config);
      
      default:
        throw new Error(`Unknown agent type: ${config.type}`);
    }
  }
}
