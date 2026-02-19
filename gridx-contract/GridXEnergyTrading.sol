// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GridXEnergyTrading
 * @dev Decentralized energy trading platform with blockchain verification
 * Polygon Mumbai (Testnet)
 */

contract GridXEnergyTrading {
    
    struct EnergyTrade {
        address seller;
        address buyer;
        uint256 energyKwh;
        uint256 pricePerKwh;
        uint256 timestamp;
        bool settled;
    }

    mapping(bytes32 => EnergyTrade) public trades;
    mapping(address => uint256) public tradeCounts;
    mapping(address => uint256) public totalEnergyTraded;
    mapping(address => uint256) public totalRevenue;

    bytes32[] public tradeIds;
    
    uint256 public totalTradesLogged;
    uint256 public totalEnergyMW; // in kW
    uint256 public totalCarbonSavedKg;
    
    address public owner;
    bool public paused;

    event TradeLogged(
        bytes32 indexed tradeId,
        address indexed seller,
        address indexed buyer,
        uint256 energyKwh,
        uint256 pricePerKwh,
        uint256 timestamp,
        uint256 carbonSavedKg
    );

    event TradeCancelled(bytes32 indexed tradeId);
    event TradeSettled(bytes32 indexed tradeId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        paused = false;
        totalTradesLogged = 0;
        totalEnergyMW = 0;
        totalCarbonSavedKg = 0;
    }

    /**
     * @dev Log an energy trade on the blockchain
     * @param _seller Address of energy seller (solar producer)
     * @param _buyer Address of energy buyer (consumer)
     * @param _energyKwh Amount of energy in kWh (multiply by 100)
     * @param _pricePerKwh Price per kWh in wei (multiply by 1000000)
     * @return tradeId The unique ID of the logged trade
     */
    function logEnergyTrade(
        address _seller,
        address _buyer,
        uint256 _energyKwh,
        uint256 _pricePerKwh
    ) public whenNotPaused returns (bytes32) {
        require(_seller != address(0), "Invalid seller address");
        require(_buyer != address(0), "Invalid buyer address");
        require(_seller != _buyer, "Seller and buyer cannot be same");
        require(_energyKwh > 0, "Energy amount must be greater than zero");
        require(_pricePerKwh > 0, "Price must be greater than zero");

        bytes32 tradeId = keccak256(
            abi.encodePacked(_seller, _buyer, _energyKwh, block.timestamp)
        );

        // Ensure trade doesn't already exist
        require(trades[tradeId].timestamp == 0, "Trade already exists");

        uint256 carbonSavedKg = (_energyKwh * 8) / 10; // 0.8 kg CO2 per kWh

        trades[tradeId] = EnergyTrade({
            seller: _seller,
            buyer: _buyer,
            energyKwh: _energyKwh,
            pricePerKwh: _pricePerKwh,
            timestamp: block.timestamp,
            settled: false
        });

        tradeIds.push(tradeId);
        tradeCount[msg.sender]++;
        totalEnergyTraded[_seller] += _energyKwh;
        totalRevenue[_seller] += (_energyKwh * _pricePerKwh) / 1000000;
        
        totalTradesLogged++;
        totalEnergyMW += _energyKwh;
        totalCarbonSavedKg += carbonSavedKg;

        emit TradeLogged(
            tradeId,
            _seller,
            _buyer,
            _energyKwh,
            _pricePerKwh,
            block.timestamp,
            carbonSavedKg
        );

        return tradeId;
    }

    /**
     * @dev Get trade details
     */
    function getTrade(bytes32 _tradeId)
        public
        view
        returns (
            address seller,
            address buyer,
            uint256 energyKwh,
            uint256 pricePerKwh,
            uint256 timestamp,
            bool settled
        )
    {
        EnergyTrade memory trade = trades[_tradeId];
        return (
            trade.seller,
            trade.buyer,
            trade.energyKwh,
            trade.pricePerKwh,
            trade.timestamp,
            trade.settled
        );
    }

    /**
     * @dev Get all trade IDs (pagination recommended for large sets)
     */
    function getAllTradeIds() public view returns (bytes32[] memory) {
        return tradeIds;
    }

    /**
     * @dev Get trade count for address
     */
    function getTradeCount(address _address) public view returns (uint256) {
        return tradeCount[_address];
    }

    /**
     * @dev Get total energy traded by seller
     */
    function getTotalEnergyTraded(address _seller)
        public
        view
        returns (uint256)
    {
        return totalEnergyTraded[_seller];
    }

    /**
     * @dev Get total revenue for seller
     */
    function getTotalRevenue(address _seller) public view returns (uint256) {
        return totalRevenue[_seller];
    }

    /**
     * @dev Settle a trade
     */
    function settleTrade(bytes32 _tradeId) public {
        EnergyTrade storage trade = trades[_tradeId];
        require(trade.timestamp != 0, "Trade does not exist");
        require(!trade.settled, "Trade already settled");
        require(
            msg.sender == trade.seller || msg.sender == trade.buyer || msg.sender == owner,
            "Not authorized"
        );

        trade.settled = true;
        emit TradeSettled(_tradeId);
    }

    /**
     * @dev Cancel a trade (only seller or owner)
     */
    function cancelTrade(bytes32 _tradeId) public {
        EnergyTrade storage trade = trades[_tradeId];
        require(trade.timestamp != 0, "Trade does not exist");
        require(!trade.settled, "Cannot cancel settled trade");
        require(
            msg.sender == trade.seller || msg.sender == owner,
            "Not authorized"
        );

        // Remove from tracking
        totalEnergyMW -= trade.energyKwh;
        totalCarbonSavedKg -= (trade.energyKwh * 8) / 10;

        delete trades[_tradeId];
        emit TradeCancelled(_tradeId);
    }

    /**
     * @dev Emergency pause function
     */
    function pause() public onlyOwner {
        paused = true;
    }

    /**
     * @dev Resume after pause
     */
    function unpause() public onlyOwner {
        paused = false;
    }

    /**
     * @dev Get contract statistics
     */
    function getNetworkStats()
        public
        view
        returns (
            uint256 trades,
            uint256 energyKw,
            uint256 carbonKg
        )
    {
        return (totalTradesLogged, totalEnergyMW, totalCarbonSavedKg);
    }
}
