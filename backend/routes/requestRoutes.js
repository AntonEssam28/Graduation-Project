const express = require("express");
const {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
} = require("../controllers/requestController");
const auth = require('../middleware/authMiddleware');
const router = express.Router();
router.use(auth);

router.route("/")
  .get(getRequests)
  .post(createRequest);

router.route("/:id")
  .get(getRequestById)
  .put(updateRequest)
  .delete(deleteRequest);

module.exports = router;
