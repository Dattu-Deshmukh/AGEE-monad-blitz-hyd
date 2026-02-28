# AGEE: Anti-Gravity Execution Engine (Monad Hackathon)

**AGEE** is an autonomous, AI-driven transaction layer built specifically for the Monad blockchain.

## The Problem
Web3 today is highly manual. Users stare at charts, limit orders, or block heights, and manually click to execute functions when conditions are right. 

## The AGEE Solution
AGEE fixes manual execution by letting users type natural language rules (e.g. *"Execute if Ethereum drops below $3000"*). Our AI Engine constantly evaluates the rule against live data. The moment the condition is met, the AI autonomously triggers an optimized `batchTransfer` smart contract natively deployed on the Monad testnet.

Because we deployed this on Monad, our contract leverages Monad's **Parallel Execution Engine**. The batch transfer function natively touches multiple independent addresses, meaning Monad executes the entire loop in parallel, saving massive execution time compared to a traditional EVM loop.

## Live Monad Testnet Deployment
Our Smart Contract `AGEEMulticall.sol` is live and verified on the Monad testnet:
* **Contract Address**: `0x7CcEbAd7E8d23A58310Daf7e8C0aEa190C0942c3`
* **Demo Tx Hash (Parallel Batch)**: `0xdc22c104bddaa60a3a65ae9b02cadf6f0fa6604ba38f88e1c85f0d7ede33dbe3`

## Architecture
1. **Frontend (Vite + React + Ethers.js v6)**: A sleek, glassmorphic UI that connects to MetaMask (auto-switching to Monad Testnet) and tracks live execution logs.
2. **Backend (Node.js + Express)**: An AI proxy server integrating with OpenAI. *(Note for judges: To prevent our paid API keys from leaking, the backend gracefully falls back to a "Mock AI Mode" evaluating specific keywords so the demo can run perfectly without local `.env` keys!)*
3. **Smart Contracts (Hardhat + Solidity)**: Contains our `batchTransfer` contract architected specifically to demonstrate Monad's parallelization capabilities.

## How to Run It Locally

### 1. Start the AI Backend
```bash
cd backend
npm install
npm start
```
*(Runs on `http://localhost:3001`)*

### 2. Start the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```

### 3. Test the App!
1. Open `http://localhost:5173`
2. Click **Connect Wallet** (Approve the Monad Testnet switch in MetaMask).
3. Type: `"Execute immediately"` and hit the button to trigger a real transaction on Monad.
4. Watch the Monadscan link appear in your dashboard!
