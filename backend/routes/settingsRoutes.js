const express = require('express');
const { getSettings, updateSettings, resetSettings } = require('../controllers/settingsController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.use(auth);

router.route('/')
  .get(getSettings)
  .put(updateSettings);

router.post('/reset', resetSettings);

module.exports = router;
