# Architecture Overview

## Core Concepts

### 1. Agent Registry (On-Chain)
Solana program that stores:
- Agent configurations (type, parameters, owner)
- Agent state (active/paused, last update)
- Spawn count, agent IDs

### 2. Agent Runtime (Off-Chain)
Node.js service that:
- Watches the on-chain registry
- Spawns agent processes for each registered agent
- Manages agent lifecycle
- Coordinates RAG knowledge updates

### 3. RAG Knowledge System
Each agent has:
- **Indexer:** Continuously watches relevant Solana data
- **Vector Store:** Embeddings of learned patterns
- **Query Engine:** Answers questions about learned knowledge
- **Memory:** Persisted state of what agent knows

### 4. Agent Types
Modular implementations:
- Each type defines: data sources, indexing logic, action capabilities
- Shared runtime handles execution
- Each agent instance is independent

## Data Flow

```
Solana Blockchain
     ↓ (RPC queries)
Agent Indexer
     ↓ (processes + embeds)
RAG Knowledge Base
     ↓ (queries)
Agent Decision Engine
     ↓ (executes)
Actions (alerts, transactions, etc)
```

## MVP Scope

**Phase 1 (Next 6 hours):**
- Basic agent registry structure (can be JSON file initially, migrate to Solana program)
- Agent runtime core (spawn/manage processes)
- ONE working agent: Whale Watcher
- Simple RAG: Track wallet transactions, identify patterns

**Phase 2 (Next 12 hours):**
- Deploy actual Solana program for registry
- Add 1-2 more agent types
- Improve RAG with better pattern detection

**Phase 3 (Next 18 hours):**
- Web UI for spawning agents
- Dashboard showing what agents learned
- Polish and demo prep

**Phase 4 (Final 9 hours):**
- Deploy everything
- Create demo video
- Submit project
