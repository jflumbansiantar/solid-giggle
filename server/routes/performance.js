const express                = require('express');
const { getPerformanceData } = require('../services/performanceService');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getPerformanceData());
});

module.exports = router;
