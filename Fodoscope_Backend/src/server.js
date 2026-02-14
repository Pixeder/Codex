require("dotenv").config();

// require("./config/supabase.js");

const app = require("./app.js");
const connectDB = require("./config/db.js");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 FoodScope AI running on port ${PORT}`);
      console.log(`🌍 Environment : ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
