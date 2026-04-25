const express = require('express');
const { register, login, changePassword, forgotPassword, verifyResetCode, resetPassword } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', auth, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;
