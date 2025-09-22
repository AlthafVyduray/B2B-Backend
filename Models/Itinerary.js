import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  day_number: {
    type: Number,
    required: [true, "Day number is required"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true
  },
  image: {
    type: String,
  },
  imagePublicId: {
    type: String,
  }
}, { timestamps: true });

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;
