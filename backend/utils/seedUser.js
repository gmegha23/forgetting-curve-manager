const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/forgettingcurve")
  .then(async () => {
    const email = "priya@gmail.com";
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      const hash = await bcrypt.hash("password123", 10);
      await User.create({
        name: "Priya",
        email: email.toLowerCase().trim(),
        password: hash
      });
      console.log("✅ Seed user created: priya@gmail.com / password123");
    } else {
      console.log("👤 User already exists:", user.email);
    }
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  });

