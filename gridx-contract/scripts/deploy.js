const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("🚀 Deploying GridX Energy Contract to", hre.network.name);

    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deploying from:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "MATIC");

    // Deploy contract
    const GridXEnergy = await hre.ethers.getContractFactory("GridXEnergy");
    const gridx = await GridXEnergy.deploy();

    await gridx.waitForDeployment();
    const contractAddress = await gridx.getAddress();

    console.log("✅ GridXEnergy deployed to:", contractAddress);

    // Save deployment info
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        blockNumber: await deployer.provider.getBlockNumber(),
    };

    fs.writeFileSync(
        "./deployment.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📋 Deployment Summary:");
    console.log("  Contract:", contractAddress);
    console.log("  Network:", hre.network.name);
    console.log("\n🔧 Update these env variables:");
    console.log(`  CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`  NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);

    // Verify on Polygonscan (if not local)
    if (hre.network.name !== "localhost") {
        console.log("\n⏳ Waiting for block confirmations...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [],
            });
            console.log("✅ Contract verified on Polygonscan!");
        } catch (e) {
            console.log("⚠️  Verification failed:", e.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
