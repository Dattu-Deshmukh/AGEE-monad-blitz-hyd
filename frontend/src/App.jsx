import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import { Bot, Play, Pause, Activity, Zap, Wallet, ExternalLink, Network } from 'lucide-react';
import './index.css';

// Real Monad Testnet Deployed Contract
const CONTRACT_ADDRESS = "0x7CcEbAd7E8d23A58310Daf7e8C0aEa190C0942c3";
const ABI = [
  "function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external payable",
  "event BatchExecuted(address indexed executor, uint256 totalValue, uint256 transferCount)"
];

function App() {
  const [account, setAccount] = useState(null);
  const [rule, setRule] = useState("");
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        addLog(`Wallet connected: ${address}`);
      } catch (err) {
        addLog(`Error connecting wallet: ${err.message}`);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const demoMode = () => {
    const demoAddress = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setAccount(demoAddress);
    addLog(`Demo Wallet connected: ${demoAddress}`);
  };

  const executeRule = async () => {
    if (!rule) return;
    setIsProcessing(true);
    setAiResult(null);
    addLog(`Evaluating condition: "${rule}"`);

    try {
      // Call AI Engine Backend
      const res = await fetch('http://localhost:3001/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule })
      });

      const data = await res.json();
      setAiResult(data);
      addLog(`AI Decision: ${data.action} (Confidence: ${(data.confidence_score * 100).toFixed(0)}%)`);
      addLog(`Reasoning: ${data.reasoning}`);

      if (data.action === "EXECUTE") {
        await executeBlockchainTransaction();
      }

    } catch (error) {
      addLog(`Execution Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeBlockchainTransaction = async () => {
    if (!account || account.startsWith("0x") && account.length !== 42) {
      addLog("Cannot execute: No real wallet connected (Demo Mode active).");
      return;
    }

    addLog("Preparing Monad Testnet parallel transaction...");
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      // We are sending 0.001 MON split across 3 random addresses to demonstrate batching
      const amountPerRecipient = parseEther("0.00033");
      const totalAmount = parseEther("0.001");
      const recipients = [
        "0x1111111254fb6c44bac0bed2854e76f90643097d", // Example safe addresses
        "0x2222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333"
      ];
      const amounts = [amountPerRecipient, amountPerRecipient, amountPerRecipient];

      addLog("Please sign the transaction in MetaMask...");

      const tx = await contract.batchTransfer(recipients, amounts, { value: totalAmount });
      addLog(`Transaction broadcasted! Hash: ${tx.hash}`);

      const receipt = await tx.wait();
      addLog(`Success! Parallel batch confirmed in block ${receipt.blockNumber}.`);

      // Add Monadscan link to logs
      setLogs(prev => [...prev, `[LINK] https://testnet.monadscan.com/tx/${tx.hash}`]);

    } catch (err) {
      console.error(err);
      addLog(`Transaction Failed: ${err.message || "User rejected signature"}`);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>AGEE</h1>
        <p>Anti-Gravity Execution Engine</p>
      </header>

      {!account ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <button className="connect-btn" onClick={connectWallet}>
            <Wallet size={20} />
            Connect Wallet to Monad
          </button>

          <button
            className="connect-btn"
            onClick={demoMode}
            style={{ background: 'transparent', border: '1px solid var(--monad-purple)', color: 'var(--text-main)', boxShadow: 'none' }}
          >
            <Wallet size={20} />
            Continue in Demo Mode (No Wallet Needed)
          </button>
        </div>
      ) : (
        <div className="glass-panel input-panel">
          <div className="input-group">
            <label htmlFor="ruleInput">Define Execution Rule</label>
            <input
              id="ruleInput"
              className="rule-input"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              placeholder="e.g. Execute if target milestone is reached..."
              disabled={isProcessing}
            />
            <button
              className={`action-btn ${isProcessing ? 'glow-active' : ''}`}
              onClick={executeRule}
              disabled={isProcessing || !rule}
            >
              {isProcessing ? 'Evaluating with AI engine...' : 'Deploy Autonomous Observer'}
            </button>
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="glass-panel status-board">
          <div className="status-header">
            <h3><Activity size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '8px' }} />Execution Dashboard</h3>
            {aiResult && (
              <span className={`status-badge ${aiResult.action === 'EXECUTE' ? 'badge-execute' : 'badge-wait'}`}>
                {aiResult.action === 'EXECUTE' ? <Zap size={14} /> : <Pause size={14} />} {aiResult.action}
              </span>
            )}
          </div>

          <div className="log-terminal">
            {logs.map((log, i) => {
              if (log.startsWith("[LINK] ")) {
                const url = log.replace("[LINK] ", "");
                return (
                  <div key={i} className="log-entry" style={{ animationDelay: `${i * 0.05}s` }}>
                    🔗 <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#836ef9', textDecoration: 'underline' }}>View transaction on Monadscan</a>
                  </div>
                );
              }
              return <div key={i} className="log-entry" style={{ animationDelay: `${i * 0.05}s` }}>{log}</div>;
            })}
            {isProcessing && <div className="blink">_</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
