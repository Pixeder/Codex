const axios = require("axios");
const FormData = require("form-data");
const ApiError = require("../utils/ApiError");

const MODEL_URL = process.env.ML_MODEL_URL;

/**
 * Send imageUrl to Python ML model
 * Return array of detected class names
 */
const analyzeWithAI = async (imageUrl) => {
  try {
    if (!MODEL_URL) {
      throw new ApiError(500, "ML_MODEL_URL not configured");
    }

    // Send as form-data (for FastAPI)
    const formData = new FormData();
    formData.append("image_url", imageUrl);

    const response = await axios.post(MODEL_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 20000,
    });

    const data = response.data;

    // Validate response
    if (!data || !Array.isArray(data.detections)) {
      console.error("Invalid Model Response:", data);
      throw new ApiError(500, "Invalid response from ML model");
    }

    // Extract class names
    const detectedObjects = data.detections
      .map((item) => item.class)
      .filter(Boolean);

    return {
      imageSource: data.image_source,
      totalDetections: data.total_detections,
      detections: detectedObjects,
    };

  } catch (error) {
    console.error("ML Model Error:", error.message);

    if (error.response) {
      console.error("Model Response:", error.response.data);
    }

    throw new ApiError(500, "Failed to analyze image with AI model");
  }
};

module.exports = { analyzeWithAI };
