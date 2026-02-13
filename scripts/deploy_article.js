const hre = require("hardhat");

async function main() {
  console.log("Preparing to deploy VibesphereArticle contract to pharos network...");

  // We get the contract to deploy
  const VibesphereArticle = await hre.ethers.getContractFactory("VibesphereArticle");
  console.log("Deploying VibesphereArticle...");
  
  const vibesphereArticle = await VibesphereArticle.deploy();

  await vibesphereArticle.waitForDeployment();

  const contractAddress = await vibesphereArticle.getAddress();

  console.log(
    `VibesphereArticle contract deployed successfully!`
  );
  console.log(
    `Contract is live on pharos at address: ${contractAddress}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
