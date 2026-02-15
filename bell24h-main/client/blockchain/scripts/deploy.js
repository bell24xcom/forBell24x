const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Bell24h Smart Contract Deployment...");

  // Get the contract factories
  const BellToken = await ethers.getContractFactory("BellToken");
  const BellEscrow = await ethers.getContractFactory("BellEscrow");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy BellToken
  console.log("\n📝 Deploying BellToken...");
  const bellToken = await BellToken.deploy();
  await bellToken.deployed();
  console.log("✅ BellToken deployed to:", bellToken.address);

  // Deploy BellEscrow
  console.log("\n📝 Deploying BellEscrow...");
  const bellEscrow = await BellEscrow.deploy(deployer.address); // Use deployer as fee recipient
  await bellEscrow.deployed();
  console.log("✅ BellEscrow deployed to:", bellEscrow.address);

  // Verify contracts on PolygonScan
  console.log("\n🔍 Verifying contracts on PolygonScan...");
  try {
    await hre.run("verify:verify", {
      address: bellToken.address,
      constructorArguments: [],
    });
    console.log("✅ BellToken verified on PolygonScan");
  } catch (error) {
    console.log("❌ BellToken verification failed:", error.message);
  }

  try {
    await hre.run("verify:verify", {
      address: bellEscrow.address,
      constructorArguments: [deployer.address],
    });
    console.log("✅ BellEscrow verified on PolygonScan");
  } catch (error) {
    console.log("❌ BellEscrow verification failed:", error.message);
  }

  // Display deployment summary
  console.log("\n🎉 Deployment Summary:");
  console.log("====================");
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);
  console.log("BellToken:", bellToken.address);
  console.log("BellEscrow:", bellEscrow.address);
  console.log("\n📋 Next Steps:");
  console.log("1. Update contract addresses in frontend");
  console.log("2. Configure environment variables");
  console.log("3. Test contract interactions");
  console.log("4. Deploy frontend to production");

  // Save deployment info to file
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      BellToken: bellToken.address,
      BellEscrow: bellEscrow.address,
    },
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    `deployments/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\n💾 Deployment info saved to deployments/${hre.network.name}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
