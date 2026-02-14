const axios = require("axios");

const flavorClient = axios.create({
  baseURL: process.env.FLAVORDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.FLAVORDB_API_KEY}`,
    "Content-Type": "application/json"
  }
});

const getByTaste = async (taste) => {
  const res = await flavorClient.get(
    `/properties/taste-threshold?values=${taste}&page=0&size=20`
  );
  return res.data;
};

module.exports = { getByTaste };
