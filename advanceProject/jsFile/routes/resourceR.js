const express = require('express');
const router = express.Router();
const resourController = require('../controllers/resourceC');


router.post('/add-resource', resourController.addResource);
router.get('/get-resources', resourController.getEducationalResources);

module.exports = router;