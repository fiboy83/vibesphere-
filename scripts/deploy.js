const hre = require("hardhat");

async function main() {
  console.log("Preparing to deploy VibespherePost contract to pharos network...");

  // We get the contract to deploy
  const VibespherePost = await hre.ethers.getContractFactory("VibespherePost");
  console.log("Deploying VibespherePost...");
  
  const vibespherePost = await VibespherePost.deploy({ gasLimit: 2000000 });

  await vibespherePost.waitForDeployment();

  const contractAddress = await vibespherePost.getAddress();

  console.log(
    `VibespherePost contract deployed successfully!`
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
