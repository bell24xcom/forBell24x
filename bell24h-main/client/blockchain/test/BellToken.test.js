const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BellToken", function () {
  let bellToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const BellToken = await ethers.getContractFactory("BellToken");
    bellToken = await BellToken.deploy();
    await bellToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await bellToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await bellToken.balanceOf(owner.address);
      expect(await bellToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have correct name and symbol", async function () {
      expect(await bellToken.name()).to.equal("Bell24h Token");
      expect(await bellToken.symbol()).to.equal("BELL");
    });
  });

  describe("Staking", function () {
    it("Should allow staking tokens", async function () {
      const stakeAmount = ethers.utils.parseEther("1000");
      const stakeDuration = 30; // 30 days
      
      await bellToken.stake(stakeAmount, stakeDuration);
      
      const stakingInfo = await bellToken.getUserStakingInfo(owner.address);
      expect(stakingInfo.amount).to.equal(stakeAmount);
      expect(stakingInfo.isActive).to.be.true;
    });

    it("Should not allow staking if already staking", async function () {
      const stakeAmount = ethers.utils.parseEther("1000");
      const stakeDuration = 30;
      
      await bellToken.stake(stakeAmount, stakeDuration);
      
      await expect(
        bellToken.stake(stakeAmount, stakeDuration)
      ).to.be.revertedWith("Already staking");
    });
  });
});
