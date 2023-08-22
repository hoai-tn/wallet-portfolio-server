const express = require("express");
const bodyParser = require("body-parser");
const { initMoralist } = require("./src/services/moralist");
const accountRouter = require("./src/routes/account.router");
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
  app.use("/api/", accountRouter);
  /* Error handler middleware */
  app.use((err, req, res) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`app listening at http://localhost:${port}`);
  });
})();
