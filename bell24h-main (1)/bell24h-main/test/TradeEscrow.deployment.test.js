const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("TradeEscrow Deployment", function () {
  let admin, gstWallet, feeWallet, oracle, pauser;
  let tradeEscrow;
  let DEFAULT_ADMIN_ROLE, ORACLE_ROLE, PAUSER_ROLE;
  
  const feePercentage = 5; // 0.5%
  
  beforeEach(async function () {
    // Get signers
    [admin, gstWallet, feeWallet, oracle, pauser] = await ethers.getSigners();
    
    // Deploy the contract
    const TradeEscrow = await ethers.getContractFactory("TradeEscrow");
    tradeEscrow = await upgrades.deployProxy(TradeEscrow, [
      admin.address,
      gstWallet.address,
      feeWallet.address,
      feePercentage
    ], {
      initializer: "initialize",
      kind: "uups"
    });
    await tradeEscrow.deployed();
    
    // Get role hashes
    DEFAULT_ADMIN_ROLE = await tradeEscrow.DEFAULT_ADMIN_ROLE();
    ORACLE_ROLE = await tradeEscrow.ORACLE_ROLE();
    PAUSER_ROLE = await tradeEscrow.PAUSER_ROLE();
  });
  
  describe("Role Setup", function () {
    it("Should set deployer as DEFAULT_ADMIN_ROLE", async function () {
      expect(await tradeEscrow.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });
    
    it("Should NOT set other accounts as DEFAULT_ADMIN_ROLE", async function () {
      expect(await tradeEscrow.hasRole(DEFAULT_ADMIN_ROLE, oracle.address)).to.be.false;
      expect(await tradeEscrow.hasRole(DEFAULT_ADMIN_ROLE, pauser.address)).to.be.false;
    });
    
    it("Should allow admin to grant PAUSER_ROLE", async function () {
      await tradeEscrow.connect(admin).grantRole(PAUSER_ROLE, pauser.address);
      expect(await tradeEscrow.hasRole(PAUSER_ROLE, pauser.address)).to.be.true;
    });
    
    it("Should allow admin to grant ORACLE_ROLE", async function () {
      await tradeEscrow.connect(admin).grantRole(ORACLE_ROLE, oracle.address);
      expect(await tradeEscrow.hasRole(ORACLE_ROLE, oracle.address)).to.be.true;
    });
    
    it("Should not allow non-admin to grant roles", async function () {
      await expect(
        tradeEscrow.connect(pauser).grantRole(ORACLE_ROLE, oracle.address)
      ).to.be.reverted;
    });
  });
  
  describe("Pauser Role Functionality", function () {
    beforeEach(async function () {
      // Grant PAUSER_ROLE to pauser account
      await tradeEscrow.connect(admin).grantRole(PAUSER_ROLE, pauser.address);
    });
    
    it("Should allow account with PAUSER_ROLE to pause", async function () {
      await tradeEscrow.connect(pauser).pause();
      expect(await tradeEscrow.paused()).to.be.true;
    });
    
    it("Should allow account with PAUSER_ROLE to unpause", async function () {
      await tradeEscrow.connect(pauser).pause();
      await tradeEscrow.connect(pauser).unpause();
      expect(await tradeEscrow.paused()).to.be.false;
    });
    
    it("Should allow admin to revoke PAUSER_ROLE", async function () {
      await tradeEscrow.connect(admin).revokeRole(PAUSER_ROLE, pauser.address);
      expect(await tradeEscrow.hasRole(PAUSER_ROLE, pauser.address)).to.be.false;
      
      // Should no longer be able to pause
      await expect(
        tradeEscrow.connect(pauser).pause()
      ).to.be.reverted;
    });
  });
  
  describe("Initial Pause State", function () {
    it("Should deploy in unpaused state", async function () {
      expect(await tradeEscrow.paused()).to.be.false;
    });
  });
  
  describe("Multiple Pausers", function () {
    let secondPauser;
    
    beforeEach(async function () {
      [,,,,, secondPauser] = await ethers.getSigners();
      
      // Grant PAUSER_ROLE to both pauser accounts
      await tradeEscrow.connect(admin).grantRole(PAUSER_ROLE, pauser.address);
      await tradeEscrow.connect(admin).grantRole(PAUSER_ROLE, secondPauser.address);
    });
    
    it("Should allow multiple accounts with PAUSER_ROLE to control pause state", async function () {
      // First pauser pauses
      await tradeEscrow.connect(pauser).pause();
      expect(await tradeEscrow.paused()).to.be.true;
      
      // Second pauser unpauses
      await tradeEscrow.connect(secondPauser).unpause();
      expect(await tradeEscrow.paused()).to.be.false;
      
      // Second pauser pauses again
      await tradeEscrow.connect(secondPauser).pause();
      expect(await tradeEscrow.paused()).to.be.true;
      
      // First pauser unpauses again
      await tradeEscrow.connect(pauser).unpause();
      expect(await tradeEscrow.paused()).to.be.false;
    });
  });
  
  describe("Oracle as Pauser", function () {
    beforeEach(async function () {
      // Set oracle address and grant ORACLE_ROLE
      await tradeEscrow.connect(admin).setOracleAddress(oracle.address);
      
      // Also grant PAUSER_ROLE to oracle
      await tradeEscrow.connect(admin).grantRole(PAUSER_ROLE, oracle.address);
    });
    
    it("Should allow oracle to pause the contract", async function () {
      await tradeEscrow.connect(oracle).pause();
      expect(await tradeEscrow.paused()).to.be.true;
    });
    
    it("Oracle pausing should emit correct event", async function () {
      await expect(tradeEscrow.connect(oracle).pause())
        .to.emit(tradeEscrow, "Paused")
        .withArgs(oracle.address);
    });
  });
});
