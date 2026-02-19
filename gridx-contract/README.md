# GridX Smart Contract

## Overview
This Solidity smart contract powers the GridX decentralized energy trading platform on Polygon Mumbai testnet.

## Features
- Log energy trades immutably on blockchain
- Track seller reputation and trading volume
- Calculate and record carbon savings
- Emergency pause mechanism
- Trade settlement mechanism

## Deployment

### Prerequisites
- Hardhat or Truffle
- MetaMask with Mumbai testnet configured
- Mumbai testnet MATIC tokens from faucet

### Local Deployment
```bash
cd gridx-contract
npm install truffle @truffle/hdwallet-provider
npx truffle compile
npx truffle migrate --network mumbai
```

### Using Hardhat
```bash
npm install --save-dev hardhat @nomiclabs/hardhat-waffle ethereum-waffle chai @ethersproject/providers ethers
npx hardhat compile
npx hardhat run scripts/deploy.js --network mumbai
```

## Contract Functions

### logEnergyTrade
```solidity
function logEnergyTrade(
    address _seller,
    address _buyer,
    uint256 _energyKwh,
    uint256 _pricePerKwh
) public returns (bytes32)
```
Logs an energy trade and returns transaction hash.

### getTrade
```solidity
function getTrade(bytes32 _tradeId) public view returns (...)
```
Retrieves trade details.

### getNetworkStats
```solidity
function getNetworkStats() public view returns (uint256, uint256, uint256)
```
Returns total trades, energy, and carbon saved.

## Network Details
- **Network**: Polygon Mumbai (Testnet)
- **Chain ID**: 80001
- **RPC URL**: https://rpc-mumbai.maticvigil.com
- **Block Explorer**: https://mumbai.polygonscan.com

## Testing
```bash
npx truffle test
npx hardhat test
```
