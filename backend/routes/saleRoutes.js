const express = require('express');
const { getSales, createSale } = require('../controllers/saleController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth);

router.route('/')
  .get(getSales)
  .post(createSale);

module.exports = router;
