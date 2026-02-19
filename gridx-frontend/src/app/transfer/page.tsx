"use client";
import React, { useState } from 'react';
import { connectWallet, transferEnergyUnits } from '../../lib/blockchain';

export default function TransferPage() {
  const [to, setTo] = useState('');
  const [energy, setEnergy] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');
  const [account, setAccount] = useState<string | null>(null);

  async function handleConnect() {
    try {
      const acc = await connectWallet();
      setAccount(acc as string);
      setStatus('Wallet connected: ' + acc);
    } catch (err) {
      setStatus('Wallet connection failed');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('Sending transaction...');
    try {
      const txHash = await transferEnergyUnits(to, Number(energy), Number(price));
      setStatus('Transaction sent: ' + txHash);
    } catch (err: any) {
      setStatus('Transfer failed: ' + (err?.message || err));
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Transfer Energy Units</h1>
      <div className="mb-4">
        <button onClick={handleConnect} className="btn">{account ? 'Connected' : 'Connect Wallet'}</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block">Recipient address</label>
          <input value={to} onChange={e => setTo(e.target.value)} className="input" placeholder="0x..." />
        </div>
        <div>
          <label className="block">Energy (kWh)</label>
          <input value={energy} onChange={e => setEnergy(e.target.value)} className="input" placeholder="e.g. 2.50" />
        </div>
        <div>
          <label className="block">Price per kWh (e.g. 5.20)</label>
          <input value={price} onChange={e => setPrice(e.target.value)} className="input" placeholder="e.g. 5.20" />
        </div>
        <div>
          <button type="submit" className="btn-primary">Transfer on-chain</button>
        </div>
      </form>
      <div className="mt-4">Status: {status}</div>
    </div>
  );
}
