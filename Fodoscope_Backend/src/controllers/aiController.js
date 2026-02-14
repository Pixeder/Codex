const ApiResponse = require("../utils/ApiResponse.js");
const { analyzeWithAI } = require("../services/aiService.js");

const analyzeFood = async (req, res) => {
  const imageUrl = req.imageUrl;

  if (!imageUrl) {
    throw new Error("Image URL missing");
  }

  // 🔥 Call Python ML Model
  const detectedObjects = await analyzeWithAI(imageUrl);

  // Consume trial
  if (req.user) {
    await req.user.consumeTrial();
  } else if (req.guest) {
    req.guest.trialsRemaining -= 1;
    req.guest.totalTrialsUsed += 1;
    await req.guest.save();
  }

  return res.status(200).json(
    new ApiResponse(200, "Image analyzed successfully", {
      imageUrl,
      totalDetections: detectedObjects.length,
      detections: detectedObjects
    })
  );
};

module.exports = { analyzeFood };