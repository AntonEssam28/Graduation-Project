const express = require('express');
const {
  getStoreItems,
  getStoreItemById,
  createStoreItem,
  updateStoreItem,
  deleteStoreItem,
} = require('../controllers/storeController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getStoreItems)
  .post(auth, createStoreItem);

router.route('/:id')
  .get(getStoreItemById)
  .put(auth, updateStoreItem)
  .delete(auth, deleteStoreItem);

module.exports = router;

