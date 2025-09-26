import mongoose from "mongoose";

const defaultPackageSchema = new mongoose.Schema({
  package_name: {
    type: String,
    required: true,
    trim: true,
  },
  departure: {
    type: String, // e.g., "Every Friday"
    required: true,
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
  inclusions: [String],
  itineraries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Itinerary",
    }
  ],
  pricing: {
    adult: Number,
    childWithBed: Number,
    childWithoutBed: Number,
    infant: Number,
  },
}, { timestamps: true });

const DefaultPackage = mongoose.model("DefaultPackage", defaultPackageSchema);

export default DefaultPackage;
