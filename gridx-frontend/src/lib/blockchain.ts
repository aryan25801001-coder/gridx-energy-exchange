import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const POLYGON_RPC = process.env.NEXT_PUBLIC_POLYGON_RPC_URL;

const CONTRACT_ABI = [
  {
    inputs: [
      { name: '_seller', type: 'address' },
      { name: '_buyer', type: 'address' },
      { name: '_energyKwh', type: 'uint256' },
      { name: '_pricePerKwh', type: 'uint256' },
    ],
    name: 'logEnergyTrade',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_energyKwh', type: 'uint256' },
      { name: '_pricePerKwh', type: 'uint256' }
    ],
    name: 'transferEnergyUnits',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_seller', type: 'address' },
      { name: '_buyer', type: 'address' },
      { name: '_energyKwh', type: 'uint256' },
      { name: '_pricePerKwh', type: 'uint256' }
    ],
    name: 'transferEnergyFrom',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_tradeId', type: 'bytes32' }],
    name: 'getTrade',
    outputs: [
      { name: 'seller', type: 'address' },
      { name: 'buyer', type: 'address' },
      { name: 'energyKwh', type: 'uint256' },
      { name: 'pricePerKwh', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export async function connectWallet() {
  if (typeof window === 'undefined') return null;
  
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}

export async function logEnergyTrade(
  seller: string,
  buyer: string,
  energyKwh: number,
  pricePerKwh: number
): Promise<string> {
  if (typeof window === 'undefined') throw new Error('Client-side only');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS!,
    CONTRACT_ABI,
    signer
  );

  try {
    const tx = await contract.logEnergyTrade(
      seller,
      buyer,
      ethers.parseUnits(energyKwh.toString(), 2),
      ethers.parseUnits(pricePerKwh.toString(), 6)
    );
    
    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

export async function transferEnergyUnits(
  to: string,
  energyKwh: number,
  pricePerKwh: number
): Promise<string> {
  if (typeof window === 'undefined') throw new Error('Client-side only');
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS!, CONTRACT_ABI, signer);

  try {
    const tx = await contract.transferEnergyUnits(
      to,
      ethers.parseUnits(energyKwh.toString(), 2),
      ethers.parseUnits(pricePerKwh.toString(), 6)
    );
    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch (error) {
    console.error('transferEnergyUnits failed:', error);
    throw error;
  }
}

// Optional: call backend owner-relayed transfer (requires server env PRIVATE_KEY)
export async function relayTransfer(seller: string, buyer: string, energyKwh: number, pricePerKwh: number) {
  const res = await fetch('/api/energy-transfer/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seller, buyer, energyKwh, pricePerKwh })
  });

  if (!res.ok) throw new Error('Relay transfer failed');
  return res.json();
}

export async function getProvider() {
  return new ethers.JsonRpcProvider(POLYGON_RPC);
}

export async function getTxStatus(txHash: string) {
  const provider = await getProvider();
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    return receipt ? 'confirmed' : 'pending';
  } catch {
    return 'failed';
  }
}
