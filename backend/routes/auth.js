const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ✅ REGISTER - Enhanced with logging & auto-token
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("📝 Register attempt:", { name: name?.substring(0,3)+'***', email });

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    console.log("Existing user:", !!existing);

    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name: name.trim(), 
      email: cleanEmail, 
      password: hash 
    });
    console.log("👤 User created:", user._id, "Email:", user.email);

    // Generate token for auto-login
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({ 
      msg: "Registered successfully", 
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ msg: err.message });
  }
});



// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

// check user - normalize email
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    console.log("🔍 Login - Email:", cleanEmail, "User found:", !!user);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }


    // compare password
    const ok = await bcrypt.compare(password, user.password);
    console.log("Password match:", ok);
    if (!ok) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123", // fallback
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;