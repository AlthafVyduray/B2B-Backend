import jwt from 'jsonwebtoken';
import Register from '../Models/Register.js';
import User from '../Models/User.js';




export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, JWT_SECRET);

    let user;

    if (decoded.role === 'Agent') {

      user = await Register.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, agent not found' });
      }
      if (!user.isApproved) {
        return res.status(403).json({ message: 'Account not approved by admin yet.' });
      }
    } else {
      
      user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
     
    }

    req.user = user;

    next();

  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};



export const adminOnly = (req, res, next) => {
  try {
    
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "Admin" && req.user.role !== "Super Admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error in adminOnly middleware", error: error.message });
  }
};

