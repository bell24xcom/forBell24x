const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Bell24h Smart Contract Deployment...");

  try {
    // Get the contract factory
    const BellToken = await ethers.getContractFactory("BellToken");
    console.log("✅ BellToken factory created");

    // Deploy BellToken
    console.log("📝 Deploying BellToken...");
    const bellToken = await BellToken.deploy();
    await bellToken.deployed();
    console.log("✅ BellToken deployed to:", bellToken.address);

    // Get contract details
    const name = await bellToken.name();
    const symbol = await bellToken.symbol();
    const totalSupply = await bellToken.totalSupply();
    
    console.log("\n📋 Contract Details:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "BELL");

    // Save deployment info
    const deploymentInfo = {
      network: "hardhat",
      contracts: {
        BellToken: bellToken.address,
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
    console.log("\n🎉 Deployment completed successfully!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
