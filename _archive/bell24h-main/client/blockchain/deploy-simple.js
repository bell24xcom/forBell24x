const { ethers } = require("hardhat");

async function main() {
  console.log("Starting simple deployment...");
  
  try {
    // Get the contract factory
    const BellToken = await ethers.getContractFactory("BellToken");
    console.log("Contract factory created");
    
    // Deploy the contract
    const bellToken = await BellToken.deploy();
    console.log("Contract deployed, waiting for deployment...");
    
    await bellToken.deployed();
    console.log("BellToken deployed to:", bellToken.address);
    
    // Test basic functionality
    const name = await bellToken.name();
    const symbol = await bellToken.symbol();
    const totalSupply = await bellToken.totalSupply();
    
    console.log("Contract details:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "BELL");
    
  } catch (error) {
    console.error("Deployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
