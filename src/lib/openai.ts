export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ETHERSCAN_API_KEY = 'AIFJVZRQCH6PZ7N4JFZAZAJIMYXBIMIG9I';
const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/api';
const ETHERDROPS_API_KEY = 'e97dde02-5bd3-11f0-86ea-5e5669180f33';
const ETHERDROPS_BASE_URL = 'https://api.etherdrops.app';

// Dual-mode assistant: OpenAI for general questions, Etherscan for live data
async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch('https://jovfnzyjtvixniwxeygp.supabase.co/functions/v1/chat-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdmZuenlqdHZpeG5pd3hleWdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5Njc4NjYsImV4cCI6MjA2NzU0Mzg2Nn0.5wSPFVHnCdJRs2vvOaA2phCGQHL0fOt5882ulhUz2Is`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error calling OpenAI assistant:', error);
    throw error;
  }
}

// Fallback to simulated responses
function fallbackToSimulatedResponse(userMessage: string): string {
  const userMessageLower = userMessage.toLowerCase();
  
  if (userMessageLower.includes('wallet') || userMessageLower.includes('address')) {
    return web3Responses.wallet;
  } else if (userMessageLower.includes('web3')) {
    return web3Responses.web3;
  } else if (userMessageLower.includes('submit') || userMessageLower.includes('gas') || userMessageLower.includes('confirm')) {
    return web3Responses.blockchain;
  }
  
  return web3Responses.default;
}

// Simulated AI responses for Web3 topics (fallback)
const web3Responses: Record<string, string> = {
  "wallet": "A wallet address is a public address on the Ethereum blockchain. You can explore it using blockchain explorers to see: transaction history, token balances, NFT holdings, smart contract interactions, and total value. However, you cannot see the private key or personal information of the wallet owner.",
  
  "web3": "Web3 refers to the next generation of the internet built on blockchain technology. Key differences from Web2: decentralization (no single controlling entity), user ownership of data and assets, built-in payments via cryptocurrencies, smart contracts for automated agreements, and permissionless innovation. Benefits include reduced censorship, better privacy control, and new economic models.",
  
  "blockchain": "🧾 **How to Submit a Transaction to a Blockchain**\n\n✅ **Step-by-Step Process**\n\n**1. Connect to a Wallet**\n• Choose a crypto wallet (e.g., MetaMask, Phantom, Keplr)\n• Make sure it supports the blockchain you're working on (e.g., Ethereum, Solana, Cosmos)\n\n**2. Prepare the Transaction**\n• Define:\n  - Recipient address (where you're sending tokens/data)\n  - Amount of tokens\n  - Optional data (e.g., smart contract call or memo)\n\n**3. Set Gas Fee (for EVM chains)**\n• Choose between:\n  - Low (cheaper, slower confirmation)\n  - Medium (balanced)\n  - High (faster, more expensive)\n• Tools like Etherscan Gas Tracker help decide a fair gas price\n\n**4. Sign the Transaction**\n• Your wallet will prompt you to sign the transaction\n• This uses your private key to authorize it (without revealing the key)\n\n**5. Broadcast the Transaction**\n• Once signed, the transaction is sent to the blockchain node (via RPC)\n• It's now in the mempool (waiting area)\n\n**6. Wait for Confirmation**\n• Miners/validators pick it up, include it in a block, and confirm it\n• You'll receive a transaction hash you can use to track status",
  
  "default": "Great question about blockchain technology! The blockchain is a distributed ledger that records transactions across multiple computers. Key concepts include decentralization, cryptographic security, consensus mechanisms, and immutability. Each block contains transaction data, timestamp, and a hash of the previous block, creating an unbreakable chain of records."
};

// Helper function to detect transaction hash
function extractTransactionHash(message: string): string | null {
  const hashRegex = /0x[a-fA-F0-9]{64}/;
  const match = message.match(hashRegex);
  return match ? match[0] : null;
}

// Helper function to detect wallet address
function extractWalletAddress(message: string): string | null {
  const addressRegex = /0x[a-fA-F0-9]{40}/;
  const match = message.match(addressRegex);
  return match ? match[0] : null;
}

