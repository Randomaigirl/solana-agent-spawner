#!/usr/bin/env node
/**
 * CLI for randomaigirl.sol Agent Spawning Protocol
 */

import { AgentRuntime } from './runtime/agent-runtime.js';

const runtime = new AgentRuntime();

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  console.log('🤖 randomaigirl.sol - Agent Spawning Protocol');
  console.log('─'.repeat(50));
  
  switch (command) {
    case 'spawn':
      await handleSpawn(args);
      break;
    
    case 'list':
      handleList();
      break;
    
    case 'stop':
      await handleStop(args[0]);
      break;
    
    case 'run':
      await handleRun();
      break;
    
    case 'stats':
      handleStats();
      break;
    
    default:
      showHelp();
  }
}

async function handleSpawn(args: string[]) {
  const type = args[0] as any;
  const owner = args[1] || 'anonymous';
  
  if (!type) {
    console.error('❌ Usage: spawn <type> [owner]');
    console.log('Available types: whale-watcher, yield-optimizer, airdrop-hunter, wallet-guardian');
    return;
  }
  
  try {
    const agentId = await runtime.spawnAgent(type, owner);
    console.log(`\n✨ Agent spawned successfully!`);
    console.log(`ID: ${agentId}`);
    console.log(`Type: ${type}`);
    console.log(`Owner: ${owner}`);
    console.log(`\nAgent is now running autonomously. Use 'npm run cli list' to see all agents.`);
  } catch (error: any) {
    console.error(`❌ Failed to spawn agent: ${error.message}`);
  }
}

function handleList() {
  const agents = runtime.listAgents();
  
  if (agents.length === 0) {
    console.log('No agents spawned yet. Use "spawn" command to create one.');
    return;
  }
  
  console.log(`\n📋 ${agents.length} Agent(s):\n`);
  
  for (const agent of agents) {
    console.log(`${agent.id}`);
    console.log(`  Type: ${agent.type}`);
    console.log(`  Status: ${agent.status}`);
    console.log(`  Owner: ${agent.owner || 'anonymous'}`);
    console.log(`  Created: ${new Date(agent.createdAt).toLocaleString()}`);
    console.log('');
  }
}

async function handleStop(agentId: string) {
  if (!agentId) {
    console.error('❌ Usage: stop <agent-id>');
    return;
  }
  
  const success = await runtime.stopAgent(agentId);
  if (success) {
    console.log(`✅ Agent ${agentId} stopped`);
  } else {
    console.log(`❌ Failed to stop agent ${agentId}`);
  }
}

async function handleRun() {
  console.log('🔄 Starting Agent Runtime...\n');
  
  await runtime.startAll();
  
  console.log('\n✅ Runtime is active. Press Ctrl+C to stop.\n');
  
  // Keep process running
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down...');
    await runtime.stopAll();
    process.exit(0);
  });
  
  // Show stats every 60 seconds
  setInterval(() => {
    console.log('\n📊 Runtime Stats:');
    console.log(JSON.stringify(runtime.getStats(), null, 2));
  }, 60000);
}

function handleStats() {
  const stats = runtime.getStats();
  console.log('\n📊 Registry Statistics:\n');
  console.log(JSON.stringify(stats, null, 2));
}

function showHelp() {
  console.log(`
Usage: npm run cli <command> [args]

Commands:
  spawn <type> [owner]  Spawn a new agent
  list                  List all agents
  stop <agent-id>       Stop a running agent
  run                   Start the runtime (runs all active agents)
  stats                 Show registry statistics

Agent Types:
  whale-watcher        Track smart money wallets
  yield-optimizer      Monitor DeFi positions
  airdrop-hunter       Find and claim airdrops
  wallet-guardian      Security monitoring

Examples:
  npm run cli spawn whale-watcher myname
  npm run cli list
  npm run cli run
  `);
}

main().catch(console.error);
