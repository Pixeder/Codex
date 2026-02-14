const axios = require("axios");

const recipeClient = axios.create({
  baseURL: process.env.RECIPEDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.RECIPEDB_API_KEY}`,
    "Content-Type": "application/json"
  }
});

const getRecipeOfDay = async () => {
  const res = await recipeClient.get("/recipe2-api/recipe/recipeofday");
  return res.data.payload.data;
};

module.exports = { getRecipeOfDay };