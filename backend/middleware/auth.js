const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or inactive user' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

// Middleware to check user type
const checkUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required user type: ${allowedTypes.join(' or ')}` 
      });
    }

    next();
  };
};

// Middleware to check trading volume limits
const checkTradingVolume = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const user = await User.findById(req.user._id);
    
    if (user.tradingVolume >= user.maxTradingVolume) {
      return res.status(403).json({ 
        success: false, 
        message: 'Trading volume limit reached. Auto-trading stopped.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Trading volume check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking trading volume' 
    });
  }
};

module.exports = {
  authenticateToken,
  checkUserType,
  checkTradingVolume
};
