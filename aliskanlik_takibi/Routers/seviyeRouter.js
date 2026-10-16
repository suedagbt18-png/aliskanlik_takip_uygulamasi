
const seviyeController = require('../Controllers/seviyeController');

const express = require('express');

const router =express.Router();

//seviye listesini getiren route
router.get('/getSeviye', seviyeController.getSeviye);

module.exports=router;