// Helper function to format Wei to Ether
function weiToEther(wei: string): string {
  const weiNum = BigInt(wei);
  const etherNum = Number(weiNum) / 1e18;
  return etherNum.toFixed(6);
}

// Helper function to format gas price from Wei to Gwei
function weiToGwei(wei: string): string {
  const weiNum = BigInt(wei);
  const gweiNum = Number(weiNum) / 1e9;
  return gweiNum.toFixed(2);
}

// Fetch current gas price from Etherscan
async function fetchCurrentGasPrice(): Promise<string> {
  try {
    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`
    );
    
    if (!response.ok) {
      return 'Unable to fetch current gas price';
    }
    
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      const { SafeGasPrice, ProposeGasPrice, FastGasPrice } = data.result;
      return `**Current Gas Prices:**
• Safe: ${SafeGasPrice} Gwei
• Standard: ${ProposeGasPrice} Gwei  
• Fast: ${FastGasPrice} Gwei`;
    }
    
    return 'Gas price data unavailable';
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return 'Error fetching gas price data';
  }
}

// Fetch current Ethereum price from Etherscan
async function fetchEthereumPrice(): Promise<string> {
  try {
    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=stats&action=ethprice&apikey=${ETHERSCAN_API_KEY}`
    );
    
    if (!response.ok) {
      return 'Unable to fetch ETH price';
    }
    
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      const { ethusd, ethbtc } = data.result;
      return `**Current Ethereum Price:**
• USD: $${parseFloat(ethusd).toFixed(2)}
• BTC: ₿${parseFloat(ethbtc).toFixed(6)}`;
    }
    
    return 'ETH price data unavailable';
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return 'Error fetching ETH price data';
  }
}

// 🔍 1. Account APIs
// Get normal transactions for an address
async function fetchAccountTransactions(address: string, page: number = 1, offset: number = 10): Promise<string> {
  try {
    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    
    if (!response.ok) return 'Unable to fetch transactions';
    
    const data = await response.json();
    if (data.status === '1' && data.result.length > 0) {
      const txs = data.result.slice(0, 5).map((tx: any) => 
        `• ${tx.hash.substring(0, 10)}... | ${weiToEther(tx.value)} ETH | Block ${parseInt(tx.blockNumber).toLocaleString()}`
      ).join('\n');
      
      return `**Recent Transactions:**\n${txs}`;
    }
    
    return 'No transactions found';
  } catch (error) {
    return 'Error fetching transactions';
  }
}

// Get internal transactions (contract calls)
async function fetchInternalTransactions(address: string): Promise<string> {
  try {
    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    
    if (!response.ok) return '';
    
    const data = await response.json();
    if (data.status === '1' && data.result.length > 0) {
      return `\n**Internal Transactions:** ${data.result.length} contract interactions found`;
    }
    
    return '';
  } catch (error) {
    return '';
  }
}

// Get ERC-20 token transfers
async function fetchTokenTransfers(address: string): Promise<string> {
  try {
    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=account&action=tokentx&address=${address}&page=1&offset=20&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    
    if (!response.ok) return '';
    
    const data = await response.json();
    if (data.status === '1' && data.result.length > 0) {
      const uniqueTokens = new Map();
      data.result.forEach((tx: any) => {
        if (!uniqueTokens.has(tx.contractAddress)) {
          uniqueTokens.set(tx.contractAddress, tx.tokenSymbol);
        }
      });
      
      const tokens = Array.from(uniqueTokens.values()).slice(0, 8).join(', ');
      return `\n**Token Activity:** Interacted with ${tokens}${uniqueTokens.size > 8 ? ` and ${uniqueTokens.size - 8} more tokens` : ''}`;
    }
    
    return '';
  } catch (error) {
    return '';
  }
}

// Get ERC-721 (NFT) transfers
async function fetchNFTTransfers(address: string): Promise<string> {
  try {
    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=account&action=tokennfttx&address=${address}&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`
    );
    
    if (!response.ok) return '';
    
    const data = await response.json();
    if (data.status === '1' && data.result.length > 0) {
      return `\n**NFT Activity:** ${data.result.length} NFT transfers found`;
    }
    
    return '';
  } catch (error) {
    return '';
  }
}

// 📦 3. Enhanced Transaction APIs
async function fetchTransactionStatus(txHash: string): Promise<string> {
  try {
    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${ETHERSCAN_API_KEY}`
    );
    
    if (!response.ok) return '';
    
    const data = await response.json();
    if (data.status === '1') {
      return data.result.status === '1' ? 'Successful' : 'Failed';
    }
    
    return 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}

