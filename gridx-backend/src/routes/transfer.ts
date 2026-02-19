import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const router = Router();

// Minimal ABI for the transfer functions we added
const ABI = [
  'function transferEnergyFrom(address seller,address buyer,uint256 energyKwh,uint256 pricePerKwh) external returns (bytes32)',
  'function transferEnergyUnits(address to,uint256 energyKwh,uint256 pricePerKwh) external returns (bytes32)',
  'function creditEnergy(address to,uint256 energyKwh) external'
];

// POST /api/energy-transfer/transfer
// Body: { seller, buyer, energyKwh, pricePerKwh }
router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const { seller, buyer, energyKwh, pricePerKwh } = req.body;
    if (!seller || !buyer || !energyKwh || !pricePerKwh) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      return res.status(500).json({ error: 'Blockchain config missing on server' });
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl as string);
    const wallet = new ethers.Wallet(privateKey as string, provider);
    const contract = new ethers.Contract(contractAddress as string, ABI, wallet);

    // Call owner-relayed transfer
    const tx = await contract.transferEnergyFrom(seller, buyer, energyKwh, pricePerKwh);
    const receipt = await tx.wait();

    res.json({ txHash: receipt.transactionHash, blockNumber: receipt.blockNumber });
  } catch (err: any) {
    console.error('transfer route error:', err?.message || err);
    res.status(500).json({ error: 'Transfer failed', details: err?.message || err });
  }
});

export default router;
