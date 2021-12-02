const Lottery = artifacts.require("Lottery");

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(Lottery, { from: accounts[2] });
};
