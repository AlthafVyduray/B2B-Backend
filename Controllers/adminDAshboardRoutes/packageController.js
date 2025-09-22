import Package from "../../Models/Package.js";
import Itinerary from "../../Models/Itinerary.js";
import cloudinary from "../../lib/cloudinary.js";

//create packages for admin dashboard
export const createPackage = async (req, res) => {
  try {
    const {
      package_name,
      place,
      nights,
      days,
      price,
      itineraries, // expect this as JSON string
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Itinerary images are required" });
    }

    // Parse itineraries JSON string to array
    const itineraryArr = JSON.parse(itineraries);

    if (itineraryArr.length !== req.files.length) {
      return res.status(400).json({
        message: "Number of itinerary images must match number of itinerary objects",
      });
    }

    // Save itineraries one by one with corresponding image
    const savedItineraries = [];

    for (let i = 0; i < itineraryArr.length; i++) {
      const dayData = itineraryArr[i];
      const file = req.files[i];

      const newItinerary = new Itinerary({
        day_number: dayData.day_number,
        description: dayData.description,
        image: file.path,
        imagePublicId: file.filename,
      });

      const savedItin = await newItinerary.save();
      savedItineraries.push(savedItin._id);
    }

    // Create package with itinerary references
    const newPackage = new Package({
      package_name,
      place,
      nights,
      days,
      price,
      itineraries: savedItineraries,
    });

    const savedPackage = await newPackage.save();

    return res.status(201).json({ message: "Package created", package: savedPackage });
  } catch (error) {
    if (err.name === "ValidationError") {
      // Extract all validation error messages
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: err.message, errors });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


//get all packages for admin dashboard
export const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find().populate("itineraries");
    return res.status(200).json({ packages });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


//update package for admin dashboard
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      package_name,
      place,
      nights,
      days,
      price,
      itineraries, // JSON string of updated itineraries
    } = req.body;

    const pkg = await Package.findById(id).populate("itineraries");
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    // Parse updated itineraries
    let updatedItineraries = [];
    if (itineraries) updatedItineraries = JSON.parse(itineraries);

    // Handle images uploaded
    const files = req.files || [];

    // Map old itineraries by day_number
    const oldItinMap = new Map();
    pkg.itineraries.forEach(itin => oldItinMap.set(itin.day_number, itin));

    const finalItineraryIds = [];

    for (const dayData of updatedItineraries) {
      const existingItin = oldItinMap.get(dayData.day_number);

      // Match file by originalname prefix (e.g. "day-2-...")
      const file = files.find(f =>
        f.originalname.startsWith(`day-${dayData.day_number}-`)
      );

      if (existingItin) {
        if (file) {
          // replace image in Cloudinary
          await cloudinary.uploader.destroy(existingItin.imagePublicId);
          existingItin.image = file.path;
          existingItin.imagePublicId = file.filename;
        }
        existingItin.description =
          dayData.description || existingItin.description;
        await existingItin.save();
        finalItineraryIds.push(existingItin._id);
      } else {
        if (!file) {
          return res.status(400).json({
            message: `Missing image for new itinerary day ${dayData.day_number}`,
          });
        }
        const newItin = new Itinerary({
          day_number: dayData.day_number,
          description: dayData.description,
          image: file.path,
          imagePublicId: file.filename,
        });
        const savedNewItin = await newItin.save();
        finalItineraryIds.push(savedNewItin._id);
      }
    }

    // Delete old itineraries not in updated list
    for (const oldItin of pkg.itineraries) {
      if (!finalItineraryIds.includes(oldItin._id)) {
        await cloudinary.uploader.destroy(oldItin.imagePublicId);
        await Itinerary.findByIdAndDelete(oldItin._id);
      }
    }

    // Update package details
    pkg.package_name = package_name || pkg.package_name;
    pkg.place = place || pkg.place;
    pkg.nights = nights || pkg.nights;
    pkg.days = days || pkg.days;
    pkg.price = price || pkg.price;
    pkg.itineraries = finalItineraryIds;

    const updatedPackage = await pkg.save();

    return res
      .status(200)
      .json({ message: "Package updated", package: updatedPackage });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Delete Package (delete package and all related itineraries & images) for admin daashoard
export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findById(id).populate("itineraries");
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    // Delete all itinerary images & docs
    for (const itin of pkg.itineraries) {
      await cloudinary.uploader.destroy(itin.imagePublicId);
      await Itinerary.findByIdAndDelete(itin._id);
    }

    await Package.findByIdAndDelete(id);

    return res.status(200).json({ message: "Package and its itineraries deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
