const express = require("express");
const router = express.Router();
const {
  getTokens,
  getTransactions,
} = require("../controllers/account.controller");

router.get("/get-token-holder-list/:address", getTokens);
router.get("/get-transactions/:address", getTransactions);

module.exports = router;
