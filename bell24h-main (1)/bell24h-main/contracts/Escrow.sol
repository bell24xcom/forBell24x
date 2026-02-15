// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow is ReentrancyGuard, Ownable {
    struct Transaction {
        address buyer;
        address supplier;
        uint256 amount;
        uint256 timestamp;
        bool isReleased;
        bool isRefunded;
        bool isDisputed;
        string metadata;
    }

    // Mapping from transaction ID to Transaction
    mapping(bytes32 => Transaction) public transactions;
    
    // Mapping for platform fees
    uint256 public platformFee;
    address public feeCollector;
    
    // Events
    event TransactionCreated(bytes32 indexed transactionId, address indexed buyer, address indexed supplier, uint256 amount);
    event FundsReleased(bytes32 indexed transactionId, address indexed supplier, uint256 amount);
    event FundsRefunded(bytes32 indexed transactionId, address indexed buyer, uint256 amount);
    event DisputeRaised(bytes32 indexed transactionId, address indexed raiser);
    event DisputeResolved(bytes32 indexed transactionId, bool refunded);
    event PlatformFeeUpdated(uint256 newFee);
    event FeeCollectorUpdated(address newCollector);

    constructor(uint256 _platformFee, address _feeCollector) {
        require(_platformFee <= 1000, "Fee cannot exceed 10%");
        platformFee = _platformFee;
        feeCollector = _feeCollector;
    }

    function createTransaction(
        address _supplier,
        string memory _metadata
    ) external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_supplier != address(0), "Invalid supplier address");
        require(_supplier != msg.sender, "Buyer cannot be supplier");

        bytes32 transactionId = keccak256(
            abi.encodePacked(
                msg.sender,
                _supplier,
                msg.value,
                block.timestamp
            )
        );

        transactions[transactionId] = Transaction({
            buyer: msg.sender,
            supplier: _supplier,
            amount: msg.value,
            timestamp: block.timestamp,
            isReleased: false,
            isRefunded: false,
            isDisputed: false,
            metadata: _metadata
        });

        emit TransactionCreated(transactionId, msg.sender, _supplier, msg.value);
    }

    function releaseFunds(bytes32 _transactionId) external nonReentrant {
        Transaction storage transaction = transactions[_transactionId];
        require(transaction.buyer == msg.sender, "Only buyer can release funds");
        require(!transaction.isReleased, "Funds already released");
        require(!transaction.isRefunded, "Transaction was refunded");
        require(!transaction.isDisputed, "Transaction is disputed");

        uint256 feeAmount = (transaction.amount * platformFee) / 10000;
        uint256 supplierAmount = transaction.amount - feeAmount;

        transaction.isReleased = true;
        
        (bool feeSuccess, ) = feeCollector.call{value: feeAmount}("");
        require(feeSuccess, "Fee transfer failed");

        (bool supplierSuccess, ) = transaction.supplier.call{value: supplierAmount}("");
        require(supplierSuccess, "Supplier transfer failed");

        emit FundsReleased(_transactionId, transaction.supplier, supplierAmount);
    }

    function refundFunds(bytes32 _transactionId) external nonReentrant {
        Transaction storage transaction = transactions[_transactionId];
        require(transaction.buyer == msg.sender, "Only buyer can refund");
        require(!transaction.isReleased, "Funds already released");
        require(!transaction.isRefunded, "Already refunded");
        require(!transaction.isDisputed, "Transaction is disputed");

        transaction.isRefunded = true;
        
        (bool success, ) = transaction.buyer.call{value: transaction.amount}("");
        require(success, "Refund transfer failed");

        emit FundsRefunded(_transactionId, transaction.buyer, transaction.amount);
    }

    function raiseDispute(bytes32 _transactionId) external {
        Transaction storage transaction = transactions[_transactionId];
        require(
            msg.sender == transaction.buyer || msg.sender == transaction.supplier,
            "Only buyer or supplier can raise dispute"
        );
        require(!transaction.isReleased, "Funds already released");
        require(!transaction.isRefunded, "Transaction was refunded");
        require(!transaction.isDisputed, "Dispute already raised");

        transaction.isDisputed = true;
        emit DisputeRaised(_transactionId, msg.sender);
    }

    function resolveDispute(bytes32 _transactionId, bool _refund) external onlyOwner {
        Transaction storage transaction = transactions[_transactionId];
        require(transaction.isDisputed, "No dispute raised");
        require(!transaction.isReleased, "Funds already released");
        require(!transaction.isRefunded, "Already refunded");

        if (_refund) {
            transaction.isRefunded = true;
            (bool success, ) = transaction.buyer.call{value: transaction.amount}("");
            require(success, "Refund transfer failed");
        } else {
            transaction.isReleased = true;
            uint256 feeAmount = (transaction.amount * platformFee) / 10000;
            uint256 supplierAmount = transaction.amount - feeAmount;

            (bool feeSuccess, ) = feeCollector.call{value: feeAmount}("");
            require(feeSuccess, "Fee transfer failed");

            (bool supplierSuccess, ) = transaction.supplier.call{value: supplierAmount}("");
            require(supplierSuccess, "Supplier transfer failed");
        }

        emit DisputeResolved(_transactionId, _refund);
    }

    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee cannot exceed 10%");
        platformFee = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }

    function updateFeeCollector(address _newCollector) external onlyOwner {
        require(_newCollector != address(0), "Invalid fee collector address");
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(_newCollector);
    }

    function getTransaction(bytes32 _transactionId) external view returns (
        address buyer,
        address supplier,
        uint256 amount,
        uint256 timestamp,
        bool isReleased,
        bool isRefunded,
        bool isDisputed,
        string memory metadata
    ) {
        Transaction storage transaction = transactions[_transactionId];
        return (
            transaction.buyer,
            transaction.supplier,
            transaction.amount,
            transaction.timestamp,
            transaction.isReleased,
            transaction.isRefunded,
            transaction.isDisputed,
            transaction.metadata
        );
    }

    receive() external payable {}
} 