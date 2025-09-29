import Package from '../Models/Package.js';
import Vehicle from '../Models/Vehicle.js';
import Hotel from '../Models/Hotel.js';
import Booking from '../Models/Booking.js';
import Register from '../Models/Register.js';
import Notification from "../Models/Notification.js"
import Pricing from '../Models/Pricing.js';
import mongoose from 'mongoose';
import DefaultPackage from '../Models/DefaultPackage.js';
import DefaultPackageBooking from '../Models/DefaultPackageBooking.js';

//controller for get specific package details with itineraries for booking page
export const getPackageDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findById(id).populate('itineraries');

    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    return res.status(200).json(pkg);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//controller for get all package details for booking page
export const getAllPackages = async (req, res) => {
  try {
    const defaultPackages = await DefaultPackage.find().populate('itineraries')
    const packages = await Package.find().populate('itineraries');

    return res.status(200).json({
      message: 'Packages fetched successfully',
      packages,
      defaultPackages
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while fetching packages',
      error: error.message
    });
  }
};

//controller for get all vehicles for booking page
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();

    return res.status(200).json({
      message: 'Vehicles fetched successfully',
      data: vehicles
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while fetching vehicles',
      error: error.message
    });
  }
};


//controller for get hotels by rating
export const getHotelsByRating = async (req, res) => {
  try {
    const { starRating } = req.body;
    
    if (starRating === undefined || starRating === null) {
      return res.status(400).json({ message: "Please provide starRating in request body" });
    }

    const num = Number(starRating);
    if (Number.isNaN(num)) {
      return res.status(400).json({ message: "Rating must be a valid number" });
    }

    let hotels;
    if (starRating === 0) {
      hotels = await Hotel.find();
    } else {
      hotels = await Hotel.find({ starRating: num });
    }


    return res.status(200).json({
      message: `Hotels with rating == ${num} fetched successfully`,
      hotels,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


//controller for create a booking
export const createBooking = async (req, res) => {
  try {
    const user_id = req.user && req.user._id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

 
    const {
      package_name,
      package_id,
      vehicle_name,
      vehicle_id,
      pickup_date,
      pickup_time,
      pickup_location,
      drop_date,
      drop_time,
      drop_location,
      adults_total,
      children,
      infants,
      entry_ticket_needed,
      snow_world_needed,
      food_plan,
      extra_food,
      hotel_name,
      hotel_id,
      rooms,
      extra_beds,
      guideNeeded,
      agent_commission,
      base_total,
      total_amount,
    } = req.body;

    
    
    if (total_amount === undefined || total_amount === null) {
      return res.status(400).json({ message: "total_amount is required" });
    }

    const user = await Register.findById(user_id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found. Booking cannot proceed." });
    }
    const name = user.fullName;
    const email = user.email;
    const mobile_number = user.mobileNumber;
    const state = user.state;
    
    // Helper to convert to ObjectId only when valid
    const asObjectId = (id) => {
      try {
        return id && mongoose.Types.ObjectId.isValid(id)
          ? new mongoose.Types.ObjectId(id)   // ✅ use new
          : undefined;
      } catch (err) {
        console.error("Invalid ObjectId:", id, err.message);
        return undefined;
      }
    };


 
    const newBooking = new Booking({
      user_id,

      contact: {name, email, mobile_number, state},

      // package
      package_name: package_name,
      package_id: asObjectId(package_id),

      // vehicle
      vehicle_name: vehicle_name || "",
      vehicle_id: asObjectId(vehicle_id),

      // dates
      dates: {
        pickup_date: pickup_date ? new Date(pickup_date) : undefined,
        pickup_time: pickup_time || "",
        pickup_location: pickup_location || "",
        drop_date: drop_date ? new Date(drop_date) : undefined,
        drop_time: drop_time || "",
        drop_location: drop_location || "",
      },
      
      guests: {
        adults_total: Number(adults_total),
        children: Number(children),
        infants: Number(infants),
      },

      extras: {
        entry_ticket_needed: Boolean(entry_ticket_needed),
        snow_world_needed: Boolean(snow_world_needed),
        breakfast: Boolean(extra_food.breakfast),
        lunchVeg: Boolean(extra_food.lunchVeg),
        lunchNonVeg: Boolean(extra_food.lunchNonVeg),
        guideNeeded: Boolean(guideNeeded) 
      },  
 
      
      hotel_id: asObjectId(hotel_id),
      hotel: {
        hotel_name: hotel_name,
        food_plan: food_plan,
        rooms: Number(rooms),
        extra_beds: Number(extra_beds),
      },
      
      pricing: {
        agent_commission: Number(agent_commission),
        base_total: Number(base_total),
        total_amount: Number(total_amount),
      }
      
    });

    await newBooking.save();

     const notification = new Notification({
      title: "Package Booking",
      type: "booking",
      recipient: user_id,
      booking: newBooking._id,
      message: `Booking id:${newBooking._id} ${newBooking.package_name} on ${newBooking.dates?.pickup_date} is Created`
    });

    await notification.save();

    return res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
     if (error.name === "ValidationError") {
       const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
    }
  
};

export const createDefaultBooking = async (req, res) => {
  try {
    const user_id = req.user && req.user._id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });

    const {
      package_name,
      package_id,
      pickup_date,
      drop_date,
      adults_total,
      children_with_bed,
      children_without_bed,
      infants,
      agent_commission,
      base_total,
      total_amount

    } = req.body;

    if (total_amount === undefined || total_amount === null) {
      return res.status(400).json({ message: "total_amount is required" });
    }

    const user = await Register.findById(user_id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found. Booking cannot proceed." });
    }
    const name = user.fullName;
    const email = user.email;
    const mobile_number = user.mobileNumber;
    const state = user.state;
    
    // Helper to convert to ObjectId only when valid
    const asObjectId = (id) => {
      try {
        return id && mongoose.Types.ObjectId.isValid(id)
          ? new mongoose.Types.ObjectId(id)   // ✅ use new
          : undefined;
      } catch (err) {
        console.error("Invalid ObjectId:", id, err.message);
        return undefined;
      }
    };

    const newBooking = new DefaultPackageBooking({
      user_id,

      contact: { name, email, mobile_number, state },

      package_name,
      package_id: asObjectId(package_id),

      dates: {
        outbound: {
          pickup_date: pickup_date ? new Date(pickup_date) : undefined,
        },
        return: {
          drop_date: drop_date ? new Date(drop_date) : undefined,
        },
      },

      guests: {
        adults_total: Number(adults_total),
        children_with_bed: Number(children_with_bed),
        children_without_bed: Number(children_without_bed),
        infants: Number(infants),
      },

      pricing: {
        agent_commission: Number(agent_commission),
        base_total: Number(base_total),
        total_amount: Number(total_amount),
      },
    });

    await newBooking.save();

     const notification = new Notification({
      title: "Package Booking",
      type: "booking",
      recipient: user_id,
      booking: newBooking._id,
      message: `Booking id:${newBooking._id} ${newBooking.package_name} (Default Package) is Created`
    });

    await notification.save();

    return res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });

    
    
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
    }
  
}




export const getBookings = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch from both collections
    const bookings = await Booking.find({ user_id: user._id }).sort({ createdAt: -1 });
    const defaultPackageBookings = await DefaultPackageBooking.find({ user_id: user._id }).sort({ createdAt: -1 });

    // Add source field
    const bookingsWithSource = bookings.map((b) => ({
      ...b.toObject(),
      source: "Booking",
    }));

    const defaultPackageBookingsWithSource = defaultPackageBookings.map((d) => ({
      ...d.toObject(),
      source: "DefaultPackageBooking",
    }));

    // Merge and sort all by createdAt
    const allBookings = [...bookingsWithSource, ...defaultPackageBookingsWithSource].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({
      message: "Bookings fetched successfully",
      bookings: allBookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


//get all notifications by admin
export const getAdminNotifications = async (req, res) => {
  try {
    const user_id = req.user._id

    const filter = {
      $or: [
        { type: "system" }, // all system notifications
        { 
          type: { $in: ["booking", "success", "cancel"] }, 
          recipient: user_id // only for booking/success
        }
      ]
    };

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });



    return res.status(200).json({
      message: 'Notifications fetched successfully',
      notifications
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server Error',
      error: error.message
    });
  }
}

//get pricing details for booking page
export const getPricing = async (req, res) => {
  try {
    const pricing = await Pricing.find({})

    res.status(200).json({
      message: 'Pricing fetched successfully',
      pricing
    })
  } catch (error) {
    res.status(500).json({
      message: 'Server Error',
      error: error.message
    });
  }
}

