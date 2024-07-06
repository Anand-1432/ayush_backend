const express = require("express");
const multer = require("multer");
const router = express.Router();

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    res.json({
      success: true,
      message: "File uploaded successfully",
      path: req.file.path,
    });
  } else {
    res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }
});

module.exports = router;
