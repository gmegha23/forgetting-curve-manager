const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const topicRoutes = require("./routes/topic");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

app.use("/api/topics", topicRoutes);
app.use("/api/ai", aiRoutes);


// test route (IMPORTANT)
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// mongodb connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB error:", err.message);
  });

// server start (THIS WAS THE ISSUE)
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
