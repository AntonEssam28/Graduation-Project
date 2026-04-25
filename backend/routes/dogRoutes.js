const express = require("express");
const {
  getDogs,
  getDogById,
  createDog,
  updateDog,
  deleteDog,
} = require("../controllers/dogController");
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get("/", getDogs);
router.get("/:id", getDogById);

// Protected routes
router.use(auth);
router.post("/", createDog);
router.put("/:id", updateDog);
router.delete("/:id", deleteDog);

module.exports = router;