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
    let transactions = [];
    let { transactionsResult, tokenTransfersResult } =
      await getTransactionByAddress(address, EvmChain.ETHEREUM);
    transactions = transactionsResult.map((item) => {

      return {
        ...item,
        value_decimal: Number(ethers.formatEther(item.value)),
        gas: Number(item.receipt_gas_used),
      };
    });
    tokenTransfersResult.forEach((tokenTransfer) => {
      const findHashByIndex = transactions.findIndex(
        (e) => e.hash === tokenTransfer.transaction_hash
      );
      if (findHashByIndex > 0) {
        transactions[findHashByIndex] = {
          ...transactions[findHashByIndex],
          token_name: tokenTransfer.token_name,
          token_symbol: tokenTransfer.token_symbol,
          token_logo: tokenTransfer.token_logo,
          value_decimal: tokenTransfer.value_decimal,
        };
      } else {
        transactions.push(tokenTransfer);
      }
      // transactions.forEach((transaction) => {
      //   if (tokenTransfer.transaction_hash === transaction.hash) {
      //   }
      // });
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
    res.json({ data: [...transactions], tokenTransfersResult });
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
