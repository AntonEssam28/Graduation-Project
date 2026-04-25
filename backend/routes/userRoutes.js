const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const auth = require('../middleware/authMiddleware');
const checkPermission = require('../middleware/permissionMiddleware');

const router = express.Router();
router.use(auth);

router.route("/")
  .get(checkPermission('users'), getUsers)
  .post(checkPermission('users'), createUser);

router.route("/:id")
  .get(checkPermission('users'), getUserById)
  .put(checkPermission('users'), updateUser)
  .delete(checkPermission('users'), deleteUser);

module.exports = router;