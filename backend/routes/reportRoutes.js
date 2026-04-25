const express = require("express");
const {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
} = require("../controllers/reportController");
const auth = require('../middleware/authMiddleware');
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();
router.use(auth);

router.route("/")
  .get(getReports)
  .post(createReport);

router.route("/:id")
  .get(getReportById)
  .put(updateReport)
  .delete(deleteReport);

module.exports = router;