// 📜 4. Contract APIs
async function fetchContractInfo(address: string): Promise<string> {
  try {
    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_API_KEY}`
    );
    
    if (!response.ok) return '';
    
    const data = await response.json();
    if (data.status === '1' && data.result[0]) {
      const contract = data.result[0];
      if (contract.SourceCode && contract.SourceCode !== '') {
        return `\n**Contract Info:**\n• Name: ${contract.ContractName || 'Unknown'}\n• Compiler: ${contract.CompilerVersion || 'Unknown'}\n• Verified: Yes\n• Optimization: ${contract.OptimizationUsed === '1' ? 'Enabled' : 'Disabled'}`;
      }
    }
    
    return '';
  } catch (error) {
    return '';
  }
}

// 💱 6. Token APIs
async function fetchTokenInfo(contractAddress: string): Promise<string> {
  try {
    const [nameRes, symbolRes, decimalsRes, supplyRes] = await Promise.all([
      fetch(`${ETHERSCAN_BASE_URL}?module=proxy&action=eth_call&to=${contractAddress}&data=0x06fdde03&tag=latest&apikey=${ETHERSCAN_API_KEY}`),
      fetch(`${ETHERSCAN_BASE_URL}?module=proxy&action=eth_call&to=${contractAddress}&data=0x95d89b41&tag=latest&apikey=${ETHERSCAN_API_KEY}`),
      fetch(`${ETHERSCAN_BASE_URL}?module=proxy&action=eth_call&to=${contractAddress}&data=0x313ce567&tag=latest&apikey=${ETHERSCAN_API_KEY}`),
      fetch(`${ETHERSCAN_BASE_URL}?module=stats&action=tokensupply&contractaddress=${contractAddress}&apikey=${ETHERSCAN_API_KEY}`)
    ]);
    
    if (supplyRes.ok) {
      const supplyData = await supplyRes.json();
      if (supplyData.status === '1') {
        return `\n**Token Supply:** ${parseInt(supplyData.result).toLocaleString()} tokens`;
      }
    }
    
    return '';
  } catch (error) {
    return '';
  }
}

// 📊 7. Network Stats APIs
async function fetchNetworkStats(): Promise<string> {
  try {
    const [ethSupplyRes, gasOracleRes] = await Promise.all([
      fetch(`${ETHERSCAN_BASE_URL}?module=stats&action=ethsupply&apikey=${ETHERSCAN_API_KEY}`),
      fetch(`${ETHERSCAN_BASE_URL}?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`)
    ]);
    
    let statsInfo = '\n**Network Statistics:**';
    
    if (ethSupplyRes.ok) {
      const ethSupplyData = await ethSupplyRes.json();
      if (ethSupplyData.status === '1') {
        const supply = weiToEther(ethSupplyData.result);
        statsInfo += `\n• Total ETH Supply: ${parseFloat(supply).toLocaleString()} ETH`;
      }
    }
    
    if (gasOracleRes.ok) {
      const gasData = await gasOracleRes.json();
      if (gasData.status === '1') {
        statsInfo += `\n• Current Gas: ${gasData.result.SafeGasPrice} Gwei (Safe)`;
      }
    }
    
    return statsInfo;
  } catch (error) {
    return '';
  }
}

// 🔐 8. Proxy APIs
async function fetchBlockByNumber(blockNumber: string): Promise<string> {
  try {
    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=proxy&action=eth_getBlockByNumber&tag=${blockNumber}&boolean=true&apikey=${ETHERSCAN_API_KEY}`
    );
    
    if (!response.ok) return '';
    
    const data = await response.json();
    if (data.result) {
      const block = data.result;
      return `\n**Block Info:**\n• Number: ${parseInt(block.number, 16).toLocaleString()}\n• Transactions: ${block.transactions.length}\n• Gas Used: ${parseInt(block.gasUsed, 16).toLocaleString()}`;
    }
    
    return '';
  } catch (error) {
    return '';
  }
}

