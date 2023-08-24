const express = require("express");
const bodyParser = require("body-parser");
const { initMoralist } = require("./src/services/moralist");
const accountRouter = require("./src/routes/account.router");
const app = express();
const port = process.env.PORT || 3001;
const Moralis = require("moralis").default;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/api/", accountRouter);
/* Error handler middleware */
app.use((err, req, res) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});
Moralis.start({
  apiKey: "cQ1co2doXNEQNYBO0r6zgChuKvOqdm1pyBVuBT8PjXp4ouhIPh0sApc7joa3pbnN",
}).then(() => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`app listening at http://localhost:${port}`);
  });
});
