// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title BellEscrow
 * @dev Smart contract for secure milestone-based escrow payments
 * @author Bell24h Team
 */
contract BellEscrow is ReentrancyGuard, Ownable, Pausable {
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed supplier,
        uint256 amount,
        uint256 milestones
    );
    
    event MilestoneCompleted(
        uint256 indexed escrowId,
        uint256 indexed milestone,
        address indexed supplier
    );
    
    event MilestoneReleased(
        uint256 indexed escrowId,
        uint256 indexed milestone,
        uint256 amount,
        address indexed supplier
    );
    
    event EscrowDisputed(
        uint256 indexed escrowId,
        address indexed initiator,
        string reason
    );
    
    event EscrowResolved(
        uint256 indexed escrowId,
        bool buyerWins,
        uint256 refundAmount
    );
    
    // Structs
    struct Escrow {
        address buyer;
        address supplier;
        uint256 amount;
        uint256 milestones;
        uint256 completedMilestones;
        bool isActive;
        bool isDisputed;
        uint256 createdAt;
        uint256 disputeDeadline;
        mapping(uint256 => bool) milestoneCompleted;
        mapping(uint256 => uint256) milestoneAmounts;
    }
    
    struct Dispute {
        address initiator;
        string reason;
        uint256 timestamp;
        bool resolved;
    }
    
    // State variables
    uint256 public nextEscrowId;
    uint256 public platformFee = 25; // 2.5% (25/1000)
    uint256 public disputePeriod = 7 days;
    address public feeRecipient;
    
    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => uint256[]) public userEscrows;
    
    // Modifiers
    modifier onlyEscrowParty(uint256 _escrowId) {
        require(
            msg.sender == escrows[_escrowId].buyer || 
            msg.sender == escrows[_escrowId].supplier,
            "Not authorized"
        );
        _;
    }
    
    modifier escrowExists(uint256 _escrowId) {
        require(_escrowId < nextEscrowId, "Escrow does not exist");
        _;
    }
    
    modifier escrowActive(uint256 _escrowId) {
        require(escrows[_escrowId].isActive, "Escrow not active");
        _;
    }
    
    // Constructor
    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Create a new escrow
     * @param _supplier Supplier address
     * @param _milestones Number of milestones
     * @param _milestoneAmounts Array of amounts for each milestone
     */
    function createEscrow(
        address _supplier,
        uint256 _milestones,
        uint256[] memory _milestoneAmounts
    ) external payable whenNotPaused nonReentrant {
        require(_supplier != address(0), "Invalid supplier");
        require(_supplier != msg.sender, "Cannot escrow with self");
        require(_milestones > 0, "Must have at least one milestone");
        require(_milestones == _milestoneAmounts.length, "Milestone amounts mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            totalAmount += _milestoneAmounts[i];
        }
        
        require(msg.value >= totalAmount, "Insufficient payment");
        
        uint256 escrowId = nextEscrowId++;
        Escrow storage escrow = escrows[escrowId];
        
        escrow.buyer = msg.sender;
        escrow.supplier = _supplier;
        escrow.amount = totalAmount;
        escrow.milestones = _milestones;
        escrow.isActive = true;
        escrow.createdAt = block.timestamp;
        escrow.disputeDeadline = block.timestamp + disputePeriod;
        
        for (uint256 i = 0; i < _milestoneAmounts.length; i++) {
            escrow.milestoneAmounts[i] = _milestoneAmounts[i];
        }
        
        userEscrows[msg.sender].push(escrowId);
        userEscrows[_supplier].push(escrowId);
        
        emit EscrowCreated(escrowId, msg.sender, _supplier, totalAmount, _milestones);
    }
    
    /**
     * @dev Mark a milestone as completed
     * @param _escrowId Escrow ID
     * @param _milestone Milestone number (0-indexed)
     */
    function completeMilestone(
        uint256 _escrowId,
        uint256 _milestone
    ) external escrowExists(_escrowId) escrowActive(_escrowId) onlyEscrowParty(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(_milestone < escrow.milestones, "Invalid milestone");
        require(!escrow.milestoneCompleted[_milestone], "Milestone already completed");
        require(escrow.supplier == msg.sender, "Only supplier can complete milestones");
        
        escrow.milestoneCompleted[_milestone] = true;
        escrow.completedMilestones++;
        
        emit MilestoneCompleted(_escrowId, _milestone, msg.sender);
    }
    
    /**
     * @dev Release payment for a completed milestone
     * @param _escrowId Escrow ID
     * @param _milestone Milestone number (0-indexed)
     */
    function releaseMilestone(
        uint256 _escrowId,
        uint256 _milestone
    ) external escrowExists(_escrowId) escrowActive(_escrowId) onlyEscrowParty(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(_milestone < escrow.milestones, "Invalid milestone");
        require(escrow.milestoneCompleted[_milestone], "Milestone not completed");
        require(escrow.buyer == msg.sender, "Only buyer can release payments");
        
        uint256 amount = escrow.milestoneAmounts[_milestone];
        uint256 fee = (amount * platformFee) / 1000;
        uint256 supplierAmount = amount - fee;
        
        // Transfer to supplier
        payable(escrow.supplier).transfer(supplierAmount);
        
        // Transfer fee to platform
        if (fee > 0) {
            payable(feeRecipient).transfer(fee);
        }
        
        emit MilestoneReleased(_escrowId, _milestone, supplierAmount, escrow.supplier);
        
        // Check if all milestones are completed
        if (escrow.completedMilestones == escrow.milestones) {
            escrow.isActive = false;
        }
    }
    
    /**
     * @dev Initiate a dispute
     * @param _escrowId Escrow ID
     * @param _reason Reason for dispute
     */
    function initiateDispute(
        uint256 _escrowId,
        string memory _reason
    ) external escrowExists(_escrowId) escrowActive(_escrowId) onlyEscrowParty(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(!escrow.isDisputed, "Dispute already initiated");
        require(block.timestamp <= escrow.disputeDeadline, "Dispute period expired");
        
        escrow.isDisputed = true;
        
        disputes[_escrowId] = Dispute({
            initiator: msg.sender,
            reason: _reason,
            timestamp: block.timestamp,
            resolved: false
        });
        
        emit EscrowDisputed(_escrowId, msg.sender, _reason);
    }
    
    /**
     * @dev Resolve a dispute (only owner)
     * @param _escrowId Escrow ID
     * @param _buyerWins Whether buyer wins the dispute
     * @param _refundAmount Amount to refund to buyer
     */
    function resolveDispute(
        uint256 _escrowId,
        bool _buyerWins,
        uint256 _refundAmount
    ) external onlyOwner escrowExists(_escrowId) {
        Escrow storage escrow = escrows[_escrowId];
        require(escrow.isDisputed, "No dispute to resolve");
        require(!disputes[_escrowId].resolved, "Dispute already resolved");
        
        disputes[_escrowId].resolved = true;
        escrow.isActive = false;
        
        if (_buyerWins && _refundAmount > 0) {
            payable(escrow.buyer).transfer(_refundAmount);
        }
        
        emit EscrowResolved(_escrowId, _buyerWins, _refundAmount);
    }
    
    /**
     * @dev Get escrow details
     * @param _escrowId Escrow ID
     */
    function getEscrowDetails(uint256 _escrowId) external view returns (
        address buyer,
        address supplier,
        uint256 amount,
        uint256 milestones,
        uint256 completedMilestones,
        bool isActive,
        bool isDisputed,
        uint256 createdAt
    ) {
        Escrow storage escrow = escrows[_escrowId];
        return (
            escrow.buyer,
            escrow.supplier,
            escrow.amount,
            escrow.milestones,
            escrow.completedMilestones,
            escrow.isActive,
            escrow.isDisputed,
            escrow.createdAt
        );
    }
    
    /**
     * @dev Get user's escrows
     * @param _user User address
     */
    function getUserEscrows(address _user) external view returns (uint256[] memory) {
        return userEscrows[_user];
    }
    
    /**
     * @dev Update platform fee (only owner)
     * @param _newFee New fee (in basis points, e.g., 25 = 2.5%)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 100, "Fee too high"); // Max 10%
        platformFee = _newFee;
    }
    
    /**
     * @dev Update dispute period (only owner)
     * @param _newPeriod New dispute period in seconds
     */
    function updateDisputePeriod(uint256 _newPeriod) external onlyOwner {
        require(_newPeriod >= 1 days && _newPeriod <= 30 days, "Invalid period");
        disputePeriod = _newPeriod;
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
