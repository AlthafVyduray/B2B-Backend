import cloudinary from "../../lib/cloudinary.js";
import Hotel from "../../Models/Hotel.js";

//create hotel for admin dashboard
export const createHotel = async (req, res) => {
  try {
    const {
      name, details, starRating,
      cpPrice, apPrice, mapPrice,
      extraBedPrice, roomPrice
    } = req.body;

    let imageUrl = "";
    let imagePublicId = "";
    if (req.file) {
      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
    }

    const hotel = new Hotel({
      name,
      details,
      starRating,
      imageUrl,
      imagePublicId,
      pricing: {
        cpPrice,
        apPrice,
        mapPrice,
        roomPrice,
        extraBedPrice
      }
    });

    await hotel.save();
    
    return res.status(201).json({ message: "Hotel created successfully", hotel });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res.status(500).json({ error: error.message });
  }
};

//get all hotels for admin dashboard
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    return res.json({hotels})
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//update hotel for admin dashboard
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const {
      name, details, starRating,
      cpPrice, apPrice, mapPrice,
      roomPrice,
      extraBedPrice
    } = req.body;

    
    if (req.file) {
      
      if (hotel.imagePublicId) {
        await cloudinary.uploader.destroy(hotel.imagePublicId);
      }
      hotel.imageUrl = req.file.path;
      hotel.imagePublicId = req.file.filename;
    }

    hotel.name = name || hotel.name;
    hotel.details = details || hotel.details;
    hotel.starRating = starRating || hotel.starRating;
    hotel.pricing = {
      cpPrice: cpPrice || hotel.pricing.cpPrice,
      apPrice: apPrice || hotel.pricing.apPrice,
      mapPrice: mapPrice || hotel.pricing.mapPrice,
      roomPrice: roomPrice || hotel.pricing.roomPrice,
      extraBedPrice: extraBedPrice || hotel.pricing.extraBedPrice
    };

    await hotel.save();
    return res.json({ message: "Hotel updated successfully", hotel });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//deletehotel for admin dashboard
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });

    
    if (hotel.imagePublicId) {
      await cloudinary.uploader.destroy(hotel.imagePublicId);
    }

    await hotel.deleteOne();
    return res.json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
