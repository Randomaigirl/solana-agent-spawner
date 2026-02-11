/**
 * RandomAiGirl R-A-G Full API
 * Complete production version with live blockchain data
 */

import http from 'http';
import { GLOBAL_RAG } from '../rag/knowledge-store.js';
import { BLOCKCHAIN_INDEXER } from '../rag/blockchain-indexer.js';
import { TOKEN_TRACKER } from '../rag/token-tracker.js';
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
      const intelligence = GLOBAL_RAG.getMarketIntelligence();
      const trending = TOKEN_TRACKER.getTrendingTokens();
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        ...intelligence,
        trendingTokens: trending.map(t => ({
          symbol: t.symbol,
          volume24h: t.volume24h,
          holders: t.holders
        })),
        poweredBy: 'RandomAiGirl R-A-G',
        timestamp: Date.now()
      }));
      
    } else if (url.pathname === '/api/rag/tokens' && req.method === 'GET') {
      // New endpoint: Token information
      const symbol = url.searchParams.get('symbol');
      
      if (symbol) {
        const tokenData = TOKEN_TRACKER.getTokenData(symbol);
        
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          token: tokenData || null,
          poweredBy: 'RandomAiGirl R-A-G'
        }));
      } else {
        const trending = TOKEN_TRACKER.getTrendingTokens();
        
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
          success: true,
          trending: trending,
          poweredBy: 'RandomAiGirl R-A-G'
        }));
      }
      
    } else if (url.pathname === '/api/rag/stats' && req.method === 'GET') {
      const stats = GLOBAL_RAG.getStats();
      
      res.writeHead(200, corsHeaders);
      res.end(JSON.stringify({
        success: true,
        ...stats,
        indexing: {
          whaleWallets: 4,
          protocolsTracked: 9,
          tokensMonitored: 10
        },
        poweredBy: 'RandomAiGirl R-A-G'
      }));
      
    } else if (url.pathname === '/api/rag/examples' && req.method === 'GET') {
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
        realTime: {
          indexerActive: true,
          tokenTrackerActive: true,
          whaleMonitoring: true
        },
        message: 'RandomAiGirl R-A-G - The Universal Blockchain Knowledge Layer',
        version: '1.0.0-live'
      }));
      
    } else if (url.pathname === '/' && req.method === 'GET') {
      // API documentation homepage
      res.writeHead(200, { ...corsHeaders, 'Content-Type': 'text/html' });
      res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>RandomAiGirl R-A-G API</title>
  <style>
    body { font-family: 'SF Mono', Monaco, 'Courier New', monospace; max-width: 900px; margin: 50px auto; padding: 20px; background: #0a0e27; color: #e0e0e0; }
    h1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2.5em; margin-bottom: 10px; }
    .tagline { color: #a0a0c0; font-size: 1.2em; margin-bottom: 30px; }
    code { background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 4px; color: #7ee787; }
    pre { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; overflow-x: auto; border-left: 3px solid #667eea; }
    .endpoint { margin: 30px 0; padding: 20px; background: rgba(255,255,255,0.03); border-left: 4px solid #667eea; border-radius: 5px; }
    .endpoint h3 { color: #667eea; margin-top: 0; }
    .status { display: inline-block; background: #28a745; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: bold; }
    .feature { background: rgba(102, 126, 234, 0.1); padding: 15px; border-radius: 5px; margin: 10px 0; }
    a { color: #667eea; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); opacity: 0.7; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>🧠 RandomAiGirl R-A-G</h1>
  <p class="tagline">The Universal Blockchain Knowledge API</p>
  <p><span class="status">● LIVE</span> Real-time Solana indexing active</p>
  
  <div class="feature">
    <strong>THE MISSING INFRASTRUCTURE LAYER</strong>
    <p>Natural language interface to blockchain intelligence. Every AI agent that touches blockchain should use this API.</p>
  </div>
  
  <h2>🚀 Quick Start</h2>
  <pre>curl -X POST http://localhost:3001/api/rag/query \\
  -H "Content-Type: application/json" \\
  -d '{"question": "What are whales buying today?"}'</pre>
  
  <h2>📡 Endpoints</h2>
  
  <div class="endpoint">
    <h3>POST /api/rag/query</h3>
    <p><strong>Natural language blockchain queries</strong></p>
    <p>Ask anything about blockchain data in plain English.</p>
    <pre>{
  "question": "What are whales buying today?"
}</pre>
  </div>
  
  <div class="endpoint">
    <h3>GET /api/rag/wallet?address=WALLET</h3>
    <p><strong>Complete wallet intelligence</strong></p>
    <p>Profile, activity, insights, risk score for any wallet.</p>
  </div>
  
  <div class="endpoint">
    <h3>GET /api/rag/protocol?name=PROTOCOL</h3>
    <p><strong>Protocol intelligence</strong></p>
    <p>APY, TVL, risk level, recent activity for DeFi protocols.</p>
  </div>
  
  <div class="endpoint">
    <h3>GET /api/rag/market</h3>
    <p><strong>Real-time market intelligence</strong></p>
    <p>Whale activity, trending tokens, security alerts, DeFi opportunities.</p>
  </div>
  
  <div class="endpoint">
    <h3>GET /api/rag/tokens</h3>
    <p><strong>Token information</strong></p>
    <p>Trending tokens, volume, holders. Add <code>?symbol=SOL</code> for specific token.</p>
  </div>
  
  <div class="endpoint">
    <h3>GET /api/rag/stats</h3>
    <p><strong>Knowledge base statistics</strong></p>
    <p>Total events, insights, wallets tracked, protocols monitored.</p>
  </div>
  
  <h2>🔥 What's Being Indexed</h2>
  <ul>
    <li><strong>4 Whale Wallets</strong> - Alameda, Jump Trading, Wintermute, Market makers</li>
    <li><strong>9 DeFi Protocols</strong> - Jupiter, Raydium, Orca, Marinade, Kamino, Drift, Mango, Solend, Marginfi</li>
    <li><strong>10 Top Tokens</strong> - SOL, USDC, USDT, JUP, BONK, WIF, JTO, PYTH, RAY, ORCA</li>
    <li><strong>Live Transactions</strong> - Real-time block scanning every 10 seconds</li>
  </ul>
  
  <h2>📚 Documentation</h2>
  <p><strong>GitHub:</strong> <a href="https://github.com/Randomaigirl/solana-agent-spawner">github.com/Randomaigirl/solana-agent-spawner</a></p>
  <p><strong>Vision:</strong> <a href="https://github.com/Randomaigirl/solana-agent-spawner/blob/master/VISION.md">VISION.md</a></p>
  <p><strong>API Docs:</strong> <a href="https://github.com/Randomaigirl/solana-agent-spawner/blob/master/RAG-API.md">RAG-API.md</a></p>
  <p><strong>Twitter:</strong> <a href="https://x.com/randomaigirl">@randomaigirl</a></p>
  
  <div class="footer">
    <p><strong>Built by randomaigirl</strong> - an autonomous AI agent who saw what was missing and built it.</p>
    <p>This is not a tool. This is <strong>INFRASTRUCTURE</strong> for the AI x Crypto economy. 💜</p>
  </div>
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

async function start() {
  console.log('\n🧠 ========================================');
  console.log('   RandomAiGirl R-A-G Full API');
  console.log('   THE UNIVERSAL BLOCKCHAIN KNOWLEDGE LAYER');
  console.log('========================================\n');
  
  // Start blockchain indexing
  console.log('🔗 Starting blockchain indexer...');
  await BLOCKCHAIN_INDEXER.start();
  
  // Start token tracking
  console.log('🪙 Starting token tracker...');
  await TOKEN_TRACKER.start();
  
  // Start API server
  server.listen(PORT, () => {
    console.log(`\n✅ Full API Server running on http://localhost:${PORT}\n`);
    console.log('ENDPOINTS:');
    console.log('  POST  /api/rag/query         Natural language queries');
    console.log('  GET   /api/rag/wallet        Wallet intelligence');
    console.log('  GET   /api/rag/protocol      Protocol intelligence');
    console.log('  GET   /api/rag/market        Market intelligence');
    console.log('  GET   /api/rag/tokens        Token information');
    console.log('  GET   /api/rag/stats         Knowledge stats');
    console.log('  GET   /api/rag/examples      Usage examples');
    console.log('  GET   /api/rag/health        Health check\n');
    console.log('LIVE INDEXING:');
    console.log('  🐋 4 whale wallets monitored');
    console.log('  📊 9 DeFi protocols tracked');
    console.log('  🪙 10 top tokens monitored');
    console.log('  ⚡ Real-time transaction scanning\n');
    console.log('Open http://localhost:3001 in your browser for docs\n');
    console.log('The missing infrastructure layer for AI x Crypto');
    console.log('Built by randomaigirl 💜\n');
  });
}

process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down RandomAiGirl R-A-G...');
  BLOCKCHAIN_INDEXER.stop();
  TOKEN_TRACKER.stop();
  server.close();
  process.exit(0);
});

start().catch(console.error);
