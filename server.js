import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron"; // Import node-cron

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Define the Mongoose model
const Stock = mongoose.model("Stock", {
  symbol: String,
  price: Number,
});

// Sample stock data
const sampleStocks = [
  { symbol: "AAPL", price: getRandomPrice() },
  { symbol: "GOOGL", price: getRandomPrice() },
  { symbol: "TSLA", price: getRandomPrice() },
];

// Connect to MongoDB
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dyt5psz.mongodb.net/`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));
// Function to update stock prices
const updateStockPrices = async () => {
  const updatedStocks = sampleStocks.map((stock) => ({
    symbol: stock.symbol,
    price: getRandomPrice(),
  }));

  try {
    for (const stock of updatedStocks) {
      await Stock.findOneAndUpdate(
        { symbol: stock.symbol },
        { $set: { price: stock.price } }
      );
    }
    console.log("Stock prices updated successfully.");
  } catch (error) {
    console.error("Error updating stock prices:", error);
  }
};

// Schedule the cron job to run every minute
cron.schedule("* * * * *", updateStockPrices);

// Mock API Endpoint to update stock prices
app.get("/api/stocks", async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching stocks" });
  }
});
// Helper function to generate a random stock price
function getRandomPrice() {
  const minPrice = 50; // Minimum price
  const maxPrice = 500; // Maximum price
  return (Math.random() * (maxPrice - minPrice) + minPrice).toFixed(2);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
