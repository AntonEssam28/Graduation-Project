const express = require("express");
const {
  getSupplies,
  getSupplyById,
  createSupply,
  updateSupply,
  deleteSupply,
} = require("../controllers/supplyController");
const auth = require('../middleware/authMiddleware');

const router = express.Router();
router.use(auth);

router.route("/")
  .get(getSupplies)
  .post(createSupply);

router.route("/:id")
  .get(getSupplyById)
  .put(updateSupply)
  .delete(deleteSupply);

module.exports = router;
