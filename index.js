const express = require("express");
const bodyParser = require("body-parser");
const { ethers } = require("ethers");
const {
  initMoralist,
  getWalletTokens,
  getBalance,
} = require("./src/services/moralist");
const { EvmChain } = require("@moralisweb3/common-evm-utils");

const COIN_INFO = {
  ETH: {
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    symbol: "ETH",
    name: "ETHEREUM",
    logo: "",
    rpcUrl: "https://eth.drpc.org",
  },
  SEPOLIA: {
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    symbol: "SEPOLINA",
    name: "SEPOLINA Test",
    logo: "",
    rpcUrl: "https://rpc.sepolia.org",
  },
  BSC: {
    address: "0x6fE8424Af31a422e3088b4D08637E5A193279D6F",
    symbol: "BNB",
    name: "BNB",
    logo: "",
    rpcUrl: "https://bsc-dataseed1.binance.org/",
  },
};
const CHAIN = {
  ETHEREUM: 0,
  BSC: 1,
  SEPOLIA: 2,
};
const app = express();
const port = process.env.PORT || 3001;
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
(async () => {
  try {
    await initMoralist();
    console.log("init moralis successful");
  } catch (error) {
    console.log(error);
  }
  app.get("/api/get-token-holder-list/:address", async (req, res) => {
    const { address } = req.params;
    const { chain } = req.query;
    let mainChain = null;
    let coinInfo = {};
    try {
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
        default:
          break;
      }
      const provider = new ethers.JsonRpcProvider(coinInfo.rpcUrl);

      const balance = await provider.getBalance(ethers.getAddress(address));
      const formatBalance = ethers.formatEther(balance);
      console.log({ formatBalance });
      const usdPrice = await getUsdPrice(mainChain, coinInfo.address);

      const usdBalance = formatBalance * usdPrice;
      const token = {
        ...coinInfo,
        token_address: coinInfo.address,
        balance: formatBalance,
        usdBalance,
      };
      // const token = nativePrice
      console.log({ mainChain });
      let walletTokens = await getWalletTokens(address, mainChain);
      walletTokens = await Promise.all(
        walletTokens.map(async (e) => {
          const balance = calculateEquity(e.decimals, e.balance);
          const usdPrice = await getUsdPrice(mainChain, e.address);
          return {
            ...e,
            balance,
            usdPrice,
            usdBalance: usdPrice && (balance * usdPrice).toFixed(2),
          };
        })
      );
      const equity = res.json({
        data: {
          tokens: [...walletTokens, token],
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error" });
    }
  });

  /* Error handler middleware */
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });

    return;
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`app listening at http://localhost:${port}`);
  });
})();

function calculateEquity(decimals, balance) {
  const balanceNumeric = parseFloat(balance);
  const divisor = Math.pow(10, decimals);
  const equity = balanceNumeric / divisor;
  return equity;
}

const getUsdPrice = async (chain, address) => {
  let usdPrice = 0;
  try {
    const getBalance = await getBalance(mainChain, e.token_address);
    usdPrice = getBalance.usdPrice;
  } catch (error) {
    console.log(error);
  }
  return usdPrice;
};
