const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");

/* ---------------------------
   Multer Memory Storage
----------------------------*/
const storage = multer.memoryStorage();

/* ---------------------------
   File Filter (Images Only)
----------------------------*/
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new ApiError(400, "Only image files are allowed"), false);
  } else {
    cb(null, true);
  }
};

/* ---------------------------
   Multer Instance
----------------------------*/
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/* ---------------------------
   Upload to Cloudinary
----------------------------*/
const uploadToCloudinary = (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, "Please upload an image"));
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: "foodscope",
      resource_type: "image",
    },
    (error, result) => {
      if (error) {
        console.error("Cloudinary Error:", error);
        return next(new ApiError(500, "Image upload failed"));
      }

      // Attach URL for next middleware/controller
      req.imageUrl = result.secure_url;
      req.imagePublicId = result.public_id;

      next();
    }
  );

  // Convert buffer to stream
  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
};

module.exports = {
  upload,
  uploadToCloudinary,
};
