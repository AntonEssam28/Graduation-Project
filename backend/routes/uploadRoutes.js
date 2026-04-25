const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

// POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Construct the public URL for the file
    // Example: http://localhost:5000/uploads/1628172671-123456789.png
    const protocol = req.protocol;
    const host = req.get("host"); // includes port if applicable
    const filePath = `/uploads/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${filePath}`;

    res.status(200).json({ url: fullUrl, message: "File uploaded successfully" });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "File upload failed" });
  }
});

module.exports = router;
