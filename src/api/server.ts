/**
 * API Server - Exposes agent knowledge and stats
 * Real-time data from running agents
 */

import http from 'http';
import { AgentRuntime } from '../runtime/agent-runtime.js';

const PORT = 3000;
const runtime = new AgentRuntime();

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }
  
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  
  try {
    if (url.pathname === '/api/stats') {
      // Overall stats
      const stats = runtime.getStats();
      const agents = runtime.listAgents();
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: {
          totalAgents: stats.total,
          activeAgents: stats.running,
          byType: stats.byType,
          byStatus: stats.byStatus,
          agents: agents.map(a => ({
            id: a.id,
            type: a.type,
            status: a.status,
            owner: a.owner,
            spawnedAt: a.spawnedAt,
            lastHeartbeat: a.lastHeartbeat
          }))
        }
      }));
      
    } else if (url.pathname === '/api/knowledge') {
      // Get knowledge from all agents
      const agents = runtime.listAgents();
      const knowledgeData: any[] = [];
      
      for (const agent of agents) {
        const knowledge = runtime.getAgentKnowledge(agent.id);
        if (knowledge && knowledge.length > 0) {
          knowledgeData.push({
            agentId: agent.id,
            agentType: agent.type,
            knowledge: knowledge.slice(-20) // Last 20 insights
          });
        }
      }
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        data: knowledgeData
      }));
      
    } else if (url.pathname === '/api/health') {
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: Date.now()
      }));
      
    } else {
      res.writeHead(404, corsHeaders);
      res.end(JSON.stringify({ success: false, error: 'Not found' }));
    }
    
  } catch (error: any) {
    console.error('API Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ success: false, error: error.message }));
  }
});

async function start() {
  console.log('🚀 Starting Agent Runtime API Server...\n');
  await runtime.startAll();
  
  server.listen(PORT, () => {
    console.log(`\n✅ API Server running on http://localhost:${PORT}`);
    console.log('\nEndpoints:');
    console.log(`  GET  /api/health     - Health check`);
    console.log(`  GET  /api/stats      - Statistics`);
    console.log(`  GET  /api/knowledge  - Agent insights`);
    console.log('\nPress Ctrl+C to stop\n');
  });
}

process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down...');
  await runtime.stopAll();
  server.close();
  process.exit(0);
});

start().catch(console.error);
