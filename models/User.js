const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String },
  profile: {
    name: { type: String },
    bio: { type: String },
    phone: { type: String },
    photo: { type: String },
    isPublic: { type: Boolean, default: true },
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  token: { type: String },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
