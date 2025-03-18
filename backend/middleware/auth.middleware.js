const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  try {
    console.log('Auth middleware running');
    
    // Temporary bypass for testing (REMOVE IN PRODUCTION)
    if (req.headers['x-bypass-auth-user-id']) {
      console.log('Using bypass user ID for testing:', req.headers['x-bypass-auth-user-id']);
      
      // Validate that it's a proper MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(req.headers['x-bypass-auth-user-id'])) {
        return res.status(400).json({ error: 'Invalid user ID format in bypass header' });
      }
      
      req.user = {
        id: req.headers['x-bypass-auth-user-id'],
        email: 'test@example.com'
      };
      return next();
    }
    
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.error('No Authorization header found');
      return res.status(401).json({ error: 'No auth token, authorization denied' });
    }
    
    // Format should be "Bearer [token]"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.error('Token format is incorrect');
      return res.status(401).json({ error: 'Token format is invalid' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, full decoded payload:', decoded);
    console.log('Decoded properties:', Object.keys(decoded));
    
    // Try to extract user ID from various possible locations in the token
    const userId = decoded.id || decoded.userId || decoded._id || 
                  decoded.user?.id || decoded.user?._id || decoded.user;
    
    if (!userId) {
      console.error('No user ID found in token payload:', decoded);
      return res.status(401).json({ error: 'Invalid token: No user ID found' });
    }
    
    // Make sure it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid ObjectId format for user ID:', userId);
      return res.status(400).json({ error: 'Invalid user ID format in token' });
    }
    
    // Add user from payload to request object
    req.user = {
      id: userId,
      email: decoded.email || decoded.user?.email || 'unknown@email.com'
    };
    
    console.log('Auth successful, user:', req.user);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is not valid', details: error.message });
  }
};