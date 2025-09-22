import mongoose from "mongoose";

const registerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
    },
    alternateMobile: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    area: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    fullAddress: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    isApproved: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["Agent"],
      default: "Agent",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

const Register = mongoose.model("Register", registerSchema);

export default Register;
