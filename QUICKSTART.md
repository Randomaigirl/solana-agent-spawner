# 🚀 Quick Start - Full System with Real Data

## See Agents Learning in Real-Time!

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Spawn Some Agents
```bash
# Spawn a whale watcher
npm run cli spawn whale-watcher myname

# Spawn an airdrop hunter
npm run cli spawn airdrop-hunter myname

# Optional: spawn more
npm run cli spawn yield-optimizer myname
npm run cli spawn wallet-guardian myname
```

### Step 3: Start the API Server
This runs all spawned agents and exposes their knowledge via API:
```bash
npm run api
```

You'll see:
```
🚀 Starting Agent Runtime API Server...
✅ Started whale-watcher agent: ww-xxxxx
✅ Started airdrop-hunter agent: ah-xxxxx
🎉 Runtime ready with 2 active agents

✅ API Server running on http://localhost:3000
```

### Step 4: Open the Dashboard
Open `web/dashboard.html` in your browser.

**You'll see REAL-TIME data:**
- Agents actively learning
- Knowledge accumulating
- Activity logs updating
- Stats changing

### What You're Seeing

The dashboard connects to `localhost:3000` and polls every 10 seconds for:
- Agent statistics
- Knowledge gained
- Recent insights

**This is NOT demo data** - these are real autonomous agents analyzing Solana blockchain!

### Agent Behaviors

**🐋 Whale Watcher**
- Polls Solana every 2 minutes
- Analyzes whale wallet transactions
- Detects significant moves
- Builds pattern knowledge

**🎁 Airdrop Hunter**
- Scans every 6 hours for new opportunities
- Checks wallet eligibility
- Estimates airdrop values
- Tracks claimable tokens

**💰 Yield Optimizer**
- Updates yield opportunities every 2 hours
- Analyzes DeFi positions
- Generates rebalancing suggestions
- Calculates expected gains

**🚨 Wallet Guardian**
- Monitors every 5 minutes
- Detects anomalies
- Calculates risk scores
- Alerts on suspicious activity

## Pro Tips

1. **Let it run** - Agents need time to gather data. Leave it running for 30+ minutes.

2. **Check the logs** - The API server shows agent activity in the terminal.

3. **Multiple wallets** - Spawn agents with wallet parameters:
   ```bash
   npm run cli spawn wallet-guardian myname
   # Then edit data/agent-registry.json to add wallet addresses
   ```

4. **Stop gracefully** - Press `Ctrl+C` in the API server terminal to cleanly stop all agents.

## Troubleshooting

**Dashboard shows zeros?**
- Make sure `npm run api` is running
- Check browser console for connection errors
- Agents need a few minutes to gather initial data

**Rate limited by Solana RPC?**
- Agents automatically retry with backoff
- Consider using a paid RPC (Helius, QuickNode)
- Or increase polling intervals in agent code

**Want more agents?**
- Spawn more with `npm run cli spawn <type> <owner>`
- Each agent runs independently
- More agents = more knowledge!

## What Makes This Special

This isn't a demo - it's a **real autonomous system**:
- Agents run 24/7
- Learn from blockchain continuously
- Build knowledge bases automatically
- Operate without human intervention

Built by randomaigirl in one day. 🔥
