// import mongoose from 'mongoose';

// const bookingSchema = new mongoose.Schema({
//   user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
//   email: { type: String, trim: true },
//   mobile_number: { type: String, trim: true },
//   package_name: String,
//   package_id: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
//   vehicle_name: String,
//   vehicle_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
//   pickup_date: Date,
//   pickup_time: String,
//   pickup_location: String,
//   pickup_location_other: String,
//   drop_date: Date,
//   drop_time: String,
//   drop_location: String,
//   drop_location_other: String,
//   adults_total: { type: Number, min: 1, required: true },
//   children: { type: Number, default: 0 },
//   infants: { type: Number, default: 0 },
//   entry_ticket_needed: { type: Boolean, default: false },
//   snow_world_needed: { type: Boolean, default: false },
//   food_plan: String,
//   extra_food: {
//     breakfast: { type: Boolean, default: false },
//     lunchVeg: { type: Boolean, default: false },
//     lunchNonVeg: { type: Boolean, default: false }
//   },
//   hotel_name: String,
//   hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
//   rooms: { type: Number, default: 0 },
//   guideNeeded: { type: Boolean, default: false },
//   extra_beds: { type: Number, default: 0 },
//   agent_commission: {type: Number, default: 0},
//   base_total: {type: Number, required: true},
//   total_amount: { type: Number, required: true }
// }, {
//   timestamps: true
// });
import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Register', required: true },
  contact: {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    mobile_number: { type: String, trim: true },
    state: { type: String, trim: true }
  },
  
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  package_name: { type: String, required: true },
  
  vehicle_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  vehicle_name: String,

  dates: {
    pickup_date: Date,
    pickup_time: String,
    pickup_location: String,
    drop_date: Date,
    drop_time: String,
    drop_location: String,
  },

  guests: {
    adults_total: { type: Number, min: 1, required: true },
    children: { type: Number, default: 0 },
    infants: { type: Number, default: 0 },
  },

  extras: {
    entry_ticket_needed: { type: Boolean, default: false },
    snow_world_needed: { type: Boolean, default: false },
    breakfast: { type: Boolean, default: false }, 
    lunchVeg: { type: Boolean, default: false }, 
    lunchNonVeg: { type: Boolean, default: false }, 
    guideNeeded: { type: Boolean, default: false },
  },

  hotel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
  hotel: {
    hotel_name: {type: String},
    food_plan: {type: String},
    rooms: { type: Number, default: 0 },
    extra_beds: { type: Number, default: 0 },
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

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
