const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockControllers');

router.get('/stocks', stockController.listStocks);
router.get('/stocks/:ticker', stockController.getPriceHistory);

module.exports = router;
