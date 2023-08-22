const Moralis = require("moralis").default;
const initMoralist = async () => {
  await Moralis.start({
    apiKey: "cQ1co2doXNEQNYBO0r6zgChuKvOqdm1pyBVuBT8PjXp4ouhIPh0sApc7joa3pbnN",
  });
};

const getWalletTokens = async (address, chain) => {
  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    address,
    chain,
  });
  return response.toJSON();
};
const getBalance = async (chain, address) => {
  const response = await Moralis.EvmApi.token.getTokenPrice({
    chain,
    address,
  });
  return response.raw;
};
const getTransactionByAddress = async (address, chain) => {
  const response = await Moralis.EvmApi.transaction.getWalletTransactions({
    address,
    chain,
  });
  return response.toJSON();
};
module.exports = {
  initMoralist,
  getWalletTokens,
  getBalance,
  getTransactionByAddress,
};
