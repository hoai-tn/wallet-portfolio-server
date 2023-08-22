const TRANSACTION_TYPE = {
  SEND: 0,
  RECEIVE: 1,
};
const COIN_INFO = {
  ETH: {
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    symbol: "ETH",
    name: "ETHEREUM",
    logo: "https://token.metaswap.codefi.network/assets/nativeCurrencyLogos/ethereum.svg",
    // rpcUrl: "https://eth.drpc.org",
    rpcUrl: "https://mainnet.infura.io/v3/ec36850a52bc472fbbb2e9f1b32a0ae6",
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
module.exports = {
  TRANSACTION_TYPE,
  COIN_INFO,
  CHAIN,
};
