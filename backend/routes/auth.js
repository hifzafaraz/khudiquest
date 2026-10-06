const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('../db');

// Safe Nodemailer transporter configuration
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } catch (err) {
    console.warn("Nodemailer initialization warning:", err.message);
  }
}

// 1. REGISTER ENDPOINT: POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter both your email and password." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: true,
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
    console.error("Registration error:", err);
    res.status(500).json({ message: "Something went wrong on our end. Please try again." });
  }
});

// 2. LOGIN ENDPOINT: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter both your email and password." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "We couldn't find an account matching that email address." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password. Please retry." });
    }

    const sessionToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'khudi_quest_secure_jwt_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      message: "Welcome to your synchronized terminal!",
      token: sessionToken,
      email: user.email,
      streak: user.currentStreak || 1
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal login verification error." });
  }
});

// 3. FORGOT PASSWORD ENDPOINT: POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please enter your email address." });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "We couldn't find an account matching that email address." });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const updatedWithToken = { ...user, verificationToken: resetToken };
    await User.update({ _id: user._id }, updatedWithToken);

    // Resolve client origin dynamically so reset links work in both local and Vercel environments
    const clientBaseUrl = process.env.FRONTEND_URL || req.headers.origin || 'http://localhost:5173';
    const resetLink = `${clientBaseUrl.replace(/\/$/, '')}/?resetToken=${resetToken}`;

    if (transporter && process.env.EMAIL_USER) {
      const resetMailOptions = {
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: 'Reset Your Khudi Quest Password',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e2229;">
            <h2>Khudi Quest Password Reset</h2>
            <p>You requested to reset your password. Click the link below to set a new password:</p>
            <p style="margin: 24px 0;">
              <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Reset Password
              </a>
            </p>
            <p style="color: #6b7280; font-size: 12px;">If you did not request this, please ignore this email.</p>
          </div>
        `
      };

      transporter.sendMail(resetMailOptions, (err) => {
        if (err) console.warn("Reset email dispatch notice:", err.message);
      });
    }

    res.json({ 
      message: "Password reset link generated. Check your email or use the recovery link.",
      resetToken,
      resetLink
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Internal error during password reset." });
  }
});

// 4. CONFIRM RESET ENDPOINT: POST /api/auth/reset-password-confirm
router.post('/reset-password-confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: "Invalid or expired recovery session token link." });

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    const resetUserRecord = { ...user, password: hashedNewPassword, verificationToken: null };
    await User.update({ _id: user._id }, resetUserRecord);

    res.json({ message: "Your password has been reset successfully! You can now log in." });
  } catch (err) {
    console.error("Password reset confirmation error:", err);
    res.status(500).json({ message: "Exception error during password commit operation." });
  }
});

// 5. CHANGE PASSWORD ENDPOINT: POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: "User session verification failed." });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Your current password does not match our records." });

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    const updatedUserData = { ...user, password: hashedNewPassword };
    await User.update({ _id: user._id }, updatedUserData);

    res.json({ message: "Password updated successfully! ✨" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Internal password update error." });
  }
});

module.exports = router;
