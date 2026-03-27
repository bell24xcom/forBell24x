const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Bell24h Smart Contracts to Polygon Mumbai Testnet...\n");

  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "MATIC");

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

    // Get contract details
    const tokenName = await bellToken.name();
    const tokenSymbol = await bellToken.symbol();
    const totalSupply = await bellToken.totalSupply();
    
    console.log("\n📋 Contract Details:");
    console.log("===================");
    console.log("Network: Polygon Mumbai Testnet");
    console.log("Deployer:", deployer.address);
    console.log("BellToken:", bellToken.address);
    console.log("BellEscrow:", bellEscrow.address);
    console.log("Token Name:", tokenName);
    console.log("Token Symbol:", tokenSymbol);
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "BELL");

    // Save deployment info
    const deploymentInfo = {
      network: "polygonMumbai",
      deployer: deployer.address,
      contracts: {
        BellToken: bellToken.address,
        BellEscrow: bellEscrow.address,
      },
      timestamp: new Date().toISOString(),
      blockExplorer: "https://mumbai.polygonscan.com",
    };

    const fs = require("fs");
    if (!fs.existsSync("deployments")) {
      fs.mkdirSync("deployments");
    }
    
    fs.writeFileSync(
      "deployments/polygonMumbai.json",
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n💾 Deployment info saved to deployments/polygonMumbai.json");
    console.log("\n🔗 View on PolygonScan:");
    console.log(`BellToken: https://mumbai.polygonscan.com/address/${bellToken.address}`);
    console.log(`BellEscrow: https://mumbai.polygonscan.com/address/${bellEscrow.address}`);
    
    console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
    console.log("\n📋 Next Steps:");
    console.log("1. Update contract addresses in frontend");
    console.log("2. Deploy frontend to Vercel");
    console.log("3. Configure environment variables");
    console.log("4. Test blockchain integration");

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
