const express = require("express");
const {
  getShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter,
} = require("../controllers/shelterController");
const auth = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/permissionMiddleware');

const router = express.Router();

// Public routes
router.route("/").get(getShelters);
router.route("/:id").get(getShelterById);

// Protected routes
router.use(auth);
router.route("/").post(checkPermission('shelters'), createShelter);
router.route("/:id")
  .put(updateShelter)
  .delete(checkPermission('shelters'), deleteShelter);

module.exports = router;