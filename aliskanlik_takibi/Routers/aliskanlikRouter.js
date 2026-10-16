const aliskanlikController = require('../Controllers/aliskanlikController');

const express = require('express');
const router = express.Router();

//middleware ekledik 
const authMiddleware = require("../Middlewares/checkToken");

//Alışkanlık listesini getiren route
router.get('/getAliskanlik',authMiddleware, aliskanlikController.getAliskanlik);

// Alışkanlık ekleme route 
router.post('/addAliskanlik',authMiddleware, aliskanlikController.addAliskanlik);

//Alışkanlık güncelleme route
router.put('/updateAliskanlik', authMiddleware, aliskanlikController.updateAliskanlik);

// Alışkanlık silme route
router.delete('/deleteAliskanlik',authMiddleware, aliskanlikController.deleteAliskanlik);

//Alışkanlık tamamlama fonksiyonu route
router.post("/aliskanlikBasarili",authMiddleware,aliskanlikController.aliskanlikBasarili);

// Alışkanlık tamamlamama fonksiyonu route
router.post("/aliskanlikBasarisiz",authMiddleware,aliskanlikController.aliskanlikBasarisiz);

// kullanıcı bazlı alışkanlık verileri
router.get("/getMyAliskanlik",authMiddleware,aliskanlikController.getMyAliskanlik);

//yapılan görevlerin kullanıcı bazlı takibi
router.get("/getYapilanAliskanliklar",authMiddleware,aliskanlikController.getYapilanAliskanliklar);

//yapılmayan görevlerin kullanıcı baazlı takibi
router.get("/getYapilmayanAliskanliklar",authMiddleware,aliskanlikController.getYapilmayanAliskanliklar);

module.exports = router;