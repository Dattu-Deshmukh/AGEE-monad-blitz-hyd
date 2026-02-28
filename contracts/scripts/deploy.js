const hre = require("hardhat");

async function main() {
    console.log("Deploying AGEEMulticall to Monad...");

    const Multicall = await hre.ethers.getContractFactory("AGEEMulticall");
    const multicall = await Multicall.deploy();

    await multicall.waitForDeployment();

    console.log(`AGEEMulticall deployed to: ${await multicall.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
