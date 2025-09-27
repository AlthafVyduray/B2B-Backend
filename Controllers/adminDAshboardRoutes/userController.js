import User from '../../Models/User.js';
import bcrypt from 'bcryptjs';

//create user for admin dashboard
export const createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
console.log(email, password, role)
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    return res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }

};

//get all users except login user for admin dashboard
export const getAllUsers = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: user not found in request" });
    }

    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");

    return res.status(200).json({users});
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};


//update user for admin dashboard
export const updateUser = async (req, res) => {
  try {
    const { email, role } = req.body;

    const updateData = {};

    if (email) {
    
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id }});
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
      updateData.email = email;
    }

    if (role) {
      updateData.role = role
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};


//delete user for admin dashboard
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id).select("-password");
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      user: {
        _id: deletedUser._id,
        email: deletedUser.email,
        role: deletedUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

