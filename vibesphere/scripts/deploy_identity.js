const hre = require("hardhat");

async function main() {
  console.log("Preparing to deploy VibesphereIdentity contract to pharos network...");

  const VibesphereIdentity = await hre.ethers.getContractFactory("VibesphereIdentity");
  console.log("Deploying VibesphereIdentity...");
  
  const vibesphereIdentity = await VibesphereIdentity.deploy();

  await vibesphereIdentity.waitForDeployment();

  const contractAddress = await vibesphereIdentity.getAddress();

  console.log(
    `VibesphereIdentity contract deployed successfully!`
  );
  console.log(
    `Contract is live on pharos at address: ${contractAddress}`
  );
  console.log("\nIMPORTANT: Copy this address and paste it into 'src/constants/contracts.ts'");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
