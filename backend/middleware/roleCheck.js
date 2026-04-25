// middleware/roleCheck.js
module.exports = function roleCheck(req, res, next) {
  // Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Only Shelter Admins are allowed
  if (req.user.role !== "Shelter Admin") {
    return res.status(403).json({ message: "Forbidden: Only Shelter Admins can perform this action" });
  }
  // Assign shelter from authenticated user to request body if present
  if (req.body) {
    req.body.assignedShelter = req.user.assignedShelter;
  }
  next();
};