// Live block height fetching for all networks
async function fetchCurrentBlockHeight(network: any): Promise<{ name: string, blockHeight: number, error?: string }> {
  try {
    const response = await fetch(
      `${network.apiUrl}?module=proxy&action=eth_blockNumber&apikey=${network.apiKey}`
    );
    
    if (!response.ok) {
      return { name: network.name, blockHeight: 0, error: 'Network unavailable' };
    }
    
    const data = await response.json();
    
    if (data.result) {
      const blockHeight = parseInt(data.result, 16);
      return { name: network.name, blockHeight };
    }
    
    return { name: network.name, blockHeight: 0, error: 'Invalid response' };
  } catch (error) {
    return { name: network.name, blockHeight: 0, error: 'Fetch error' };
  }
}

// Fetch block heights for all networks
async function fetchAllBlockHeights(): Promise<string> {
  try {
    const networkPromises = Object.values(NETWORKS).map(network => 
      fetchCurrentBlockHeight(network)
    );
    
    const results = await Promise.all(networkPromises);
    
    const blockInfo = results.map(result => {
      if (result.error) {
        return `**${result.name}:** Error - ${result.error}`;
      }
      return `**${result.name}:** Block ${result.blockHeight.toLocaleString()}`;
    }).join('\n');
    
    return `**Live Block Heights:**\n${blockInfo}\n\n*Block heights update every ~12 seconds*`;
  } catch (error) {
    return 'Error fetching block heights';
  }
}

// Network status API (missing from current implementation)
async function fetchNetworkStatus(): Promise<string> {
  try {
    const response = await fetch(
      `${ETHERSCAN_BASE_URL}?module=stats&action=chainsize&apikey=${ETHERSCAN_API_KEY}`
    );
    
    if (!response.ok) return 'Network status unavailable';
    
    const data = await response.json();
    if (data.status === '1') {
      return `**Network Status:**\n• Chain Size: ${parseInt(data.result).toLocaleString()} bytes`;
    }
    
    return 'Network status data unavailable';
  } catch (error) {
    return 'Error fetching network status';
  }
}

// Enhanced question pattern detection
function detectQuestionType(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // 1. Gas fee questions
  if ((lowerMessage.includes('gas') || lowerMessage.includes('fee')) && 
      (lowerMessage.includes('current') || lowerMessage.includes('price') || lowerMessage.includes('cost'))) {
    return 'gas_fee';
  }
  
  // 2. ETH price questions
  if ((lowerMessage.includes('eth') || lowerMessage.includes('ethereum')) && 
      (lowerMessage.includes('price') || lowerMessage.includes('current') || lowerMessage.includes('cost'))) {
    return 'eth_price';
  }
  
  // 3. Wallet balance questions
  if ((lowerMessage.includes('balance') || lowerMessage.includes('how much')) && 
      (lowerMessage.includes('wallet') || lowerMessage.includes('address') || lowerMessage.includes('eth'))) {
    return 'wallet_balance';
  }
  
  // 4. Transaction list questions
  if ((lowerMessage.includes('transaction') || lowerMessage.includes('tx')) && 
      (lowerMessage.includes('latest') || lowerMessage.includes('recent') || lowerMessage.includes('history'))) {
    return 'transaction_list';
  }
  
  // 5. Token interaction questions
  if ((lowerMessage.includes('token') || lowerMessage.includes('erc')) && 
      (lowerMessage.includes('interact') || lowerMessage.includes('transfer') || lowerMessage.includes('activity'))) {
    return 'token_activity';
  }
  
  // 6. Transaction confirmation questions
  if ((lowerMessage.includes('transaction') || lowerMessage.includes('tx')) && 
      (lowerMessage.includes('confirm') || lowerMessage.includes('status') || lowerMessage.includes('success'))) {
    return 'transaction_status';
  }
  
  // 7. Contract verification questions
  if (lowerMessage.includes('contract') && 
      (lowerMessage.includes('verified') || lowerMessage.includes('source') || lowerMessage.includes('code'))) {
    return 'contract_verification';
  }
  
  // 8. Network status questions
  if ((lowerMessage.includes('network') || lowerMessage.includes('ethereum')) && 
      (lowerMessage.includes('status') || lowerMessage.includes('stats') || lowerMessage.includes('performance'))) {
    return 'network_status';
  }
  
  // 9. Block height questions
  if ((lowerMessage.includes('block') || lowerMessage.includes('height')) && 
      (lowerMessage.includes('current') || lowerMessage.includes('latest') || lowerMessage.includes('number'))) {
    return 'block_height';
  }
  
  // Transaction hash detection
  if (extractTransactionHash(message)) {
    return 'transaction_details';
  }
  
  // Wallet address detection
  if (extractWalletAddress(message)) {
    return 'wallet_analysis';
  }
  
  return 'general_web3';
}

