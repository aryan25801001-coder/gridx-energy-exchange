// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GridX Energy Trading Contract
 * @dev Decentralized peer-to-peer solar energy trade registry on Polygon Mumbai
 * @author GridX Team — Hackathon 2025
 */
contract GridXEnergy {
    
    // ─────────────────────────────────────────────
    //  STRUCTS
    // ─────────────────────────────────────────────
    struct EnergyTrade {
        bytes32 tradeId;
        address seller;
        address buyer;
        uint256 energyKwh;        // stored as kwh * 100 (2 decimal places)
        uint256 pricePerKwh;      // stored as price * 1_000_000 (6 decimal places, in paise)
        uint256 carbonSaved;      // stored as kg CO2 * 100
        uint256 timestamp;
        bool isConfirmed;
    }

    // ─────────────────────────────────────────────
    //  STATE
    // ─────────────────────────────────────────────
    address public owner;
    uint256 public totalTradesCount;
    uint256 public totalEnergyTraded;   // in kWh * 100
    uint256 public totalCarbonSaved;    // in kg * 100

    mapping(bytes32 => EnergyTrade) public trades;
    mapping(address => uint256) public sellerTrades;
    mapping(address => uint256) public buyerTrades;
    mapping(address => uint256) public carbonCredits;
    // energy balance per address (stored as kWh * 100)
    mapping(address => uint256) public energyBalances;

    bytes32[] public allTradeIds;

    // ─────────────────────────────────────────────
    //  EVENTS
    // ─────────────────────────────────────────────
    event EnergyTradeLogged(
        bytes32 indexed tradeId,
        address indexed seller,
        address indexed buyer,
        uint256 energyKwh,
        uint256 pricePerKwh,
        uint256 carbonSaved,
        uint256 timestamp
    );

    event CarbonCreditsMinted(
        address indexed recipient,
        uint256 amount,
        bytes32 tradeId
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ─────────────────────────────────────────────
    //  MODIFIERS
    // ─────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "GridX: caller is not the owner");
        _;
    }

    modifier validAddresses(address _seller, address _buyer) {
        require(_seller != address(0), "GridX: invalid seller address");
        require(_buyer != address(0), "GridX: invalid buyer address");
        require(_seller != _buyer, "GridX: seller and buyer must differ");
        _;
    }

    // ─────────────────────────────────────────────
    //  CONSTRUCTOR
    // ─────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ─────────────────────────────────────────────
    //  CORE FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @dev Log an energy trade between seller and buyer
     * @param _seller  The solar energy producer's wallet address
     * @param _buyer   The energy consumer's wallet address
     * @param _energyKwh  Energy traded in kWh * 100 (e.g., 250 = 2.50 kWh)
     * @param _pricePerKwh  Price per kWh in paise * 1e6 (e.g., 5200000 = ₹5.20)
     * @return tradeId  The unique identifier for this trade
     */
    function logEnergyTrade(
        address _seller,
        address _buyer,
        uint256 _energyKwh,
        uint256 _pricePerKwh
    )
        external
        validAddresses(_seller, _buyer)
        returns (bytes32 tradeId)
    {
        // validate amounts
        require(_energyKwh > 0, "GridX: energy amount must be positive");
        require(_pricePerKwh > 0, "GridX: price must be positive");

        // delegate to internal recorder
        tradeId = _recordTrade(_seller, _buyer, _energyKwh, _pricePerKwh);
        return tradeId;
    }

    // -------------------------
    // Internal helper to centralize trade recording
    // -------------------------
    function _recordTrade(
        address _seller,
        address _buyer,
        uint256 _energyKwh,
        uint256 _pricePerKwh
    ) internal returns (bytes32 tradeId) {
        tradeId = keccak256(
            abi.encodePacked(
                _seller,
                _buyer,
                _energyKwh,
                _pricePerKwh,
                block.timestamp,
                totalTradesCount
            )
        );

        uint256 carbonSaved = (_energyKwh * 80) / 100;

        trades[tradeId] = EnergyTrade({
            tradeId: tradeId,
            seller: _seller,
            buyer: _buyer,
            energyKwh: _energyKwh,
            pricePerKwh: _pricePerKwh,
            carbonSaved: carbonSaved,
            timestamp: block.timestamp,
            isConfirmed: true
        });

        allTradeIds.push(tradeId);
        totalTradesCount++;
        totalEnergyTraded += _energyKwh;
        totalCarbonSaved += carbonSaved;
        sellerTrades[_seller]++;
        buyerTrades[_buyer]++;

        carbonCredits[_buyer] += carbonSaved;

        emit EnergyTradeLogged(
            tradeId,
            _seller,
            _buyer,
            _energyKwh,
            _pricePerKwh,
            carbonSaved,
            block.timestamp
        );

        emit CarbonCreditsMinted(_buyer, carbonSaved, tradeId);
    }

    // -------------------------
    // Grid balance operations
    // -------------------------
    /**
     * @dev Owner can credit energy units to a grid participant (kWh * 100)
     */
    function creditEnergy(address _to, uint256 _energyKwh) external onlyOwner {
        require(_to != address(0), "GridX: zero address");
        require(_energyKwh > 0, "GridX: amount must be positive");
        energyBalances[_to] += _energyKwh;
    }

    /**
     * @dev Transfer energy units from caller to `_to` (on-chain transfer)
     */
    function transferEnergyUnits(
        address _to,
        uint256 _energyKwh,
        uint256 _pricePerKwh
    ) external validAddresses(msg.sender, _to) returns (bytes32) {
        require(_energyKwh > 0, "GridX: energy amount must be positive");
        require(energyBalances[msg.sender] >= _energyKwh, "GridX: insufficient balance");

        // move balances
        energyBalances[msg.sender] -= _energyKwh;
        energyBalances[_to] += _energyKwh;

        // record trade (seller = msg.sender)
        bytes32 tid = _recordTrade(msg.sender, _to, _energyKwh, _pricePerKwh);
        return tid;
    }

    /**
     * @dev Owner-relayed transfer: owner can move units on behalf of the grid operator
     */
    function transferEnergyFrom(
        address _seller,
        address _buyer,
        uint256 _energyKwh,
        uint256 _pricePerKwh
    ) external onlyOwner validAddresses(_seller, _buyer) returns (bytes32) {
        require(_energyKwh > 0, "GridX: energy amount must be positive");
        require(energyBalances[_seller] >= _energyKwh, "GridX: seller has insufficient balance");

        energyBalances[_seller] -= _energyKwh;
        energyBalances[_buyer] += _energyKwh;

        bytes32 tid = _recordTrade(_seller, _buyer, _energyKwh, _pricePerKwh);
        return tid;
    }

    // ─────────────────────────────────────────────
    //  VIEW FUNCTIONS
    // ─────────────────────────────────────────────

    /**
     * @dev Get details of a specific trade
     */
    function getTrade(bytes32 _tradeId)
        external
        view
        returns (
            address seller,
            address buyer,
            uint256 energyKwh,
            uint256 pricePerKwh,
            uint256 carbonSaved,
            uint256 timestamp,
            bool isConfirmed
        )
    {
        EnergyTrade storage t = trades[_tradeId];
        require(t.timestamp > 0, "GridX: trade not found");
        return (
            t.seller,
            t.buyer,
            t.energyKwh,
            t.pricePerKwh,
            t.carbonSaved,
            t.timestamp,
            t.isConfirmed
        );
    }

    /**
     * @dev Get platform-wide statistics
     */
    function getPlatformStats()
        external
        view
        returns (
            uint256 tradeCount,
            uint256 energyTraded,
            uint256 carbonSavedTotal
        )
    {
        return (totalTradesCount, totalEnergyTraded, totalCarbonSaved);
    }

    /**
     * @dev Get carbon credits for a user
     */
    function getCarbonCredits(address _user) external view returns (uint256) {
        return carbonCredits[_user];
    }

    /**
     * @dev Get all trade IDs (paginated)
     */
    function getTradeIds(uint256 offset, uint256 limit)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 end = offset + limit;
        if (end > allTradeIds.length) end = allTradeIds.length;
        bytes32[] memory result = new bytes32[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = allTradeIds[i];
        }
        return result;
    }

    // ─────────────────────────────────────────────
    //  ADMIN
    // ─────────────────────────────────────────────
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "GridX: new owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
