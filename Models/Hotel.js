import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Hotel name is required"], 
    trim: true, 
  },

  details: { 
    type: String, 
    maxlength: [1000, "Details cannot exceed 1000 characters"] 
  },

  starRating: { 
    type: Number, 
    min: [1, "Star rating must be at least 1"], 
    max: [5, "Star rating cannot exceed 5"] 
  },

  imageUrl: { 
    type: String, 
  },

  imagePublicId: { 
    type: String, 
  },

  pricing: {
    cpPrice: { 
      type: Number, 
      min: [0, "CP price cannot be negative"] 
    },
    apPrice: { 
      type: Number, 
      min: [0, "AP price cannot be negative"] 
    },
    mapPrice: { 
      type: Number, 
      min: [0, "MAP price cannot be negative"] 
    },
    roomPrice: { 
      type: Number, 
      required: [true, "Room price is required"], 
      min: [0, "Room price cannot be negative"] 
    },
    extraBedPrice: { 
      type: Number, 
      min: [0, "Extra bed price cannot be negative"] 
    },
  }
}, { timestamps: true });

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;
