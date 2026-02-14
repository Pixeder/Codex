const ApiResponse = require("../utils/ApiResponse");
const { analyzeWithAI } = require("../services/aiService");
const { getRecipesFromDetections } = require("../services/reciepeService");
const { rankRecipesByFlavorPairing} = require("../services/flavorService.js")

const analyzeFood = async (req, res) => {
  const imageUrl = req.imageUrl;

  if (!imageUrl) {
    throw new Error("Image URL missing");
  }

  // Call Python model
  const aiResult = await analyzeWithAI(imageUrl);

  // Consume trial
  if (req.user) {
    await req.user.consumeTrial();
  } else if (req.guest) {
    req.guest.trialsRemaining -= 1;
    req.guest.totalTrialsUsed += 1;
    await req.guest.save();
  }

  // console.log(aiResult)

  const response = await getRecipesFromDetections(aiResult.detections);

  const rankedRecipes = await rankRecipesByFlavorPairing(aiResult.detections, response);

  console.log(response)
  return res.status(200).json(
    new ApiResponse(200, "Image analyzed successfully", {
      detectedIngredients: aiResult.detections,
      pairingBasedRecipes: rankedRecipes.slice(0, 3),
    })
  );
};

module.exports = { analyzeFood };