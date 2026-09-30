const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Datastore = require('nedb-promises');
const path = require('path');

// BULLETPROOF BACKING: Initialize automatic dynamic local datastore node
const User = Datastore.create({ filename: path.join(__dirname, '../data/users.db'), autoload: true });

const transporter = nodemailer.createTransport({
  host: '://gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. REGISTER ENDPOINT: URL -> http://localhost:5000/api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter both your email and password." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists here." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: true, // Auto-verified for safe offline development tests
      currentStreak: 1,
      lastActiveDate: null,
      verificationToken: null,
      createdAt: new Date()
    };

    await User.insert(newUser);

    res.status(201).json({ 
      message: "Account created successfully! Please sign in using your password."
    });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong on our end. Please try again." });
  }
});
// 2. LOGIN ENDPOINT: URL -> http://localhost:5000/api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter both your email and password." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "We couldn't find an account matching that email address." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password configuration sequence. Please retry." });
    }

    const sessionToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: "Welcome to your synchronized terminal!",
      token: sessionToken,
      email: user.email,
      streak: user.currentStreak
    });

  } catch (err) {
    res.status(500).json({ message: "Internal login verification tracking error." });
  }
});

// 3. FORGOT PASSWORD GENERATOR ENDPOINT
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please enter your email address." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "We couldn't find an account matching that email address." });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const updatedWithToken = { ...user, verificationToken: resetToken };
    await User.update({ _id: user._id }, updatedWithToken);

    const resetLink = `http://localhost:5173/?resetToken=${resetToken}`;

    const resetMailOptions = {
      from: process.env.EMAIL_USER,
      to: email.toLowerCase(),
      subject: 'Reset Your Khudi Quest Password Key',
      html: `<p>Click the link below to safely reset your password credentials:</p><a href="${resetLink}">Reset Password Link</a>`
    };

    transporter.sendMail(resetMailOptions, (err, info) => {
      if (err) console.error("Reset mail dispatch error logs:", err.message);
    });

    res.json({ message: "We have sent password reset instructions to your real email address. Please check your inbox!" });

  } catch (err) {
    res.status(500).json({ message: "Internal error during password reset." });
  }
});

// 4. CONFIRM RESET OVERRIDE PIPELINE
router.post('/reset-password-confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: "Invalid or expired recovery session token link." });

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    const resetUserRecord = { ...user, password: hashedNewPassword, verificationToken: null };
    await User.update({ _id: user._id }, resetUserRecord);

    res.json({ message: "Your password has been reset successfully! You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Exception error during password commit operation." });
  }
});

// 5. CHANGE PASSWORD (SETTINGS PAGE)
router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User session verification failed." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Your current password does not match our records." });

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    const updatedUserData = { ...user, password: hashedNewPassword };
    await User.update({ _id: user._id }, updatedUserData);

    res.json({ message: "Password updated and encrypted successfully! ✨" });
  } catch (err) {
    res.status(500).json({ message: "Internal password update error." });
  }
});

module.exports = router;