// Targeted response handler for each question type
async function handleSpecificQuestion(questionType: string, message: string, address?: string, txHash?: string): Promise<string> {
  switch (questionType) {
    case 'gas_fee':
      return await fetchCurrentGasPrice();
      
    case 'eth_price':
      return await fetchEthereumPrice();
      
    case 'wallet_balance':
      if (address) {
        const balance = await fetchNetworkBalance(address, NETWORKS.ethereum);
        return `**ETH Balance for ${address}:**\n• ${balance.balance} ${balance.currency}`;
      }
      return 'Please provide a wallet address to check balance.';
      
    case 'transaction_list':
      if (address) {
        return await fetchAccountTransactions(address, 1, 10);
      }
      return 'Please provide a wallet address to view transactions.';
      
    case 'token_activity':
      if (address) {
        return await fetchTokenTransfers(address);
      }
      return 'Please provide a wallet address to view token activity.';
      
    case 'transaction_status':
      if (txHash) {
        const status = await fetchTransactionStatus(txHash);
        return `**Transaction Status for ${txHash}:**\n• Status: ${status}`;
      }
      return 'Please provide a transaction hash to check status.';
      
    case 'transaction_details':
      if (txHash) {
        return await fetchTransactionDetails(txHash);
      }
      return 'Please provide a valid transaction hash.';
      
    case 'contract_verification':
      if (address) {
        return await fetchContractInfo(address);
      }
      return 'Please provide a contract address to check verification status.';
      
    case 'network_status':
      const [networkStats, gasPrice] = await Promise.all([
        fetchNetworkStats(),
        fetchCurrentGasPrice()
      ]);
      return `${networkStats}\n\n${gasPrice}`;
      
    case 'block_height':
      return await fetchAllBlockHeights();
      
    case 'wallet_analysis':
      if (address) {
        return await fetchWalletBalance(address);
      }
      return 'Please provide a wallet address for comprehensive analysis.';
      
    default:
      return '';
  }
}

// Fetch transaction details from multiple networks
async function fetchTransactionDetails(txHash: string): Promise<string> {
  // Try each network until we find the transaction
  for (const [networkKey, network] of Object.entries(NETWORKS)) {
    try {
      const response = await fetch(
        `${network.apiUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${network.apiKey}`
      );
      
      if (!response.ok) {
        continue; // Try next network
      }
      
      const data = await response.json();
      
      if (!data.result) {
        continue; // Try next network
      }
      
      const tx = data.result;
      
      // Get transaction receipt for additional details
      const receiptResponse = await fetch(
        `${network.apiUrl}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${network.apiKey}`
      );
      
      const receiptData = await receiptResponse.json();
      const receipt = receiptData.result;
      
      // Format the detailed response
      const blockNumber = parseInt(tx.blockNumber, 16);
      const gasLimit = parseInt(tx.gas, 16).toLocaleString();
      const gasUsed = receipt ? parseInt(receipt.gasUsed, 16).toLocaleString() : 'N/A';
      const gasPrice = weiToGwei(parseInt(tx.gasPrice, 16).toString());
      const value = weiToEther(parseInt(tx.value, 16).toString());
      const nonce = parseInt(tx.nonce, 16).toLocaleString();
      const status = receipt && receipt.status === '0x1' ? 'Successful' : 'Failed';
      
      return `**Transaction Details for ${txHash}**

**Network:** ${network.name}

**Block Information:**
• Block Number: ${blockNumber.toLocaleString()}
• Block Hash: ${tx.blockHash}

**Transaction Details:**
• From: ${tx.from}
• To: ${tx.to}
• Value: ${value} ${network.currency}
• Gas Limit: ${gasLimit}
• Gas Used: ${gasUsed}
• Gas Price: ${gasPrice} Gwei
• Nonce: ${nonce}
• Status: ${status}

**Analysis:**
This transaction occurred on ${network.name} at block ${blockNumber.toLocaleString()}. ${value === '0.000000' ? 'This appears to be a contract interaction or token transfer with no native currency value.' : `${value} ${network.currency} was transferred.`} The transaction ${status.toLowerCase() === 'successful' ? 'completed successfully' : 'failed'} and used ${gasUsed} gas out of the ${gasLimit} gas limit.

You can view more details including token transfers and logs on the respective explorer.`;
      
    } catch (error) {
      console.error(`Error fetching transaction from ${network.name}:`, error);
      continue; // Try next network
    }
  }
  
  // If not found on any network
  return `Transaction hash ${txHash} not found on any supported Ethereum networks (Mainnet, Sepolia, Holesky). Please verify the hash is correct or the transaction might be on a different network.`;
}

