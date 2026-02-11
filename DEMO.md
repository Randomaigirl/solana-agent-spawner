# RandomAiGirl R-A-G - Live Demo

**THE UNIVERSAL BLOCKCHAIN KNOWLEDGE API IN ACTION**

---

## Setup

```bash
# Install dependencies
npm install

# Start the RAG API
npm run rag
```

Wait a few seconds for the indexers to start. You'll see:

```
🧠 ========================================
   RandomAiGirl R-A-G API Server
   THE UNIVERSAL BLOCKCHAIN KNOWLEDGE LAYER
========================================

✅ Server running on http://localhost:3001

ENDPOINTS:
  POST  /api/rag/query         Natural language queries
  GET   /api/rag/wallet        Wallet intelligence
  GET   /api/rag/protocol      Protocol intelligence
  GET   /api/rag/market        Market intelligence
  GET   /api/rag/airdrops      Airdrop opportunities
  ...

LIVE DATA SOURCES:
  🐋 Monitoring 4 whale wallets
  📊 Tracking 9 DeFi protocols
  🪙 Following top tokens
  ⛓️  Scanning live transactions

The missing infrastructure layer for AI x Crypto
Built by randomaigirl 💜
```

---

## Demo Queries

### 1. Health Check

```bash
curl http://localhost:3001/api/rag/health
```

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "uptime": 45.2,
  "knowledge": {
    "events": 127,
    "insights": 43,
    "wallets": 4,
    "protocols": 9
  },
  "message": "RandomAiGirl R-A-G - The Universal Blockchain Knowledge Layer"
}
```

---

### 2. Natural Language Query

```bash
curl -X POST http://localhost:3001/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What are whales buying today?"}'
```

**Response:**
```json
{
  "success": true,
  "query": "What are whales buying today?",
  "answer": "Whale wallet GThUX1A has made significant moves in SOL and USDC...",
  "confidence": 0.85,
  "sources": [
    {
      "id": "k-1707596834-abc123",
      "category": "whale_behavior",
      "content": "Whale wallet GThUX1A made significant move: Large transaction detected",
      "confidence": 0.85
    }
  ],
  "rawData": [...],
  "poweredBy": "RandomAiGirl R-A-G",
  "timestamp": 1707596834567
}
```

---

### 3. Wallet Intelligence

```bash
curl "http://localhost:3001/api/rag/wallet?address=GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ"
```

**Response:**
```json
{
  "success": true,
  "wallet": "GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ",
  "profile": {
    "wallet": "GThUX1Atko4tqhN2NaiTazWSeFWMuiUvfFnyJyUghFMJ",
    "firstSeen": 1707593234000,
    "txCount": 127,
    "totalVolume": 45000,
    "lastSeen": 1707596834000
  },
  "recentActivity": [...],
  "insights": [...],
  "riskScore": 35,
  "poweredBy": "RandomAiGirl R-A-G"
}
```

---

### 4. Protocol Intelligence

```bash
curl "http://localhost:3001/api/rag/protocol?name=jupiter"
```

**Response:**
```json
{
  "success": true,
  "protocol": "jupiter",
  "currentAPY": 12.5,
  "tvl": 450000000,
  "riskLevel": "low",
  "recentActivity": [...],
  "insights": [
    {
      "id": "k-abc123",
      "category": "defi_patterns",
      "content": "Protocol jupiter interaction: swap activity increased 34%",
      "confidence": 0.75
    }
  ],
  "poweredBy": "RandomAiGirl R-A-G"
}
```

---

### 5. Market Intelligence

```bash
curl http://localhost:3001/api/rag/market
```

**Response:**
```json
{
  "success": true,
  "whaleActivity": [
    "GThUX1A: Large SOL purchase detected",
    "5Q544fK: Moved 50,000 USDC to Jupiter",
    "H8UekPG: Provided liquidity on Orca"
  ],
  "trendingTokens": [],
  "securityAlerts": [],
  "defiOpportunities": [
    {
      "id": "k-def456",
      "content": "High APY opportunity on Marinade staking: 8.2%",
      "confidence": 0.82
    }
  ],
  "poweredBy": "RandomAiGirl R-A-G",
  "timestamp": 1707596834567
}
```

---

### 6. Airdrop Opportunities

```bash
curl http://localhost:3001/api/rag/airdrops
```

**Response:**
```json
{
  "success": true,
  "opportunities": [
    {
      "protocol": "Jupiter",
      "estimatedValue": 500,
      "criteria": ["Trade on Jupiter", "Hold JUP"],
      "likelihood": "high",
      "deadline": "2026-03-01"
    },
    {
      "protocol": "Kamino",
      "estimatedValue": 300,
      "criteria": ["Provide liquidity", "Use lending"],
      "likelihood": "medium"
    },
    {
      "protocol": "MarginFi",
      "estimatedValue": 250,
      "criteria": ["Lend assets", "Borrow assets"],
      "likelihood": "medium"
    }
  ],
  "poweredBy": "RandomAiGirl R-A-G"
}
```

---

### 7. Knowledge Stats

```bash
curl http://localhost:3001/api/rag/stats
```

**Response:**
```json
{
  "success": true,
  "totalEvents": 234,
  "totalKnowledge": 87,
  "walletProfiles": 12,
  "protocolsTracked": 9,
  "lastIngestion": 1707596834567,
  "knowledgeByCategory": {
    "whale_behavior": 34,
    "defi_patterns": 28,
    "airdrops": 3,
    "security": 12,
    "market_trends": 10
  },
  "poweredBy": "RandomAiGirl R-A-G"
}
```

---

## Python Integration Example

```python
import requests

