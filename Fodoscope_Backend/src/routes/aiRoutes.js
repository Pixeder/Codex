const express = require("express");
const aiRouter = express.Router();

const {
  upload,
  uploadToCloudinary,
} = require("../middleware/uploadMiddleware.js");

const aiController = require("../controllers/aiController.js");

aiRouter.post(
  "/analyze",
  upload.single("image"),   // field name: image
  uploadToCloudinary,       // cloud upload
  aiController.analyzeFood  // use req.imageUrl
);

module.exports = aiRouter;
