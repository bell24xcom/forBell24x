const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Testing Bell24h Smart Contracts Deployment...\n");

  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");

    // Deploy BellToken
    console.log("\n📝 Deploying BellToken...");
    const BellToken = await ethers.getContractFactory("BellToken");
    const bellToken = await BellToken.deploy();
    await bellToken.deployed();
    console.log("✅ BellToken deployed to:", bellToken.address);

    // Deploy BellEscrow
    console.log("\n📝 Deploying BellEscrow...");
    const BellEscrow = await ethers.getContractFactory("BellEscrow");
    const bellEscrow = await BellEscrow.deploy(deployer.address);
    await bellEscrow.deployed();
    console.log("✅ BellEscrow deployed to:", bellEscrow.address);

    // Test basic functionality
    const tokenName = await bellToken.name();
    const tokenSymbol = await bellToken.symbol();
    const totalSupply = await bellToken.totalSupply();
    
    console.log("\n📋 Contract Details:");
    console.log("===================");
    console.log("Network: Hardhat Local");
    console.log("Deployer:", deployer.address);
    console.log("BellToken:", bellToken.address);
    console.log("BellEscrow:", bellEscrow.address);
    console.log("Token Name:", tokenName);
    console.log("Token Symbol:", tokenSymbol);
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "BELL");

    // Save deployment info
    const deploymentInfo = {
      network: "hardhat",
      deployer: deployer.address,
      contracts: {
        BellToken: bellToken.address,
        BellEscrow: bellEscrow.address,
      },
      timestamp: new Date().toISOString(),
    };

    const fs = require("fs");
    if (!fs.existsSync("deployments")) {
      fs.mkdirSync("deployments");
    }
    
    fs.writeFileSync(
      "deployments/hardhat.json",
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n💾 Deployment info saved to deployments/hardhat.json");
    console.log("\n🎉 LOCAL DEPLOYMENT SUCCESSFUL!");
    console.log("\n📋 Smart contracts are ready for production deployment!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