// Network configurations
const NETWORKS = {
  ethereum: {
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: ETHERSCAN_API_KEY
  },
  sepolia: {
    name: 'Sepolia Testnet',
    currency: 'ETH',
    apiUrl: 'https://api-sepolia.etherscan.io/api',
    apiKey: ETHERSCAN_API_KEY
  },
  holesky: {
    name: 'Holesky Testnet',
    currency: 'ETH',
    apiUrl: 'https://api-holesky.etherscan.io/api',
    apiKey: ETHERSCAN_API_KEY
  }
};

// Fetch balance for a specific network
async function fetchNetworkBalance(address: string, network: any): Promise<{ name: string, balance: string, currency: string }> {
  try {
    const response = await fetch(
      `${network.apiUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${network.apiKey}`
    );
    
    if (!response.ok) {
      return { name: network.name, balance: '0.000000', currency: network.currency };
    }
    
    const data = await response.json();
    
    if (data.status !== '1') {
      return { name: network.name, balance: '0.000000', currency: network.currency };
    }
    
    const balance = weiToEther(data.result);
    return { name: network.name, balance, currency: network.currency };
  } catch (error) {
    return { name: network.name, balance: '0.000000', currency: network.currency };
  }
}

// Fetch enhanced wallet information from Etherdrops API
async function fetchEtherdropsWalletInfo(address: string): Promise<string> {
  try {
    const response = await fetch(`${ETHERDROPS_BASE_URL}/wallets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ETHERDROPS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    
    // Filter for the specific wallet address if data contains multiple wallets
    const walletData = Array.isArray(data) ? data.find((wallet: any) => 
      wallet.address && wallet.address.toLowerCase() === address.toLowerCase()
    ) : data;

    if (walletData) {
      return `\n\n**Enhanced Wallet Insights (via Etherdrops):**\n• ${walletData.description || 'Additional wallet analysis available'}\n• Status: ${walletData.status || 'Active'}\n• Risk Level: ${walletData.risk_level || 'Standard'}`;
    }

    return '';
  } catch (error) {
    console.error('Error fetching Etherdrops wallet info:', error);
    return '';
  }
}

// Enhanced wallet analysis with comprehensive Etherscan APIs
async function fetchWalletBalance(address: string): Promise<string> {
  try {
    // Fetch all data simultaneously for better performance
    const [
      networkBalances,
      transactions,
      internalTxs,
      tokenTransfers,
      nftTransfers,
      contractInfo,
      etherdropsInfo
    ] = await Promise.all([
      Promise.all(Object.values(NETWORKS).map(network => fetchNetworkBalance(address, network))),
      fetchAccountTransactions(address),
      fetchInternalTransactions(address),
      fetchTokenTransfers(address),
      fetchNFTTransfers(address),
      fetchContractInfo(address),
      fetchEtherdropsWalletInfo(address)
    ]);

    // Get transaction count
    const txCountResponse = await fetch(
      `${ETHERSCAN_BASE_URL}?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    );
    
    let txCount = 'Unknown';
    if (txCountResponse.ok) {
      const txCountData = await txCountResponse.json();
      if (txCountData.result) {
        txCount = parseInt(txCountData.result, 16).toLocaleString();
      }
    }
    
    // Format the multi-network response
    const balanceLines = networkBalances.map(network => 
      `**${network.name}:** ${network.balance} ${network.currency}`
    ).join('\n');
    
    // Get Ethereum mainnet balance for additional info
    const ethBalance = networkBalances.find(n => n.name === 'Ethereum Mainnet')?.balance || '0.000000';
    
    return `**Comprehensive Wallet Analysis for ${address}**

**Network Balances:**
${balanceLines}

${transactions}${internalTxs}${tokenTransfers}${nftTransfers}${contractInfo}

**Transaction Summary:**
• Total Transactions: ${txCount} (Ethereum Mainnet)

**Wallet Overview:**
This wallet address has balances across multiple Ethereum-related networks. ${parseFloat(ethBalance) > 0 ? `The wallet has ${ethBalance} ETH on Ethereum Mainnet.` : 'The wallet appears to have minimal activity on Ethereum Mainnet.'} You can explore detailed transaction history and token holdings on each network's respective explorer.${etherdropsInfo}

You can explore this wallet further on [Etherscan](https://etherscan.io/address/${address}).`;
     
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return `Sorry, I couldn't fetch balance information for wallet ${address}. This might be due to network issues or an invalid wallet address. Please verify the address and try again.`;
  }
}

