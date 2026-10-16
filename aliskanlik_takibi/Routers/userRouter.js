const userController = require("../Controllers/userController");

const express = require("express");
const authMiddleware = require("../Middlewares/checkToken");

const router = express.Router();

// Kullanıcı listesini getiren route
router.get("/getUsers", userController.getUsers);

//Kullanıcı ekleme fonksiyonunu getiren route
router.post("/addUsers", userController.addUsers);




module.exports = router;



// authRoute ve authController oluşturuyoruz+

// addUser fonksiyonunu authController'a taşıyoruz+

// addUser --> register+

// authController üzerinde login fonksiyonunu tanımlıyoruz+

// Json Web Token (jwt) bunu kullanarak oturum açma işlemini gerçekleştiriyoruz+

// Postman üzerinden giriş yapan kullanıcıya token'ı return et...+