const axios = require("axios");
const ApiError = require("../utils/ApiError");

/* ----------------------------------
   Axios Client
-----------------------------------*/
const recipeClient = axios.create({
  baseURL: "https://api.foodoscope.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.RECIPDB_API_KEY}`,
  },
  timeout: 15000,
});

/* ----------------------------------
   Get Recipes Using AI Detections
-----------------------------------*/
const getRecipesFromDetections = async (detections = []) => {
  try {
    if (!detections.length) {
      throw new ApiError(400, "Detections are required");
    }

    // Convert array → "Onion,Tomato"
    const includeIngredients = detections
      .map((item) => item.trim().toLowerCase())
      .join(",");

    // console.log(includeIngredients)

    const response = await recipeClient.get(
      "/recipe2-api/recipe/recipesinfo",
      {
        params: {
          includeIngredients,
          page: 1,
          limit: 3,
        },
      }
    );
    // console.log("Hello")
    const data = response.data;

    if (!data || !data.payload || !data.payload.data) {
      throw new ApiError(500, "Invalid RecipeDB response format");
    }

    // Clean result for frontend
    const recipes = data.payload.data.map((item) => ({
      id: item.Recipe_id,
      name: item.Recipe_title,
      cuisine: item.Cuisine || "Unknown",
      image: item.image_url || null,
      ingredients:
        item.ingredients?.map((i) => i.name) || [],
      calories: item.nutrition?.calories || null,
    }));

    return recipes;

  } catch (error) {
    console.error("RecipeDB API Error:", error.message);

    if (error.response) {
      console.error("RecipeDB Response:", error.response.data);
    }

    throw new ApiError(500, "Failed to fetch recipes from RecipeDB");
  }
};

module.exports = {
  getRecipesFromDetections,
};
