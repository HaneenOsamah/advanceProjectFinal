const express = require('express');
const router = express.Router();
const repoController = require('../controllers/reportsC');

router.post('/submit-environmental-report', repoController.submitEnvironmentalReport);
router.get('/view-reports', repoController.viewReports);

module.exports = router;
