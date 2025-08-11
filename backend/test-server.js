import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Test server is running!" });
});

// Test route with parameter
app.get("/test/:id", (req, res) => {
  res.json({ message: "Test route", id: req.params.id });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Test server is running on port ${PORT}`);
});
