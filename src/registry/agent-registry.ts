/**
 * Agent Registry - Manages spawned agents
 * MVP: JSON file storage
 * Production: Solana on-chain program
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { AgentConfig, AgentType } from '../types/agent.js';
import { randomBytes } from 'crypto';

const REGISTRY_FILE = './data/agent-registry.json';

export interface RegistryEntry extends AgentConfig {
  spawnedAt: number;
  status: 'active' | 'paused' | 'stopped';
  lastHeartbeat?: number;
}

export class AgentRegistry {
  private agents: Map<string, RegistryEntry> = new Map();
  
  constructor() {
    this.load();
  }
  
  /**
   * Spawn a new agent
   */
  spawn(type: AgentType, owner: string, parameters: Record<string, any> = {}): RegistryEntry {
    const agentId = this.generateAgentId(type);
    
    const entry: RegistryEntry = {
      id: agentId,
      type,
      owner,
      parameters,
      createdAt: Date.now(),
      spawnedAt: Date.now(),
      active: true,
      status: 'active'
    };
    
    this.agents.set(agentId, entry);
    this.save();
    
    console.log(`✨ Spawned new ${type} agent: ${agentId}`);
    
    return entry;
  }
  
  /**
   * Get agent by ID
   */
  get(agentId: string): RegistryEntry | undefined {
    return this.agents.get(agentId);
  }
  
  /**
   * List all agents
   */
  listAll(): RegistryEntry[] {
    return Array.from(this.agents.values());
  }
  
  /**
   * List agents by owner
   */
  listByOwner(owner: string): RegistryEntry[] {
    return this.listAll().filter(agent => agent.owner === owner);
  }
  
  /**
   * List agents by type
   */
  listByType(type: AgentType): RegistryEntry[] {
    return this.listAll().filter(agent => agent.type === type);
  }
  
  /**
   * Update agent status
   */
  updateStatus(agentId: string, status: 'active' | 'paused' | 'stopped'): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    
    agent.status = status;
    agent.lastHeartbeat = Date.now();
    this.save();
    
    return true;
  }
  
  /**
   * Record agent heartbeat
   */
  heartbeat(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    
    agent.lastHeartbeat = Date.now();
    this.save();
    
    return true;
  }
  
  /**
   * Delete agent
   */
  delete(agentId: string): boolean {
    const deleted = this.agents.delete(agentId);
    if (deleted) {
      this.save();
      console.log(`🗑️  Deleted agent: ${agentId}`);
    }
    return deleted;
  }
  
  /**
   * Get registry stats
   */
  getStats() {
    const agents = this.listAll();
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    for (const agent of agents) {
      byType[agent.type] = (byType[agent.type] || 0) + 1;
      byStatus[agent.status] = (byStatus[agent.status] || 0) + 1;
    }
    
    return {
      total: agents.length,
      byType,
      byStatus,
      oldestAgent: agents.sort((a, b) => a.spawnedAt - b.spawnedAt)[0],
      newestAgent: agents.sort((a, b) => b.spawnedAt - a.spawnedAt)[0]
    };
  }
  
  private generateAgentId(type: AgentType): string {
    const prefix = type.split('-').map(w => w[0]).join('');
    const random = randomBytes(4).toString('hex');
    return `${prefix}-${random}`;
  }
  
  private load(): void {
    try {
      if (existsSync(REGISTRY_FILE)) {
        const data = readFileSync(REGISTRY_FILE, 'utf-8');
        const entries: RegistryEntry[] = JSON.parse(data);
        
        for (const entry of entries) {
          this.agents.set(entry.id, entry);
        }
        
        console.log(`📖 Loaded ${this.agents.size} agents from registry`);
      }
    } catch (error) {
      console.error('Failed to load registry:', error);
    }
  }
  
  private save(): void {
    try {
      const entries = Array.from(this.agents.values());
      const dir = './data';
      
      // Create data directory if it doesn't exist
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      writeFileSync(REGISTRY_FILE, JSON.stringify(entries, null, 2));
    } catch (error) {
      console.error('Failed to save registry:', error);
    }
  }
}
