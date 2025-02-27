// const jwt = require('jsonwebtoken');

// const auth = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');

//     if (!token) {
//       return res.status(401).json({ error: 'Authentication token missing' });
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = { _id: decoded.userId };
//       next();
//     } catch (error) {
//       return res.status(401).json({ error: 'Invalid authentication token' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Authentication failed' });
//   }
// };


const admin = require("firebase-admin"); 

// Initialize Firebase Admin SDK
const firebaseCredentials = require("../config/firebase-admin.json"); // Use "../" if this file is inside 'middleware'
admin.initializeApp({
  credential: admin.credential.cert(firebaseCredentials),
});

// Middleware to verify Firebase user
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    
    if (error.code === "auth/argument-error") {
      return res.status(400).json({ error: "Invalid token format" });
    }

    res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = {admin, auth};