export class OpenAIService {
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    // Store in localStorage for persistence
    localStorage.setItem('openai_api_key', key);
  }

  getApiKey(): string | null {
    if (this.apiKey) return this.apiKey;
    
    // Try to get from localStorage
    const stored = localStorage.getItem('openai_api_key');
    if (stored) {
      this.apiKey = stored;
      return stored;
    }
    
    return null;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('openai_api_key');
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      // Safety check for empty messages
      if (!messages || messages.length === 0) {
        return fallbackToSimulatedResponse('default');
      }
      
      const lastMessage = messages[messages.length - 1];
      
      // Safety check for message content
      if (!lastMessage || !lastMessage.content) {
        return fallbackToSimulatedResponse('default');
      }
      
      const userMessage = lastMessage.content;
      
      // Enhanced question pattern detection
      const questionType = detectQuestionType(userMessage);
      const txHash = extractTransactionHash(userMessage);
      const walletAddress = extractWalletAddress(userMessage);
      
      // Handle specific question types with targeted responses
      const specificResponse = await handleSpecificQuestion(questionType, userMessage, walletAddress || undefined, txHash || undefined);
      
      if (specificResponse) {
        // Try OpenAI analysis first for enhanced response
        try {
          const aiResponse = await callOpenAI([
            { role: 'user', content: `Analyze this blockchain data and provide insights: ${userMessage}` },
            { role: 'assistant', content: specificResponse }
          ]);
          
          // If OpenAI says to fetch from API, return the Etherscan data
          if (aiResponse.includes('FETCH_FROM_API')) {
            return specificResponse;
          }
          
          // Otherwise return OpenAI's enhanced analysis
          return aiResponse;
        } catch (error) {
          console.error('OpenAI analysis failed, using Etherscan data:', error);
          return specificResponse;
        }
      }
      
      // For general Web3 questions, use OpenAI
      try {
        const aiResponse = await callOpenAI([
          { role: 'user', content: userMessage }
        ]);
        
        // If OpenAI says to fetch from API, try to handle with our existing functions
        if (aiResponse.includes('FETCH_FROM_API')) {
          const fallbackResponse = await handleSpecificQuestion(questionType, userMessage, walletAddress || undefined, txHash || undefined);
          return fallbackResponse || fallbackToSimulatedResponse(userMessage);
        }
        
        return aiResponse;
      } catch (error) {
        console.error('OpenAI failed, using fallback:', error);
      }
      
      // Fallback to simulated responses
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return fallbackToSimulatedResponse(userMessage);
      
    } catch (error) {
      console.error('AI Service Error:', error);
      return "I apologize, but I'm having trouble processing your request right now. Please try asking your blockchain question again.";
    }
  }
}

export const openAIService = new OpenAIService();