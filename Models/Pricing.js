import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema(
  {
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: [true, 'Package reference is required'],
    },
    entryAdult: {
      type: Number,
      required: [true, 'Entry Adult price is required'],
      min: [0, 'Entry Adult price cannot be negative'],
    },
    entryChild: {
      type: Number,
      required: [true, 'Entry Child price is required'],
      min: [0, 'Entry Child price cannot be negative'],
    },
    snowAdult: {
      type: Number,
      required: [true, 'Snow Adult price is required'],
      min: [0, 'Snow Adult price cannot be negative'],
    },
    snowChild: {
      type: Number,
      required: [true, 'Snow Child price is required'],
      min: [0, 'Snow Child price cannot be negative'],
    },
    breakfast: {
      type: Number,
      required: [true, 'Breakfast price is required'],
      min: [0, 'Breakfast price cannot be negative'],
    },
    lunchVeg: {
      type: Number,
      required: [true, 'Veg Lunch price is required'],
      min: [0, 'Veg Lunch price cannot be negative'],
    },
    lunchNonVeg: {
      type: Number,
      required: [true, 'Non-Veg Lunch price is required'],
      min: [0, 'Non-Veg Lunch price cannot be negative'],
    },
    guide: {
      type: Number,
      required: [true, 'Guide price is required'],
      min: [0, 'Guide price cannot be negative'],
    },
  },
  {
    timestamps: true
  }
);

const Pricing = mongoose.model('Pricing', pricingSchema);

export default Pricing;
