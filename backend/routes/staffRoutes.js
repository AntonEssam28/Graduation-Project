const express = require('express');
const { 
  getStaff, 
  createStaff, 
  updateStaff, 
  deleteStaff 
} = require('../controllers/staffController');
const auth = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.route('/')
  .get(auth, getStaff)
  .post(auth, roleCheck, createStaff);

router.route('/:id')
  .put(auth, roleCheck, updateStaff)
  .delete(auth, roleCheck, deleteStaff);

module.exports = router;
