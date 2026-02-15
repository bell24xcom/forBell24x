const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("TradeEscrow Pausable Functionality", function () {
  // Test accounts
  let admin;
  let pauser;
  let nonPauser;
  let buyer;
  let seller;
  let oracle;
  
  // Contract instances
  let tradeEscrow;
  let paymentToken;
  
  // Constants and roles
  let DEFAULT_ADMIN_ROLE;
  let PAUSER_ROLE;
  
  // Test parameters
  const initialAmount = ethers.utils.parseEther("1000");
  const tradeAmount = ethers.utils.parseEther("100");
  const gstPercentage = 18; // 18% GST
  
  beforeEach(async function () {
    // Get test accounts
    [admin, pauser, nonPauser, buyer, seller, oracle] = await ethers.getSigners();
    
    // Deploy mock ERC20 token for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    paymentToken = await MockERC20.deploy("Test Token", "TEST", initialAmount);
    await paymentToken.deployed();
    
    // Fund buyer account
    await paymentToken.transfer(buyer.address, tradeAmount.mul(2));
    
    // Deploy TradeEscrow contract
    const TradeEscrow = await ethers.getContractFactory("TradeEscrow");
    tradeEscrow = await upgrades.deployProxy(TradeEscrow, [
      admin.address, // initialAdmin
      admin.address, // initialGSTAuthorityWallet
      admin.address, // initialPlatformFeeWallet
      5 // initialFeePercentage (0.5%)
    ], {
      initializer: "initialize",
      kind: "uups"
    });
    await tradeEscrow.deployed();
    
    // Get role identifiers
    DEFAULT_ADMIN_ROLE = await tradeEscrow.DEFAULT_ADMIN_ROLE();
    PAUSER_ROLE = await tradeEscrow.PAUSER_ROLE();
    
    // Grant PAUSER_ROLE to pauser account
    await tradeEscrow.connect(admin).grantRole(PAUSER_ROLE, pauser.address);
    
    // Set oracle address
    await tradeEscrow.connect(admin).setOracleAddress(oracle.address);
    
    // Create a test trade
    await tradeEscrow.connect(buyer).createTrade(
      seller.address, 
      paymentToken.address,
      tradeAmount,
      gstPercentage
    );
    
    // Get the tradeId (first trade created)
    const filter = tradeEscrow.filters.TradeCreated();
    const events = await tradeEscrow.queryFilter(filter);
    this.tradeId = events[0].args.tradeId;
    
    // Approve token transfer for funding
    await paymentToken.connect(buyer).approve(tradeEscrow.address, tradeAmount);
  });
  
  describe("Pause Authorization", function () {
    it("Should allow accounts with PAUSER_ROLE to pause", async function () {
      // Verify initial pause state is false
      expect(await tradeEscrow.paused()).to.equal(false);
      
      // Pause with authorized account
      const pauseTx = await tradeEscrow.connect(pauser).pause();
      
      // Verify pause state and event
      expect(await tradeEscrow.paused()).to.equal(true);
      await expect(pauseTx).to.emit(tradeEscrow, "Paused").withArgs(pauser.address);
    });
    
    it("Should allow accounts with PAUSER_ROLE to unpause", async function () {
      // First pause the contract
      await tradeEscrow.connect(pauser).pause();
      expect(await tradeEscrow.paused()).to.equal(true);
      
      // Unpause with authorized account
      const unpauseTx = await tradeEscrow.connect(pauser).unpause();
      
      // Verify unpause state and event
      expect(await tradeEscrow.paused()).to.equal(false);
      await expect(unpauseTx).to.emit(tradeEscrow, "Unpaused").withArgs(pauser.address);
    });
    
    it("Should not allow accounts without PAUSER_ROLE to pause", async function () {
      // Attempt to pause with unauthorized account
      await expect(
        tradeEscrow.connect(nonPauser).pause()
      ).to.be.revertedWith(
        `AccessControl: account ${nonPauser.address.toLowerCase()} is missing role ${PAUSER_ROLE}`
      );
      
      // Verify state didn't change
      expect(await tradeEscrow.paused()).to.equal(false);
    });
    
    it("Should not allow accounts without PAUSER_ROLE to unpause", async function () {
      // First pause the contract
      await tradeEscrow.connect(pauser).pause();
      
      // Attempt to unpause with unauthorized account
      await expect(
        tradeEscrow.connect(nonPauser).unpause()
      ).to.be.revertedWith(
        `AccessControl: account ${nonPauser.address.toLowerCase()} is missing role ${PAUSER_ROLE}`
      );
      
      // Verify state didn't change
      expect(await tradeEscrow.paused()).to.equal(true);
    });
    
    it("Should allow admin to grant and revoke PAUSER_ROLE", async function () {
      // Verify nonPauser doesn't have PAUSER_ROLE initially
      expect(await tradeEscrow.hasRole(PAUSER_ROLE, nonPauser.address)).to.equal(false);
      
      // Grant PAUSER_ROLE
      await tradeEscrow.connect(admin).grantRole(PAUSER_ROLE, nonPauser.address);
      expect(await tradeEscrow.hasRole(PAUSER_ROLE, nonPauser.address)).to.equal(true);
      
      // Now nonPauser should be able to pause
      await tradeEscrow.connect(nonPauser).pause();
      expect(await tradeEscrow.paused()).to.equal(true);
      
      // Revoke PAUSER_ROLE
      await tradeEscrow.connect(admin).revokeRole(PAUSER_ROLE, nonPauser.address);
      expect(await tradeEscrow.hasRole(PAUSER_ROLE, nonPauser.address)).to.equal(false);
      
      // Now nonPauser should not be able to unpause
      await expect(
        tradeEscrow.connect(nonPauser).unpause()
      ).to.be.reverted;
    });
  });
  
  describe("Function Behavior When Paused", function () {
    // Helper function to test that a function is paused
    async function expectPaused(funcPromise) {
      await expect(funcPromise).to.be.revertedWith("Pausable: paused");
    }
    
    beforeEach(async function () {
      // Pause the contract for each test in this block
      await tradeEscrow.connect(pauser).pause();
    });
    
    it("Should not allow creating trades when paused", async function () {
      await expectPaused(
        tradeEscrow.connect(buyer).createTrade(
          seller.address, 
          paymentToken.address,
          tradeAmount,
          gstPercentage
        )
      );
    });
    
    it("Should not allow funding trades when paused", async function () {
      await expectPaused(
        tradeEscrow.connect(buyer).fundTrade(this.tradeId)
      );
    });
    
    it("Should not allow confirming shipment when paused", async function () {
      await expectPaused(
        tradeEscrow.connect(seller).confirmShipment(this.tradeId, "Tracking123")
      );
    });
    
    it("Should not allow confirming delivery when paused", async function () {
      await expectPaused(
        tradeEscrow.connect(buyer).confirmDelivery(this.tradeId)
      );
    });
    
    it("Should not allow oracle confirming delivery when paused", async function () {
      await expectPaused(
        tradeEscrow.connect(oracle).oracleConfirmDelivery(this.tradeId)
      );
    });
    
    it("Should not allow releasing funds when paused", async function () {
      await expectPaused(
        tradeEscrow.connect(buyer).releaseToSeller(this.tradeId)
      );
    });
    
    it("Should not allow updating GST verification status when paused", async function () {
      await expectPaused(
        tradeEscrow.connect(oracle).updateGSTVerificationStatus(this.tradeId, true, true)
      );
    });
    
    it("Should not allow raising trade disputes when paused", async function () {
      await expectPaused(
        tradeEscrow.connect(buyer).raiseTradeDipute(this.tradeId, "Dispute reason")
      );
    });
    
    it("Should not allow resolving disputes when paused", async function () {
      // First need to add arbitrator
      await tradeEscrow.connect(admin).unpause(); // Temporarily unpause
      await tradeEscrow.connect(admin).addArbitrator(admin.address);
      await tradeEscrow.connect(pauser).pause(); // Pause again
      
      await expectPaused(
        tradeEscrow.connect(admin).resolveDispute(this.tradeId, tradeAmount, "Resolution notes")
      );
    });
    
    it("Should not allow refunding buyer when paused", async function () {
      await expectPaused(
        tradeEscrow.connect(buyer).refundBuyer(this.tradeId)
      );
    });
    
    it("Should allow read-only functions when paused", async function () {
      // These should still work when paused
      await tradeEscrow.trades(this.tradeId); // Get trade details
      await tradeEscrow.paused(); // Check paused state
      await tradeEscrow.PAUSER_ROLE(); // Get role identifier
    });
  });
  
  describe("Function Resumption After Unpause", function () {
    it("Should allow creating trades after unpausing", async function () {
      // Pause
      await tradeEscrow.connect(pauser).pause();
      
      // Verify it's paused
      expect(await tradeEscrow.paused()).to.equal(true);
      
      // Try to create a trade while paused (should fail)
      await expect(
        tradeEscrow.connect(buyer).createTrade(
          seller.address, 
          paymentToken.address,
          tradeAmount,
          gstPercentage
        )
      ).to.be.revertedWith("Pausable: paused");
      
      // Unpause
      await tradeEscrow.connect(pauser).unpause();
      
      // Verify it's unpaused
      expect(await tradeEscrow.paused()).to.equal(false);
      
      // Now should be able to create a trade
      await expect(
        tradeEscrow.connect(buyer).createTrade(
          seller.address, 
          paymentToken.address,
          tradeAmount,
          gstPercentage
        )
      ).to.not.be.reverted;
    });
    
    it("Should allow funding trades after unpausing", async function () {
      // Pause
      await tradeEscrow.connect(pauser).pause();
      
      // Verify funding fails while paused
      await expect(
        tradeEscrow.connect(buyer).fundTrade(this.tradeId)
      ).to.be.revertedWith("Pausable: paused");
      
      // Unpause
      await tradeEscrow.connect(pauser).unpause();
      
      // Now should be able to fund
      await expect(
        tradeEscrow.connect(buyer).fundTrade(this.tradeId)
      ).to.not.be.reverted;
    });
  });
  
  describe("Pause Impact on Oracle Functions", function () {
    it("Should prevent oracle from updating GST verification when paused", async function () {
      // Pause the contract
      await tradeEscrow.connect(pauser).pause();
      
      // Attempt GST verification
      await expect(
        tradeEscrow.connect(oracle).updateGSTVerificationStatus(
          this.tradeId, 
          true, // buyer verified
          true  // seller verified
        )
      ).to.be.revertedWith("Pausable: paused");
    });
    
    it("Should allow oracle to update GST verification after unpausing", async function () {
      // Pause the contract
      await tradeEscrow.connect(pauser).pause();
      
      // Unpause
      await tradeEscrow.connect(pauser).unpause();
      
      // Now GST verification should work
      await expect(
        tradeEscrow.connect(oracle).updateGSTVerificationStatus(
          this.tradeId, 
          true, // buyer verified
          true  // seller verified
        )
      ).to.not.be.reverted;
      
      // Verify status was updated
      const trade = await tradeEscrow.trades(this.tradeId);
      expect(trade.buyerGSTVerified).to.be.true;
      expect(trade.sellerGSTVerified).to.be.true;
    });
  });
});
