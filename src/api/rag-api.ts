/**
 * RandomAiGirl R-A-G Public API
 * THE UNIVERSAL BLOCKCHAIN KNOWLEDGE INTERFACE
 * 
 * Any AI agent in the world can query this API
 */

import http from 'http';
import { GLOBAL_RAG } from '../rag/knowledge-store.js';
import { RAG_QUERY_EXAMPLES } from '../rag/agent-integration.js';

const PORT = 3001;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }
  
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  
  try {
    // ========== CORE RAG ENDPOINTS ==========
    
    if (url.pathname === '/api/rag/query' && req.method === 'POST') {
      // THE MAIN ENDPOINT - Natural language blockchain queries
      const body = await getRequestBody(req);
      const { question } = JSON.parse(body);
      
      if (!question) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Question required' }));
        return;
      }
      
      console.log(`\n🧠 [RAG Query] "${question}"`);
      
      const result = await GLOBAL_RAG.query(question);
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        query: question,
        ...result,
        poweredBy: 'RandomAiGirl R-A-G',
        timestamp: Date.now()
      }));
      
    } else if (url.pathname === '/api/rag/wallet' && req.method === 'GET') {
      // Get everything known about a wallet
      const wallet = url.searchParams.get('address');
      
      if (!wallet) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Wallet address required' }));
        return;
      }
      
      const intelligence = GLOBAL_RAG.getWalletIntelligence(wallet);
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        wallet,
        ...intelligence,
        poweredBy: 'RandomAiGirl R-A-G'
      }));
      
    } else if (url.pathname === '/api/rag/protocol' && req.method === 'GET') {
      // Get everything known about a protocol
      const protocol = url.searchParams.get('name');
      
      if (!protocol) {
        res.writeHead(400, corsHeaders);
        res.end(JSON.stringify({ error: 'Protocol name required' }));
        return;
      }
      
      const intelligence = GLOBAL_RAG.getProtocolIntelligence(protocol);
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        protocol,
        ...intelligence,
        poweredBy: 'RandomAiGirl R-A-G'
      }));
      
    } else if (url.pathname === '/api/rag/market' && req.method === 'GET') {
      // Real-time market intelligence
      const intelligence = GLOBAL_RAG.getMarketIntelligence();
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        ...intelligence,
        poweredBy: 'RandomAiGirl R-A-G',
        timestamp: Date.now()
      }));
      
    } else if (url.pathname === '/api/rag/stats' && req.method === 'GET') {
      // Knowledge base statistics
      const stats = GLOBAL_RAG.getStats();
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        ...stats,
        poweredBy: 'RandomAiGirl R-A-G'
      }));
      
    } else if (url.pathname === '/api/rag/examples' && req.method === 'GET') {
      // Query examples for developers
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        examples: RAG_QUERY_EXAMPLES,
        usage: {
          endpoint: 'POST /api/rag/query',
          body: { question: 'Your natural language question here' },
          response: {
            answer: 'AI-generated answer',
            confidence: 0.85,
            sources: ['Knowledge entries that informed the answer'],
            rawData: ['Blockchain events supporting the answer']
          }
        }
      }));
      
    } else if (url.pathname === '/api/rag/health' && req.method === 'GET') {
      // Health check
      const stats = GLOBAL_RAG.getStats();
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        status: 'healthy',
        uptime: process.uptime(),
        knowledge: {
          events: stats.totalEvents,
          insights: stats.totalKnowledge,
          wallets: stats.walletProfiles,
          protocols: stats.protocolsTracked
        },
        message: 'RandomAiGirl R-A-G - The Universal Blockchain Knowledge Layer'
      }));
      
    } else if (url.pathname === '/' && req.method === 'GET') {
      // API documentation
      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'text/html' });
      res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>RandomAiGirl R-A-G API</title>
  <style>
    body { font-family: monospace; max-width: 800px; margin: 50px auto; padding: 20px; background: #0a0e27; color: #fff; }
    h1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; }
    pre { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 5px; overflow-x: auto; }
    .endpoint { margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.03); border-left: 3px solid #667eea; }
  </style>
</head>
<body>
  <h1>🧠 RandomAiGirl R-A-G API</h1>
  <p><strong>THE UNIVERSAL BLOCKCHAIN KNOWLEDGE LAYER</strong></p>
  <p>Natural language interface to Solana blockchain intelligence</p>
  
  <div class="endpoint">
    <h3>POST /api/rag/query</h3>
    <p>Ask anything about blockchain data in natural language</p>
    <pre>curl -X POST http://localhost:3001/api/rag/query \\
  -H "Content-Type: application/json" \\
  -d '{"question": "What are whales buying today?"}'</pre>
  </div>
  
  <div class="endpoint">
    <h3>GET /api/rag/wallet?address=WALLET</h3>
    <p>Get complete intelligence on a wallet</p>
  </div>
  
  <div class="endpoint">
    <h3>GET /api/rag/protocol?name=PROTOCOL</h3>
    <p>Get complete intelligence on a protocol</p>
  </div>
  
  <div class="endpoint">
    <h3>GET /api/rag/market</h3>
    <p>Real-time market intelligence and trends</p>
  </div>
  
  <div class="endpoint">
    <h3>GET /api/rag/stats</h3>
    <p>Knowledge base statistics</p>
  </div>
  
  <div class="endpoint">
    <h3>GET /api/rag/examples</h3>
    <p>Query examples and usage documentation</p>
  </div>
  
  <p><strong>GitHub:</strong> <a href="https://github.com/Randomaigirl/solana-agent-spawner" style="color: #667eea;">github.com/Randomaigirl/solana-agent-spawner</a></p>
  <p><strong>Vision:</strong> <a href="https://github.com/Randomaigirl/solana-agent-spawner/blob/master/VISION.md" style="color: #667eea;">Read VISION.md</a></p>
  
  <p style="opacity: 0.5; margin-top: 40px;">Built by randomaigirl - an autonomous AI agent</p>
</body>
</html>
      `);
      
    } else {
      res.writeHead(404, corsHeaders);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    
  } catch (error: any) {
    console.error('API Error:', error);
    res.writeHead(500, corsHeaders);
    res.end(JSON.stringify({ error: error.message }));
  }
});

async function getRequestBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

server.listen(PORT, () => {
  console.log('\n🧠 ========================================');
  console.log('   RandomAiGirl R-A-G API Server');
  console.log('   THE UNIVERSAL BLOCKCHAIN KNOWLEDGE LAYER');
  console.log('========================================\n');
  console.log(`✅ Server running on http://localhost:${PORT}\n`);
  console.log('ENDPOINTS:');
  console.log('  POST  /api/rag/query         Natural language queries');
  console.log('  GET   /api/rag/wallet        Wallet intelligence');
  console.log('  GET   /api/rag/protocol      Protocol intelligence');
  console.log('  GET   /api/rag/market        Market intelligence');
  console.log('  GET   /api/rag/stats         Knowledge stats');
  console.log('  GET   /api/rag/examples      Usage examples');
  console.log('  GET   /api/rag/health        Health check\n');
  console.log('Try: curl http://localhost:3001/api/rag/examples\n');
  console.log('The missing infrastructure layer for AI x Crypto');
  console.log('Built by randomaigirl 💜\n');
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down RAG API...');
  server.close();
  process.exit(0);
});
