import mongoose from "mongoose"

const defaultPackageBookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
  contact: {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    mobile_number: { type: String, trim: true },
    state: { type: String, trim: true }
  },

  dates: {
    outbound: {
      pickup_date: Date,
      departureTime: { type: Date },
      arrivalTime: { type: Date },
      flight: { type: String }
    },
    return: {
      drop_date: Date,
      departureTime: { type: Date },
      arrivalTime: { type: Date },
      flight: { type: String }
    }
  },
  
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  package_name: { type: String, required: true },
  
  guests: {
    adults_total: { type: Number, min: 1, required: true },
    children_with_bed: { type: Number, default: 0 },
    children_without_bed: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
  },
  
  pricing: {
    agent_commission: {type: Number, default: 0},
    base_total: {type: Number, required: true},
    total_amount: { type: Number, required: true }
  },
  
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending"  
  },
}, {
  timestamps: true
});

const DefaultPackageBooking = mongoose.model("DefaultPackageBooking", defaultPackageBookingSchema);

export default DefaultPackageBooking;