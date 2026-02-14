const axios = require("axios");
const ApiError = require("../utils/ApiError.js");

const MODEL_URL = process.env.ML_MODEL_URL;

/**
 * analyzeWithAI
 * Sends imageUrl to Python ML model
 * Returns array of detected object names
 */
const analyzeWithAI = async (imageUrl) => {
  try {
    if (!MODEL_URL) {
      throw new ApiError(500, "ML_MODEL_URL not configured");
    }

    // Send POST request to Python model
    const response = await axios.post(MODEL_URL, {
      image_url: imageUrl,   // make sure Python expects this field
    });

    const data = response.data;

    if (!data || !Array.isArray(data.detections)) {
      throw new ApiError(500, "Invalid response from ML model");
    }

    // Extract class names from detections
    const detectedObjects = data.detections.map(
      (item) => item.class?.name
    ).filter(Boolean);

    return detectedObjects;

  } catch (error) {
    console.error("ML Model Error:", error.message);

    if (error.response) {
      console.error("Model Response:", error.response.data);
    }

    throw new ApiError(500, "Failed to analyze image with AI model");
  }
};

module.exports = { analyzeWithAI };
