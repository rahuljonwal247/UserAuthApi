// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const dotenv = require('dotenv');

// dotenv.config();

// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     req.user = { userId: user._id, role: user.role };
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }
// };

// module.exports = authMiddleware;

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization token format' });
    }

    const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = { userId: user._id, role: user.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Authorization token expired' });
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authMiddleware;

