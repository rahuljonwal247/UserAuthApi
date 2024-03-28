const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); 
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${Date.now()}${extension}`); // Generate unique filename
  },
});

const upload = multer({ storage });

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    console.log('Decoded user:', req.user);
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    

    res.json({ user: user.profile, role: req.user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
// router.put('/profile', authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const { name, bio, phone, photo, email, password, isPublic } = req.body;
//     user.profile.name = name || user.profile.name;
//     user.profile.bio = bio || user.profile.bio;
//     user.profile.phone = phone || user.profile.phone;
//     user.profile.photo = photo || user.profile.photo;
//     user.profile.isPublic = isPublic === undefined ? user.profile.isPublic : isPublic;
//     user.email = email || user.email;

//     // Update password if provided
//     if (password) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user.password = hashedPassword;
//     }
router.put('/profile', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, bio, phone, email, password, photo, isPublic } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user details
    user.profile.name = name || user.profile.name;
    user.profile.bio = bio || user.profile.bio;
    user.profile.phone = phone || user.profile.phone;
    user.email = email || user.email;

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Update profile photo based on input
    if (req.file) {
      // Photo uploaded using Multer
      const photoPath = req.file.path;
      user.profile.photo = photoPath;
    } else if (photo) {
      // Use provided image URL
      user.profile.photo = photo;
    }

    // Update profile visibility
    user.profile.isPublic = isPublic; // isPublic should be a boolean (true or false)

    
    await user.save();
    res.json({ message: 'Profile updated successfully', user: user.profile, role: req.user.role  });

    // res.json({ user: user.profile, role: req.user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get list of users based on role
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const users = await User.find().select('profile');
      res.json(users);
    } else {
      const users = await User.find({ 'profile.isPublic': true }).select('profile');
      res.json(users);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
