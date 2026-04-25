const express = require("express");
const {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
} = require("../controllers/donationController");
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth);

router.route("/")
  .get(getDonations)
  .post(createDonation);

router.route("/:id")
  .get(getDonationById)
  .put(updateDonation)
  .delete(deleteDonation);

module.exports = router;