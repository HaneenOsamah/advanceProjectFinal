// dataR.js
const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataC');

router.post('/submit-data', dataController.submitData);
router.post('/submit-DATAFILE', dataController.submitFileData);
router.post('/api/sensor-data', dataController.submitSensorData);
router.get('/view-data', dataController.viewEnvironmentalData);


router.get('/data-by-filter', dataController.getDataByFilter);

module.exports = router;
