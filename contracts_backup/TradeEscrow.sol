// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

/**
 * @title TradeEscrow
 * @dev Manages B2B trades with GST compliance, fund escrow, and India Stack integration points.
 */
contract TradeEscrow is Initializable, ReentrancyGuardUpgradeable, AccessControlUpgradeable, PausableUpgradeable, UUPSUpgradeable {

    // ----------- Structs ----------- //
    struct Trade {
        bytes32 tradeId;            // Unique identifier for the trade
        address buyer;
        address seller;
        uint256 totalAmount;        // Includes item cost + estimated GST
        uint256 itemAmount;
        uint256 gstAmount;
        uint256 platformFee;
        address paymentToken;       // Address of the ERC20 token used for payment (address(0) for MATIC/ETH)
        uint256 escrowDeadline;     // Timestamp for seller to confirm or goods to be delivered
        uint256 releaseDeadline;    // Timestamp for buyer to confirm receipt or auto-release
        TradeStatus status;
        bool buyerGSTVerified;      // Placeholder: To be integrated with DID/GSTN Oracle
        bool sellerGSTVerified;     // Placeholder: To be integrated with DID/GSTN Oracle
        string ondcOrderId;         // Optional: ONDC order ID reference
        string shipmentDetails;     // Optional: Shipment details
        uint256 gstRatePercentage; // e.g., 1800 for 18%
        uint256 platformFeePercentageAtTradeCreation; // e.g., 100 for 1%
    }

    // ----------- Enums ----------- //
    enum TradeStatus {
        Created,        // Trade initiated by buyer, pending funding
        Funded,         // Buyer deposited funds into escrow
        SellerConfirmed,// Seller acknowledged/accepted the order
        Shipped,        // Seller marked goods as shipped (optional)
        Delivered,      // Goods confirmed delivered (by Buyer or Oracle)
        BuyerApproved,  // Buyer approved release of funds from escrow
        Disputed,       // Dispute raised by buyer or seller
        Resolved,       // Dispute resolved by arbitrator
        Released,       // Funds released to seller, GST remitted
        Cancelled,      // Trade cancelled (e.g., before funding, by mutual consent, or timeout)
        Refunded        // Funds refunded to buyer (e.g., after cancellation or dispute resolution)
    }

    // ----------- State Variables ----------- //
    mapping(bytes32 => Trade) public trades;
    mapping(address => bool) public isArbitrator; // Managed by Admin/Owner

    address public gstAuthorityWallet;
    address public platformFeeWallet;
    uint256 public platformFeePercentage; // e.g., 100 for 1% (100 basis points = 1%)
    address public oracleAddress;

    // ----------- Roles ----------- //
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant WALLET_MANAGER_ROLE = keccak256("WALLET_MANAGER_ROLE");
    bytes32 public constant FEE_MANAGER_ROLE = keccak256("FEE_MANAGER_ROLE");
    bytes32 public constant ARBITRATOR_MANAGER_ROLE = keccak256("ARBITRATOR_MANAGER_ROLE");
    bytes32 public constant ORACLE_CONFIG_ROLE = keccak256("ORACLE_CONFIG_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ----------- Events ----------- //
    event TradeCreated(bytes32 indexed tradeId, address indexed buyer, address indexed seller, uint256 totalAmount, address paymentToken);
    event TradeFunded(bytes32 indexed tradeId, uint256 amount);
    event OrderConfirmedBySeller(bytes32 indexed tradeId);
    event GoodsShipped(bytes32 indexed tradeId, string shipmentDetails);
    event DeliveryConfirmed(bytes32 indexed tradeId, address confirmer);
    event BuyerApprovedRelease(bytes32 indexed tradeId);
    event FundsReleased(bytes32 indexed tradeId, address indexed seller, uint256 sellerAmount, uint256 gstAmount, uint256 platformFeeAmount);
    event GSTRemitted(bytes32 indexed tradeId, address indexed gstAuthority, uint256 gstAmount);
    event PlatformFeeCollected(bytes32 indexed tradeId, address indexed feeWallet, uint256 feeAmount);
    event TradeDisputed(bytes32 indexed tradeId, address indexed disputer, string reason);
    event TradeResolved(bytes32 indexed tradeId, uint256 finalAmountToBuyer, uint256 finalNetAmountToSeller, uint256 finalGstAmount, uint256 finalPlatformFee, string resolutionNotes);
    event TradeCancelled(bytes32 indexed tradeId, string reason);
    event TradeRefunded(bytes32 indexed tradeId, address indexed buyer, uint256 amount);

    event GSTAuthorityWalletUpdated(address indexed newWallet);
    event PlatformFeeWalletUpdated(address indexed newWallet);
    event PlatformFeePercentageUpdated(uint256 newFeePercentage);
    event ArbitratorAdded(address indexed arbitrator);
    event ArbitratorRemoved(address indexed arbitrator);

    event OracleAddressUpdated(address indexed newOracleAddress);
    event GSTVerificationUpdated(bytes32 indexed tradeId, bool buyerVerified, bool sellerVerified);

    event ContractPaused(address pauser);
    event ContractUnpaused(address unpauser);

    // ----------- Modifiers ----------- //
    modifier onlyBuyer(bytes32 tradeId) {
        require(trades[tradeId].buyer == msg.sender, "TradeEscrow: Caller is not the buyer");
        _;
    }

    modifier onlySeller(bytes32 tradeId) {
        require(trades[tradeId].seller == msg.sender, "TradeEscrow: Caller is not the seller");
        _;
    }

    modifier onlyArbitrator() {
        require(isArbitrator[msg.sender], "TradeEscrow: Caller is not an arbitrator");
        _;
    }

    modifier tradeExists(bytes32 tradeId) {
        require(trades[tradeId].buyer != address(0), "TradeEscrow: Trade does not exist");
        _;
    }

    modifier inStatus(bytes32 tradeId, TradeStatus expectedStatus) {
        require(trades[tradeId].status == expectedStatus, "TradeEscrow: Trade not in expected status");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "TradeEscrow: Caller is not the authorized oracle");
        _;
    }

    modifier whenNotPaused() override {
        require(!paused(), "TradeEscrow: Contract is paused");
        _;
    }

    // ----------- Initializer ----------- //
    function initialize(
        address initialAdmin,
        address initialGSTAuthorityWallet,
        address initialPlatformFeeWallet,
        uint256 initialPlatformFeePercentage,
        address initialOracleAddress
    ) public initializer {
        __ReentrancyGuard_init();
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(UPGRADER_ROLE, initialAdmin);
        _grantRole(WALLET_MANAGER_ROLE, initialAdmin);
        _grantRole(FEE_MANAGER_ROLE, initialAdmin);
        _grantRole(ARBITRATOR_MANAGER_ROLE, initialAdmin);
        _grantRole(ORACLE_CONFIG_ROLE, initialAdmin);
        _grantRole(PAUSER_ROLE, initialAdmin);

        require(initialGSTAuthorityWallet != address(0), "GST Authority wallet cannot be zero address");
        require(initialPlatformFeeWallet != address(0), "Platform Fee wallet cannot be zero address");
        // initialPlatformFeePercentage can be 0
        require(initialOracleAddress != address(0), "TradeEscrow: Oracle address cannot be zero during init");

        gstAuthorityWallet = initialGSTAuthorityWallet;
        platformFeeWallet = initialPlatformFeeWallet;
        platformFeePercentage = initialPlatformFeePercentage;
        oracleAddress = initialOracleAddress;

        emit GSTAuthorityWalletUpdated(initialGSTAuthorityWallet);
        emit PlatformFeeWalletUpdated(initialPlatformFeeWallet);
        emit PlatformFeePercentageUpdated(initialPlatformFeePercentage);
        emit OracleAddressUpdated(initialOracleAddress);
    }

    // ----------- UUPS Upgradeability ----------- //
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    // ----------- Key Functions ----------- //

    /**
     * @notice Creates a new trade agreement.
     * @param tradeId A unique ID for the trade (e.g., keccak256 of buyer, seller, nonce).
     * @param seller The address of the seller.
     * @param itemAmount The cost of the item/service, excluding GST.
     * @param gstRate The GST rate in basis points (e.g., 1800 for 18%).
     * @param paymentTokenAddress Address of the ERC20 token for payment. Use address(0) for native currency (MATIC).
     * @param _escrowDeadline Timestamp by which seller must confirm or goods delivered.
     * @param _releaseDeadline Timestamp by which buyer must confirm receipt or funds auto-release.
     */
    function createTrade(
        bytes32 tradeId,
        address seller,
        uint256 itemAmount,
        uint256 gstRate, // e.g., 1800 for 18%
        address paymentTokenAddress,
        uint256 _escrowDeadline,
        uint256 _releaseDeadline
    ) external nonReentrant whenNotPaused {
        require(trades[tradeId].buyer == address(0), "TradeEscrow: Trade ID already exists");
        require(seller != address(0), "TradeEscrow: Seller address cannot be zero");
        require(seller != msg.sender, "TradeEscrow: Buyer and Seller cannot be the same");
        require(itemAmount > 0, "TradeEscrow: Item amount must be greater than zero");
        // gstRate can be 0
        require(_escrowDeadline > block.timestamp, "TradeEscrow: Escrow deadline must be in the future");
        require(_releaseDeadline > _escrowDeadline, "TradeEscrow: Release deadline must be after escrow deadline");

        uint256 calculatedGstAmount = (itemAmount * gstRate) / 10000;
        uint256 calculatedPlatformFee = (itemAmount * platformFeePercentage) / 10000; // Assuming fee is on itemAmount
        uint256 totalTradeAmount = itemAmount + calculatedGstAmount;

        trades[tradeId] = Trade({
            tradeId: tradeId,
            buyer: msg.sender,
            seller: seller,
            totalAmount: totalTradeAmount,
            itemAmount: itemAmount,
            gstAmount: calculatedGstAmount,
            platformFee: calculatedPlatformFee,
            paymentToken: paymentTokenAddress,
            escrowDeadline: _escrowDeadline,
            releaseDeadline: _releaseDeadline,
            status: TradeStatus.Created,
            buyerGSTVerified: false, // To be updated by oracle
            sellerGSTVerified: false, // To be updated by oracle
            ondcOrderId: "",
            shipmentDetails: "",
            gstRatePercentage: gstRate, // gstRate param from createTrade is the percentage
            platformFeePercentageAtTradeCreation: platformFeePercentage // Global platformFeePercentage at time of creation
        });

        emit TradeCreated(tradeId, msg.sender, seller, totalTradeAmount, paymentTokenAddress);
    }

    /**
     * @notice Buyer funds the trade escrow.
     * @param tradeId The ID of the trade to fund.
     */
    function fundTrade(bytes32 tradeId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        tradeExists(tradeId) 
        onlyBuyer(tradeId) 
        inStatus(tradeId, TradeStatus.Created)
    {
        Trade storage trade = trades[tradeId];
        
        if (trade.paymentToken == address(0)) { // Native currency (MATIC)
            require(msg.value == trade.totalAmount, "TradeEscrow: Incorrect MATIC amount sent");
        } else { // ERC20 Token
            require(msg.value == 0, "TradeEscrow: MATIC sent for ERC20 trade");
            IERC20Upgradeable token = IERC20Upgradeable(trade.paymentToken);
            // Ensure allowance is set by buyer beforehand
            require(token.transferFrom(msg.sender, address(this), trade.totalAmount), "TradeEscrow: ERC20 transfer failed");
        }

        trade.status = TradeStatus.Funded;
        // TODO: Trigger GSTN verification for buyer and seller via oracle if not already done.
        emit TradeFunded(tradeId, trade.totalAmount);
    }

    // --- Other function signatures based on specs (to be implemented) ---

    function sellerConfirmOrder(bytes32 tradeId) 
        external 
        nonReentrant 
        whenNotPaused 
        tradeExists(tradeId) 
        onlySeller(tradeId) 
        inStatus(tradeId, TradeStatus.Funded)
    {
        // Implementation: Update status to SellerConfirmed
        trades[tradeId].status = TradeStatus.SellerConfirmed;
        emit OrderConfirmedBySeller(tradeId);
    }

    function markAsShipped(bytes32 tradeId, string calldata _shipmentDetails) 
        external 
        nonReentrant 
        whenNotPaused 
        tradeExists(tradeId) 
        onlySeller(tradeId) 
        // Typically after SellerConfirmed or Funded, depending on workflow
        // require(trades[tradeId].status == TradeStatus.SellerConfirmed || trades[tradeId].status == TradeStatus.Funded, "Invalid status"); 
    {
        // Implementation: Update status to Shipped, store shipmentDetails
        trades[tradeId].status = TradeStatus.Shipped;
        trades[tradeId].shipmentDetails = _shipmentDetails;
        emit GoodsShipped(tradeId, _shipmentDetails);
    }

    function confirmDelivery(bytes32 tradeId) 
        external 
        nonReentrant 
        whenNotPaused 
        tradeExists(tradeId) 
        // Can be called by Buyer or an authorized Oracle (Oracle logic not yet implemented here)
        // require(msg.sender == trades[tradeId].buyer || isOracle[msg.sender], "Not authorized");
        // require(trades[tradeId].status == TradeStatus.Shipped || trades[tradeId].status == TradeStatus.SellerConfirmed, "Invalid status");
    {
        // For now, only buyer can confirm
        require(msg.sender == trades[tradeId].buyer, "TradeEscrow: Only buyer or oracle can confirm delivery");
        trades[tradeId].status = TradeStatus.Delivered;
        emit DeliveryConfirmed(tradeId, msg.sender);
    }

    function approveRelease(bytes32 tradeId) 
        external 
        nonReentrant 
        whenNotPaused 
        tradeExists(tradeId) 
        onlyBuyer(tradeId) 
        inStatus(tradeId, TradeStatus.Delivered)
    {
        // Implementation: Update status to BuyerApproved. 
        // If high-value, may require multi-sig (not implemented here, simple release for now)
        trades[tradeId].status = TradeStatus.BuyerApproved;
        emit BuyerApprovedRelease(tradeId);
        // Potentially call _releaseFundsAndGST directly if no further checks
         _releaseFundsAndGST(tradeId); // Or queue for a separate executeRelease call
    }

    function executeRelease(bytes32 tradeId) 
        external 
        nonReentrant 
        whenNotPaused 
        tradeExists(tradeId) 
        // Can be called by Seller or Buyer if releaseDeadline has passed and status is Delivered/BuyerApproved
        // require(trades[tradeId].status == TradeStatus.BuyerApproved || 
        //        (trades[tradeId].status == TradeStatus.Delivered && block.timestamp > trades[tradeId].releaseDeadline),
        //        "Cannot execute release yet");
    {
        // For now, assume BuyerApproved status is sufficient or deadline passed
        require(trades[tradeId].status == TradeStatus.BuyerApproved || 
               (trades[tradeId].status == TradeStatus.Delivered && block.timestamp > trades[tradeId].releaseDeadline),
               "TradeEscrow: Conditions for release not met");
        _releaseFundsAndGST(tradeId);
    }

    function _releaseFundsAndGST(bytes32 tradeId) 
        internal 
        nonReentrant 
        whenNotPaused 
        tradeExists(tradeId)
        // Ensure this is only callable under correct conditions (e.g. BuyerApproved or auto-release)
    {
        Trade storage trade = trades[tradeId];
        require(trade.status == TradeStatus.BuyerApproved || 
                (trade.status == TradeStatus.Delivered && block.timestamp > trade.releaseDeadline),
                 "TradeEscrow: Release conditions not met internally");
        require(trade.status != TradeStatus.Released, "TradeEscrow: Funds already released");
        require(trade.buyerGSTVerified && trade.sellerGSTVerified, "TradeEscrow: GST not verified for both parties");

        uint256 sellerAmount = trade.itemAmount - trade.platformFee;

        // Transfer funds
        if (trade.paymentToken == address(0)) { // Native MATIC
            payable(trade.seller).transfer(sellerAmount);
            payable(gstAuthorityWallet).transfer(trade.gstAmount);
            payable(platformFeeWallet).transfer(trade.platformFee);
        } else { // ERC20 Token
            IERC20Upgradeable token = IERC20Upgradeable(trade.paymentToken);
            require(token.transfer(trade.seller, sellerAmount), "Seller transfer failed");
            require(token.transfer(gstAuthorityWallet, trade.gstAmount), "GST transfer failed");
            require(token.transfer(platformFeeWallet, trade.platformFee), "Platform fee transfer failed");
        }

        trade.status = TradeStatus.Released;
        emit FundsReleased(tradeId, trade.seller, sellerAmount, trade.gstAmount, trade.platformFee);
        emit GSTRemitted(tradeId, gstAuthorityWallet, trade.gstAmount);
        emit PlatformFeeCollected(tradeId, platformFeeWallet, trade.platformFee);
    }

    function raiseDispute(bytes32 tradeId, string calldata reason) 
        external 
        nonReentrant 
        whenNotPaused 
        tradeExists(tradeId)
        // require(msg.sender == trades[tradeId].buyer || msg.sender == trades[tradeId].seller, "Not party to trade");
        // require(trades[tradeId].status == TradeStatus.Funded || ... other disputable statuses ... , "Not disputable status");
    {
        // Implementation: Update status to Disputed
        trades[tradeId].status = TradeStatus.Disputed;
        emit TradeDisputed(tradeId, msg.sender, reason);
    }

    function resolveDispute(
        bytes32 tradeId,
        uint256 finalItemAmountForSeller,
        string calldata resolutionNotes
    )
        external
        nonReentrant
        whenNotPaused
        tradeExists(tradeId)
        onlyArbitrator
        inStatus(tradeId, TradeStatus.Disputed)
    {
        Trade storage trade = trades[tradeId];
        require(finalItemAmountForSeller <= trade.itemAmount, "TradeEscrow: Final seller amount exceeds original item amount");

        uint256 finalGstAmount = (finalItemAmountForSeller * trade.gstRatePercentage) / 10000;
        uint256 finalPlatformFee = (finalItemAmountForSeller * trade.platformFeePercentageAtTradeCreation) / 10000;

        uint256 netPaymentToSeller = finalItemAmountForSeller - finalPlatformFee;
        // If finalItemAmountForSeller is 0, netPaymentToSeller is 0 (assuming platformFeePercentage is not >100% or fixed and larger than 0)

        uint256 totalAllocatedToSellerAndRelatedCharges = finalItemAmountForSeller + finalGstAmount;
        require(totalAllocatedToSellerAndRelatedCharges <= trade.totalAmount, "TradeEscrow: Resolved amounts for seller and GST exceed total escrowed. Check initial calculation or gstRatePercentage.");
        uint256 refundToBuyer = trade.totalAmount - totalAllocatedToSellerAndRelatedCharges;

        // Perform transfers
        if (trade.paymentToken == address(0)) { // Native MATIC
            if (netPaymentToSeller > 0) {
                payable(trade.seller).transfer(netPaymentToSeller);
            }
            if (finalGstAmount > 0) {
                payable(gstAuthorityWallet).transfer(finalGstAmount);
            }
            if (finalPlatformFee > 0) {
                payable(platformFeeWallet).transfer(finalPlatformFee);
            }
            if (refundToBuyer > 0) {
                payable(trade.buyer).transfer(refundToBuyer);
            }
        } else { // ERC20 Token
            IERC20Upgradeable token = IERC20Upgradeable(trade.paymentToken);
            if (netPaymentToSeller > 0) {
                require(token.transfer(trade.seller, netPaymentToSeller), "TradeEscrow: Seller ERC20 transfer failed during dispute resolution");
            }
            if (finalGstAmount > 0) {
                require(token.transfer(gstAuthorityWallet, finalGstAmount), "TradeEscrow: GST ERC20 transfer failed during dispute resolution");
            }
            if (finalPlatformFee > 0) {
                require(token.transfer(platformFeeWallet, finalPlatformFee), "TradeEscrow: Platform fee ERC20 transfer failed during dispute resolution");
            }
            if (refundToBuyer > 0) {
                require(token.transfer(trade.buyer, refundToBuyer), "TradeEscrow: Buyer ERC20 refund failed during dispute resolution");
            }
        }

        trade.status = TradeStatus.Resolved;

        // Emit specific events for fund movements if they occurred
        if (netPaymentToSeller > 0 || finalGstAmount > 0 || finalPlatformFee > 0) {
            // This event covers the seller's part, GST, and platform fee from the seller's earnings
            emit FundsReleased(tradeId, trade.seller, netPaymentToSeller, finalGstAmount, finalPlatformFee);
        }
        if (finalGstAmount > 0) { // Could be redundant if FundsReleased is comprehensive enough, but good for specific tracking
            emit GSTRemitted(tradeId, gstAuthorityWallet, finalGstAmount);
        }
        if (finalPlatformFee > 0) { // Similar to GSTRemitted
            emit PlatformFeeCollected(tradeId, platformFeeWallet, finalPlatformFee);
        }
        if (refundToBuyer > 0) {
            emit TradeRefunded(tradeId, trade.buyer, refundToBuyer);
        }
        
        emit TradeResolved(tradeId, refundToBuyer, netPaymentToSeller, finalGstAmount, finalPlatformFee, resolutionNotes);
    }

    function cancelTrade(bytes32 tradeId, string calldata reason) 
        external 
        nonReentrant 
        whenNotPaused 
        tradeExists(tradeId)
        // Conditions for cancellation (e.g., onlyBuyer before funding, or mutual consent)
        // require(trades[tradeId].status == TradeStatus.Created && msg.sender == trades[tradeId].buyer, "Cannot cancel");
    {
        // Implementation: Update status to Cancelled, handle refunds if funded
        Trade storage trade = trades[tradeId];
        // Simplified: only buyer can cancel if not funded, or if seller hasn't confirmed and deadline passed
        require( (trade.status == TradeStatus.Created && msg.sender == trade.buyer) || 
                 (trade.status == TradeStatus.Funded && msg.sender == trade.buyer && block.timestamp > trade.escrowDeadline && trade.status != TradeStatus.SellerConfirmed),
                 "TradeEscrow: Cancellation conditions not met");

        if (trade.status == TradeStatus.Funded) {
            // Refund to buyer
            if (trade.paymentToken == address(0)) {
                payable(trade.buyer).transfer(trade.totalAmount);
            } else {
                IERC20Upgradeable token = IERC20Upgradeable(trade.paymentToken);
                require(token.transfer(trade.buyer, trade.totalAmount), "Refund transfer failed");
            }
            emit TradeRefunded(tradeId, trade.buyer, trade.totalAmount);
        }
        trade.status = TradeStatus.Cancelled;
        emit TradeCancelled(tradeId, reason);
    }

    // ----------- Admin Functions ----------- //
    function setGSTAuthorityWallet(address _newWallet) external onlyRole(WALLET_MANAGER_ROLE) {
        require(_newWallet != address(0), "Cannot set zero address");
        gstAuthorityWallet = _newWallet;
        emit GSTAuthorityWalletUpdated(_newWallet);
    }

    function setPlatformFeeWallet(address _newWallet) external onlyRole(WALLET_MANAGER_ROLE) {
        require(_newWallet != address(0), "Cannot set zero address");
        platformFeeWallet = _newWallet;
        emit PlatformFeeWalletUpdated(_newWallet);
    }

    function setPlatformFeePercentage(uint256 _newFeePercentage) external onlyRole(FEE_MANAGER_ROLE) {
        // Add validation if needed, e.g., max fee
        platformFeePercentage = _newFeePercentage;
        emit PlatformFeePercentageUpdated(_newFeePercentage);
    }

    function addArbitrator(address _arbitrator) external onlyRole(ARBITRATOR_MANAGER_ROLE) {
        require(_arbitrator != address(0), "Cannot add zero address");
        require(!isArbitrator[_arbitrator], "Already an arbitrator");
        isArbitrator[_arbitrator] = true;
        emit ArbitratorAdded(_arbitrator);
    }

    function removeArbitrator(address _arbitrator) external onlyRole(ARBITRATOR_MANAGER_ROLE) {
        require(isArbitrator[_arbitrator], "Not an arbitrator");
        isArbitrator[_arbitrator] = false;
        emit ArbitratorRemoved(_arbitrator);
    }

    // Pause & Unpause Functions
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    function setOracleAddress(address _newOracleAddress) external onlyRole(ORACLE_CONFIG_ROLE) {
        require(_newOracleAddress != address(0), "TradeEscrow: Oracle address cannot be zero");
        oracleAddress = _newOracleAddress;
        emit OracleAddressUpdated(_newOracleAddress);
    }

    // Function to receive Ether (for trades where paymentToken is address(0) but fundTrade is not used directly)
    // receive() external payable {}
    // fallback() external payable {}

    // ----------- Oracle Functions ----------- //
    function updateGSTVerificationStatus(
        bytes32 tradeId,
        bool _buyerGSTVerified,
        bool _sellerGSTVerified
    ) external nonReentrant whenNotPaused tradeExists(tradeId) onlyOracle {
        Trade storage trade = trades[tradeId];
        require(
            trade.status != TradeStatus.Disputed &&
            trade.status != TradeStatus.Resolved &&
            trade.status != TradeStatus.Released &&
            trade.status != TradeStatus.Cancelled &&
            trade.status != TradeStatus.Refunded,
            "TradeEscrow: Cannot update GST for disputed, resolved, or finalized trade"
        );
        
        trade.buyerGSTVerified = _buyerGSTVerified;
        trade.sellerGSTVerified = _sellerGSTVerified;
        emit GSTVerificationUpdated(tradeId, _buyerGSTVerified, _sellerGSTVerified);
    }

    function oracleConfirmDelivery(bytes32 tradeId)
        external
        nonReentrant
        whenNotPaused
        tradeExists(tradeId)
        onlyOracle
    {
        Trade storage trade = trades[tradeId];
        // Ensure trade is in a state where delivery confirmation is logical
        // e.g., Shipped or SellerConfirmed, and not already delivered or disputed.
        require(
            (trade.status == TradeStatus.Shipped || trade.status == TradeStatus.SellerConfirmed),
            "TradeEscrow: Invalid status for oracle delivery confirmation"
        );
        require(
            trade.status != TradeStatus.Delivered &&
            trade.status != TradeStatus.BuyerApproved &&
            trade.status != TradeStatus.Disputed &&
            trade.status != TradeStatus.Released &&
            trade.status != TradeStatus.Cancelled &&
            trade.status != TradeStatus.Refunded,
            "TradeEscrow: Delivery already processed, disputed or finalized"
        );

        trade.status = TradeStatus.Delivered;
        emit DeliveryConfirmed(tradeId, oracleAddress); // Indicate oracle as confirmer
    }
}
