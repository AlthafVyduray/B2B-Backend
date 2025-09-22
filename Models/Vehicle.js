import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vehicle name is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Vehicle capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Vehicle price is required"],
      min: [0, "Price cannot be negative"],
    },
    type: {
      type: String,
      required: [true, "Vehicle type is required"],
      trim: true,
      uppercase: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vehicle", vehicleSchema);
