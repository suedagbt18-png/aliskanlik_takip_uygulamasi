
const seviyeController = require('../Controllers/seviyeController');

const express = require('express');

const router =express.Router();

//seviye listesini getiren route
router.get('/getSeviye', seviyeController.getSeviye);

//seviyerleri kaydeden route 
router.post('/addSeviye',seviyeController.addSeviye);

//seviyeleri güncelleyen route
router.put('/updateSeviye',seviyeController.updateSeviye);

//seviyeleri silen route
router.delete('/deleteSeviye',seviyeController.deleteSeviye);

module.exports=router;