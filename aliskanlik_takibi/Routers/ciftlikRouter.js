const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middlewares/checkToken");
const ciftlikController = require("../Controllers/ciftlikController");

// Yetişkin ördeği çiftliğe gönder
router.post("/ciftligeGonder", authMiddleware, ciftlikController.ciftligeGonderIstegi);

// Çiftlikteki ördekleri listele
router.get("/ciftlik", authMiddleware, ciftlikController.ciftlikGetir);

module.exports = router;
