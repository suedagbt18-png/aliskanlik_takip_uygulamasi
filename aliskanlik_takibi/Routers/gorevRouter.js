const gorevController = require("../Controllers/gorevController");

const express = require("express");
const router = express.Router();

// middleware ekledik
const authMiddleware = require("../Middlewares/checkToken");

// Gorev listesini getiren route
router.get("/getGorev", authMiddleware, gorevController.getGorev);

//Gorev ekleme fonksiyonu
router.post("/addGorev", authMiddleware, gorevController.addGorev);

//Gorev güncelleme fonksiyonu
router.put("/updateGorev", authMiddleware, gorevController.updateGorev);

//Gorev silme fonksiyonu
router.delete("/deleteGorev", authMiddleware, gorevController.deleteGorev);

// tamamlanan görevler için kullanılacak fonksiyon
router.post("/gorevBasarili", authMiddleware, gorevController.gorevBasarili);

//tamamlanMAyan görevler için kullanılcak fonksiyon
router.post("/gorevBasarisiz", authMiddleware, gorevController.gorevBasarisiz);

//gorevler tablosundan kullanıcı bazlı veriler
router.get("/getMyGorev", authMiddleware, gorevController.getMyGorev);

// kullanıcı bazında görev takiplerin listelenmesi yapılan görevler
router.get(
  "/getYapilanGorevler",
  authMiddleware,
  gorevController.getYapilanGorevler
);

//kullanıcı bazında görev takiplerin listelenmesi yapılmayan görevler
router.get(
  "/getYapilmayanGorevler",
  authMiddleware,
  gorevController.getYapilmayanGorevler
);

module.exports = router;
