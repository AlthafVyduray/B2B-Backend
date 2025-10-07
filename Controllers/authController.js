import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Register from '../Models/Register.js';
import User from '../Models/User.js';
import crypto from "crypto";
import { sendResetEmail } from "../lib/email.js";



//Registation for Agents
export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      alternateMobile,
      companyName,
      gstNumber,
      area,
      state,
      fullAddress,
      password
    } = req.body;

    if (!fullName || !email || !mobileNumber || !password) {
      return res.status(400).json({ message: "Full Name, Email, Mobile, and Password are required." });
    }

    const existingUser = await Register.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Register.create({
      fullName,
      email,
      mobileNumber,
      alternateMobile,
      companyName,
      gstNumber,
      area,
      state,
      fullAddress,
      password: hashedPassword
    });

    return res.status(201).json({ message: "Registration successful. Awaiting admin approval." });
  } catch (err) {
    if (err.name === "ValidationError") {
      // Extract all validation error messages
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: err.message, errors });
    }

    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

//login controller for both admins and agents
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const JWT_SECRET = process.env.JWT_SECRET;
    
    let account = await Register.findOne({ email });
    let accountType = 'Agent';

    if (!account) {
      account = await User.findOne({ email });
      accountType = 'Admin';
    }
    
    if (!account) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    
  
    if (accountType === 'Agent' && (account.isApproved === "pending" || account.isApproved === "rejected" )) {
      return res.status(403).json({ message: 'Your account is not yet approved by the administrator.' });
    }

  
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

  
    const role = account.role;

    const token = jwt.sign(
      { userId: account._id, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );


    res.cookie('token', token, {
      httpOnly: true, // prevents JS access
      secure: process.env.NODE_ENV === 'production', // HTTPS required
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // cross-site in production
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });


    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: account._id,
        fullName: account.fullName || null,
        email: account.email || null,
        mobileNumber: account.mobileNumber || null,
        role
      }
    });

  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//Profile update controller for Agents
export const updateProfile = async (req, res) => {
  try {

    const userId = req.user._id;
    const {
      fullName,
      email,
      mobileNumber,
      alternateMobile,
      companyName,
      gstNumber,
      area,
      state,
      fullAddress,
      password
    } = req.body;

    const user = await Register.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (password && password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (email) {
      const existingUser = await Register.findOne({ email, _id: { $ne: userId }});
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      user.email = email;
    }

    if (fullName) user.fullName = fullName;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (alternateMobile) user.alternateMobile = alternateMobile;
    if (companyName) user.companyName = companyName;
    if (gstNumber) user.gstNumber = gstNumber;
    if (area) user.area = area;
    if (state) user.state = state;
    if (fullAddress) user.fullAddress = fullAddress;

    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        alternateMobile: user.alternateMobile,
        companyName: user.companyName,
        gstNumber: user.gstNumber,
        area: user.area,
        state: user.state,
        fullAddress: user.fullAddress
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//logout controller
export const logoutUser = async (req, res) => {
  try {
    if (!req.cookies?.token) {
      return res.status(400).json({ message: "No active session found" });
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/', // match path used when setting cookie
    });


    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


//for check authentication
export const getProfile = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


//forgotPassword controller
export const forgotPassword = async (req, res) => {
  try {
    const {email} = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await Register.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      res.status(400).json({message: "Email is invalid"})
    }

    const token = crypto.randomBytes(32).toString("hex"); // raw token sent to user
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    if (user) {
      user.resetPasswordToken = hashed;
      user.resetPasswordExpires = expires;
      await user.save();
    }
    //toto
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    if (user) {
      await sendResetEmail(user.email, resetLink);
    }

    return res.status(200).json({
      message: "If an account with that email exists, you will receive a password reset email shortly."
    });

  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

//resetpassword controller
export const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) return res.status(400).json({ message: "Missing fields" });

  try {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    // find user by email and matching hashed token and not expired
    const user = await Register.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // validate password strength (simple example)
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // clear reset fields (single use)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // optional: bump session/version to invalidate old JWTs (if you use JWT)
    // user.tokenVersion = (user.tokenVersion || 0) + 1;

    await user.save();

    // optionally send confirmation email here

    return res.status(200).json({ message: "Password reset successful. You can now login." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};





