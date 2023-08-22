const { default: axios } = require("axios");
const { TRANSACTION_TYPE } = require("./constants");

const formatTransactions = (transactions, chain, address) => {
  return transactions.map(
    ({
      value,
      from_address,
      from_address_label,
      to_address,
      to_address_label,
      receipt_gas_used,
      block_timestamp,
    }) => {
      const type =
        from_address === address
          ? TRANSACTION_TYPE.SEND
          : TRANSACTION_TYPE.RECEIVE;
      return {
        value,
        from_address,
        from_address_label,
        to_address,
        to_address_label,
        receipt_gas_used,
        type,
        chain,
        block_timestamp,
      };
    }
  );
};
function calculateEquity(decimals, balance) {
  const balanceNumeric = parseFloat(balance);
  const divisor = Math.pow(10, decimals);
  const equity = balanceNumeric / divisor;
  return equity;
}

const getUsdPrice = async (symbol) => {
  let usdPrice = 0;
  try {
    const { data } = await axios.get(
      `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD&api_key=11fb98d6d1372afc7ed071433281aa990bb58e8c8fb99d910cf62f93eecf79e1`
    );
    usdPrice = data.USD;
  } catch (error) {
    console.log(error);
  }
  return usdPrice || 0;
};

module.exports = {
  formatTransactions,
  calculateEquity,
  getUsdPrice,
};
