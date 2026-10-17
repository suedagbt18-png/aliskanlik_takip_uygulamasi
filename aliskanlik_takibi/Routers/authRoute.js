const authController = require("../Controllers/authController");
const authMiddleware = require ("../Middlewares/checkToken");

const express = require("express");
const { route } = require("./userRouter");

const router = express.Router();

//kullanıcı ekleme 
router.post('/register', authController.register);
//giriş yap
router.post('/login',authController.login);
//kullanıcı profilini getir
router.get('/getUserInfo',authMiddleware,authController.getUserInfo);
//ordeğe isim veriri
router.post('/ordekIsimVer', authMiddleware, authController.ordekIsimVer);

//middleware

router.get("/userRouter",authMiddleware,(req,res) => {
    res.json({mesaj:"Bu bilgi sadece token olan kullanıcıya görünür."})
})

module.exports = router;