require("dotenv").config();
const express = require("express");
const db = require("./Database/db");
const cors = require("cors");
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(bodyParser.json())

const PORT = 3000;

app.use(
  cors()
);

app.listen(PORT, () => {
  console.log("Sunucu 3000 portunda çalışıyor.");
});

app.get("/", (req, res) => {
  res.send("NodeJS Başarılı bir şekilde çalışıyor.");
});


const authRoute = require("./Routers/authRoute");

const seviyeRoute = require("./Routers/seviyeRouter");

const gorevRoute = require("./Routers/gorevRouter");

const aliskanlikRoute = require("./Routers/aliskanlikRouter");

const ciftlikRoute = require("./Routers/ciftlikRouter");

app.use("/", authRoute, seviyeRoute, gorevRoute, aliskanlikRoute, ciftlikRoute);
