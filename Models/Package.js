import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  package_name: {
    type: String,
    required: [true, "Package name is required"],
    trim: true,
  },
  place: {
    type: String,
    default: "Hyderabad",
    trim: true,
  },
  nights: {
    type: Number,
    required: [true, "Number of nights is required"],
  },
  days: {
    type: Number,
    required: [true, "Number of days is required"],
    validate: {
      validator: function (value) {
        return value === this.nights + 1;
      },
      message: "Days should be equal to nights + 1",
    },
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  itineraries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Itinerary",
    }
  ]
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);

export default Package;