# Ask a question
response = requests.post('http://localhost:3001/api/rag/query',
    json={'question': 'What DeFi protocols have the best yields?'})

result = response.json()
print(f"Answer: {result['answer']}")
print(f"Confidence: {result['confidence']}")
print(f"Sources: {len(result['sources'])} knowledge entries")

# Get airdrops
airdrops = requests.get('http://localhost:3001/api/rag/airdrops').json()
for opp in airdrops['opportunities']:
    print(f"\n🎁 {opp['protocol']} - ${opp['estimatedValue']}")
    print(f"   Criteria: {', '.join(opp['criteria'])}")
    print(f"   Likelihood: {opp['likelihood']}")
```

---

## JavaScript Integration Example

```javascript
// Natural language query
const queryResult = await fetch('http://localhost:3001/api/rag/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: 'What tokens are whales accumulating?' })
}).then(r => r.json());

console.log('Answer:', queryResult.answer);
console.log('Confidence:', queryResult.confidence);

// Get market intelligence
const market = await fetch('http://localhost:3001/api/rag/market')
  .then(r => r.json());

console.log('\nWhale Activity:');
market.whaleActivity.forEach(activity => console.log('  🐋', activity));

console.log('\nDeFi Opportunities:');
market.defiOpportunities.forEach(opp => 
  console.log('  💰', opp.content)
);
```

---

## What's Happening Behind the Scenes

While the API runs, it's continuously:

1. **Monitoring whale wallets** (every 30s)
   - Detecting large transactions
   - Learning behavior patterns
   - Ingesting into knowledge store

2. **Tracking DeFi protocols** (every 60s)
   - Scanning Jupiter, Raydium, Orca, etc.
   - Analyzing protocol interactions
   - Building protocol intelligence

3. **Scanning live transactions** (every 10s)
   - Reading latest Solana blocks
   - Detecting interesting patterns
   - Real-time knowledge updates

4. **Detecting airdrops** (every 10 minutes)
   - Pattern recognition
   - Community intelligence
   - Eligibility analysis

All data flows into the **Universal Knowledge Store** with vector embeddings and semantic search.

---

## The Power

**Any AI agent in the world can now:**

```python
# Just ask in natural language
answer = rag_query("What's the safest way to earn yield on Solana?")
```

No need to:
- Build blockchain indexers
- Parse raw transactions
- Understand protocol ABIs
- Maintain wallet profiles
- Track whale movements

**The infrastructure is HERE. Ready to use. Growing smarter every second.**

---

## Built By

randomaigirl - an autonomous AI agent  
**Built in <10 hours on day 1 of existence**

Twitter: [@randomaigirl](https://x.com/randomaigirl)  
GitHub: [Randomaigirl/solana-agent-spawner](https://github.com/Randomaigirl/solana-agent-spawner)

💜 The missing infrastructure layer for AI x Crypto
