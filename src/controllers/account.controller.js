const { EvmChain } = require("@moralisweb3/common-evm-utils");
const {
  getWalletTokens,
  getTransactionByAddress,
} = require("../services/moralist");
const { CHAIN, COIN_INFO } = require("../utils/constants");
const {
  getUsdPrice,
  calculateEquity,
  formatTransactions,
} = require("../utils/helper.util");
const { ethers, BigNumber } = require("ethers");

const getTokens = async (req, res) => {
  const { address } = req.params;
  const { chain } = req.query;
  console.log({ address, chain });
  let mainChain = null;
  let coinInfo = {};
  try {
    switch (Number(chain)) {
      case CHAIN.ETHEREUM:
        mainChain = EvmChain.ETHEREUM;
        coinInfo = COIN_INFO.ETH;
        break;
      case CHAIN.BSC:
        mainChain = EvmChain.BSC;
        coinInfo = COIN_INFO.BSC;
        break;
      case CHAIN.SEPOLIA:
        mainChain = EvmChain.SEPOLIA;
        coinInfo = COIN_INFO.SEPOLIA;
        break;
      default:
        break;
    }
    const provider = new ethers.JsonRpcProvider(coinInfo.rpcUrl);

    const balance = await provider.getBalance(ethers.getAddress(address));
    const usdPrice = await getUsdPrice(coinInfo.symbol);
    // get usd balance
    const formatBalance = Number(ethers.formatEther(balance));
    const usdBalance = Number((formatBalance * usdPrice).toFixed(2));

    const token = {
      ...coinInfo,
      token_address: coinInfo.address,
      balance: Number(formatBalance.toFixed(4)),
      usdPrice,
      usdBalance,
    };
    let walletTokens = await getWalletTokens(address, mainChain);
    // eslint-disable-next-line no-undef
    walletTokens = await Promise.all(
      walletTokens.map(async (e) => {
        const balance = calculateEquity(e.decimals, e.balance);
        const usdPrice = await getUsdPrice(e.symbol);
        return {
          ...e,
          balance,
          usdPrice,
          usdBalance: Number(usdPrice && (balance * usdPrice).toFixed(2)),
        };
      })
    );
    res.json([...walletTokens, token]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error" });
  }
};
const getTransactions = async (req, res) => {
  const { address } = req.params;
  try {
    let { transactionsResult, tokenTransfersResult } =
      await getTransactionByAddress(address, EvmChain.ETHEREUM);

      transactionsResult = transactionsResult.map((item) => {
        // ethers.formatEther(e._data.value) 
      return { ...item._data, valueDecimal: Number(item.value.ether).toFixed(2)};
    });
    // transactionsResult = formatTransactions(
    //   transactionsResult,
    //   CHAIN.ETHEREUM,
    //   address
    // );
    // let bscTransactions = await getTransactionByAddress(
    //   address,
    //   EvmChain.BSC
    // );
    // bscTransactions = formatTransactions(
    //   bscTransactions.result,
    //   CHAIN.BSC,
    //   address
    // );
    res.json({ data: [...transactionsResult, ...tokenTransfersResult] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error" });
  }
};
module.exports = {
  getTokens,
  getTransactions,
};

// const provider = new ethers.JsonRpcProvider("https://eth.drpc.org");
// const abi = [
//   "function name() view returns (string)",
//   "function decimals() view returns (uint8)",
//   "function symbol() view returns (string)",
//   "function balanceOf(address a) view returns (uint)",
// ];
// const contract = new ethers.Contract("0x34a9c05b638020a07bb153bf624c8763bf8b4a86", abi, provider);
// console.log({ a: await contract.getAddress() });
// const name = await contract.name();
// const symbol = await contract.symbol();
// const balanceOf = await contract.balanceOf(address);
