// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BellToken
 * @dev BELL utility token for Bell24h platform
 * @author Bell24h Team
 */
contract BellToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    
    // Events
    event TokensStaked(address indexed user, uint256 amount, uint256 duration);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardsClaimed(address indexed user, uint256 amount);
    event LiquidityMiningStarted(uint256 totalRewards, uint256 duration);
    event LiquidityMiningEnded();
    
    // Structs
    struct StakingInfo {
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        uint256 lastClaimTime;
        bool isActive;
    }
    
    struct LiquidityMining {
        uint256 totalRewards;
        uint256 startTime;
        uint256 duration;
        uint256 distributedRewards;
        bool isActive;
        mapping(address => uint256) userStakes;
        mapping(address => uint256) userRewards;
    }
    
    // State variables
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant STAKING_REWARD_RATE = 10; // 10% APY
    uint256 public constant LIQUIDITY_MINING_RATE = 5; // 5% APY
    
    mapping(address => StakingInfo) public stakingInfo;
    mapping(address => uint256) public stakingRewards;
    mapping(address => uint256) public liquidityRewards;
    
    LiquidityMining public liquidityMining;
    
    uint256 public totalStaked;
    uint256 public stakingRewardPool;
    uint256 public liquidityRewardPool;
    
    // Modifiers
    modifier stakingActive() {
        require(stakingInfo[msg.sender].isActive, "No active staking");
        _;
    }
    
    modifier liquidityMiningActive() {
        require(liquidityMining.isActive, "Liquidity mining not active");
        _;
    }
    
    // Constructor
    constructor() ERC20("Bell24h Token", "BELL") {
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    /**
     * @dev Stake tokens for rewards
     * @param _amount Amount to stake
     * @param _duration Staking duration in days
     */
    function stake(uint256 _amount, uint256 _duration) external whenNotPaused nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(_duration >= 30 && _duration <= 365, "Invalid duration");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(!stakingInfo[msg.sender].isActive, "Already staking");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), _amount);
        
        // Update staking info
        stakingInfo[msg.sender] = StakingInfo({
            amount: _amount,
            startTime: block.timestamp,
            duration: _duration * 1 days,
            lastClaimTime: block.timestamp,
            isActive: true
        });
        
        totalStaked += _amount;
        
        emit TokensStaked(msg.sender, _amount, _duration);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     */
    function unstake() external stakingActive whenNotPaused nonReentrant {
        StakingInfo storage info = stakingInfo[msg.sender];
        require(
            block.timestamp >= info.startTime + info.duration,
            "Staking period not completed"
        );
        
        uint256 stakedAmount = info.amount;
        uint256 reward = calculateStakingReward(msg.sender);
        
        // Update state
        info.isActive = false;
        totalStaked -= stakedAmount;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, stakedAmount);
        
        // Transfer rewards
        if (reward > 0) {
            _mint(msg.sender, reward);
        }
        
        emit TokensUnstaked(msg.sender, stakedAmount, reward);
    }
    
    /**
     * @dev Claim staking rewards without unstaking
     */
    function claimStakingRewards() external stakingActive whenNotPaused nonReentrant {
        uint256 reward = calculateStakingReward(msg.sender);
        require(reward > 0, "No rewards to claim");
        
        stakingInfo[msg.sender].lastClaimTime = block.timestamp;
        stakingRewards[msg.sender] += reward;
        
        _mint(msg.sender, reward);
        
        emit RewardsClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Start liquidity mining program
     * @param _totalRewards Total rewards to distribute
     * @param _duration Duration in days
     */
    function startLiquidityMining(
        uint256 _totalRewards,
        uint256 _duration
    ) external onlyOwner whenNotPaused {
        require(!liquidityMining.isActive, "Liquidity mining already active");
        require(_totalRewards > 0, "Invalid rewards amount");
        require(_duration > 0, "Invalid duration");
        
        liquidityMining.totalRewards = _totalRewards;
        liquidityMining.startTime = block.timestamp;
        liquidityMining.duration = _duration * 1 days;
        liquidityMining.isActive = true;
        
        emit LiquidityMiningStarted(_totalRewards, _duration);
    }
    
    /**
     * @dev End liquidity mining program
     */
    function endLiquidityMining() external onlyOwner {
        require(liquidityMining.isActive, "Liquidity mining not active");
        
        liquidityMining.isActive = false;
        
        emit LiquidityMiningEnded();
    }
    
    /**
     * @dev Add liquidity for mining rewards
     * @param _amount Amount to add
     */
    function addLiquidity(uint256 _amount) external liquidityMiningActive whenNotPaused nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), _amount);
        
        // Update liquidity mining info
        liquidityMining.userStakes[msg.sender] += _amount;
    }
    
    /**
     * @dev Remove liquidity and claim rewards
     * @param _amount Amount to remove
     */
    function removeLiquidity(uint256 _amount) external liquidityMiningActive whenNotPaused nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(liquidityMining.userStakes[msg.sender] >= _amount, "Insufficient liquidity");
        
        // Calculate rewards
        uint256 reward = calculateLiquidityReward(msg.sender);
        
        // Update state
        liquidityMining.userStakes[msg.sender] -= _amount;
        liquidityMining.userRewards[msg.sender] += reward;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, _amount);
        
        // Transfer rewards
        if (reward > 0) {
            _mint(msg.sender, reward);
        }
        
        emit RewardsClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Calculate staking rewards for a user
     * @param _user User address
     */
    function calculateStakingReward(address _user) public view returns (uint256) {
        StakingInfo memory info = stakingInfo[_user];
        if (!info.isActive) return 0;
        
        uint256 timeElapsed = block.timestamp - info.lastClaimTime;
        uint256 annualReward = (info.amount * STAKING_REWARD_RATE) / 100;
        uint256 reward = (annualReward * timeElapsed) / 365 days;
        
        return reward;
    }
    
    /**
     * @dev Calculate liquidity mining rewards for a user
     * @param _user User address
     */
    function calculateLiquidityReward(address _user) public view returns (uint256) {
        if (!liquidityMining.isActive) return 0;
        
        uint256 userStake = liquidityMining.userStakes[_user];
        if (userStake == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - liquidityMining.startTime;
        uint256 totalTime = liquidityMining.duration;
        
        if (timeElapsed > totalTime) {
            timeElapsed = totalTime;
        }
        
        uint256 totalStakes = 0;
        // Note: In a real implementation, you'd need to track total stakes
        // This is simplified for demonstration
        
        if (totalStakes == 0) return 0;
        
        uint256 userShare = (userStake * 1e18) / totalStakes;
        uint256 totalRewards = liquidityMining.totalRewards;
        uint256 timeShare = (timeElapsed * 1e18) / totalTime;
        
        uint256 reward = (totalRewards * userShare * timeShare) / (1e18 * 1e18);
        
        return reward;
    }
    
    /**
     * @dev Get user's staking info
     * @param _user User address
     */
    function getUserStakingInfo(address _user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 duration,
        uint256 lastClaimTime,
        bool isActive,
        uint256 pendingRewards
    ) {
        StakingInfo memory info = stakingInfo[_user];
        return (
            info.amount,
            info.startTime,
            info.duration,
            info.lastClaimTime,
            info.isActive,
            calculateStakingReward(_user)
        );
    }
    
    /**
     * @dev Get user's liquidity mining info
     * @param _user User address
     */
    function getUserLiquidityInfo(address _user) external view returns (
        uint256 userStake,
        uint256 pendingRewards,
        bool isActive
    ) {
        return (
            liquidityMining.userStakes[_user],
            calculateLiquidityReward(_user),
            liquidityMining.isActive
        );
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override _beforeTokenTransfer to handle pausing
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = balanceOf(address(this));
        _transfer(address(this), owner(), balance);
    }
}
