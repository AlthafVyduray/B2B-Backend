import Package from "../../Models/Package.js";
import Itinerary from "../../Models/Itinerary.js";
import cloudinary from "../../lib/cloudinary.js";
import DefaultPackage from "../../Models/DefaultPackage.js";
import Pricing from "../../Models/Pricing.js";


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
    if (error.name === "ValidationError") {
      // Extract all validation error messages
      
      const errors = Object.values(error.errors).map(e => e.message);
      console.log(errors)
      return res.status(400).json({ message: error.message, errors });
    }
    console.log(error)
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


//get all packages for admin dashboard
export const getAllPackages = async (req, res) => {
  try {
    const defaultPackages = await DefaultPackage.find().populate("itineraries");
    const packages = await Package.find().populate("itineraries");
    return res.status(200).json({ packages, defaultPackages });
  } catch (error) {
    console.log(error)
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

    let type = "normal";
    let pkg = await Package.findById(id).populate("itineraries");

    if (!pkg) {
      type = "default";
      pkg = await DefaultPackage.findById(id).populate("itineraries");
    }
    if (!pkg) return res.status(404).json({ message: "Package not found" });

    // Delete all itinerary images & docs
    for (const itin of pkg.itineraries) {
      if (itin.imagePublicId) {
        await cloudinary.uploader.destroy(itin.imagePublicId);
      }
      await Itinerary.findByIdAndDelete(itin._id);
    }

    // Delete package itself
    if (type === "normal") {
      await Package.findByIdAndDelete(id);
    } else {
      await DefaultPackage.findByIdAndDelete(id);
    }

    //Delete associated pricing only after package deletion succeeded
    await Pricing.deleteMany({ package_id: pkg._id });

    return res
      .status(200)
      .json({ message: "Package, its itineraries, and pricing deleted" });
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};



/**
 * Expects:
 * - files uploaded via multer.array('itineraryImages', 10)
 * - req.body.itineraries as JSON stringified array [{ day_number, description }, ...]
 * - req.body.flight_details, req.body.inclusions, req.body.pricing may be JSON strings or objects/arrays
 * - req.body.package_name, req.body.departure, req.body.days, req.body.nights
 */
export const createDefaultPackage = async (req, res) => {
  try {
    // Pull raw values from body
    const { package_name, departure, days: daysRaw, nights: nightsRaw } = req.body;
    let { inclusions, itineraries, pricing } = req.body;

    // Basic presence checks
    if (!package_name || !departure) {
      return res.status(400).json({ message: "package_name and departure are required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Itinerary images are required" });
    }

    // Parse days/nights to numbers (if provided)
    const days = daysRaw !== undefined && daysRaw !== null ? Number(daysRaw) : undefined;
    const nights = nightsRaw !== undefined && nightsRaw !== null ? Number(nightsRaw) : undefined;

    // Helper: safe JSON parse with fallback
    const safeParse = (val) => {
      if (val === undefined || val === null) return val;
      if (typeof val === "object") return val; // already parsed
      if (typeof val === "string") {
        const trimmed = val.trim();
        if (trimmed === "") return undefined;
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          // Not valid JSON — try CSV-ish fallback for inclusions
          return trimmed.includes(",") ? trimmed.split(",").map(s => s.trim()).filter(Boolean) : trimmed;
        }
      }
      return val;
    };

    // Parse possibly-string fields
    try {
      itineraries = safeParse(itineraries);
      inclusions = safeParse(inclusions);
      pricing = safeParse(pricing);
    } catch (err) {
      return res.status(400).json({ message: "Failed to parse JSON fields", error: err.message });
    }

    // Ensure itineraries is an array
    if (!Array.isArray(itineraries)) {
      return res.status(400).json({ message: "itineraries must be an array (JSON string or array)" });
    }

    // Multer.limit should enforce max files, but ensure we match counts
    if (itineraries.length !== req.files.length) {
      return res.status(400).json({
        message: "Number of itinerary images must match number of itinerary objects",
        expectedItineraries: itineraries.length,
        receivedFiles: req.files.length,
      });
    }

    // Save itineraries one by one with corresponding Cloudinary file info
    const savedItineraries = [];
    for (let i = 0; i < itineraries.length; i++) {
      const dayData = itineraries[i];
      const file = req.files[i];
      if (!dayData || typeof dayData !== "object") {
        return res.status(400).json({ message: `Invalid itinerary at index ${i}` });
      }

      // Cloudinary storage returns different props depending on storage engine version;
      // attempt a safe fallback for image URL/public id
      const imageUrl = file.path || file.secure_url || file.url || null;
      const imagePublicId = file.filename || file.public_id || file.public_id || null;

      const newItinerary = new Itinerary({
        day_number: dayData.day_number ?? (i + 1),
        description: dayData.description ?? "",
        image: imageUrl,
        imagePublicId: imagePublicId,
      });

      const savedItin = await newItinerary.save();
      savedItineraries.push(savedItin._id);
    }

    // Build package object
    const packagePayload = {
      package_name,
      departure,
      itineraries: savedItineraries,
      // only attach days/nights if provided (optional)
      ...(typeof days === "number" && !Number.isNaN(days) ? { days } : {}),
      ...(typeof nights === "number" && !Number.isNaN(nights) ? { nights } : {}),
      ...(inclusions ? { inclusions } : {}),
      ...(pricing ? { pricing } : {}),
    };

    const newPackage = new DefaultPackage(packagePayload);
    const savedPackage = await newPackage.save();

    // Optionally populate itinerary docs for the response
    await savedPackage.populate("itineraries").execPopulate?.(); // execPopulate for older mongoose
    // modern mongoose supports just await savedPackage.populate('itineraries');
    try {
      await savedPackage.populate("itineraries");
    } catch (e) {
      // ignore populate errors (still return savedPackage)
    }

    return res.status(201).json({ message: "Package created", package: savedPackage });
  } catch (error) {
    console.error("createDefaultPackage error:", error);
    if (error.name === "ValidationError") {
      console.log(error)
      const errors = Object.values(error.errors).map((e) => { e.message; console.log(e.message)});

      return res.status(400).json({ message: "Validation error", errors });
    }
      console.log(error)

    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateDefaultPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      package_name,
      place,
      nights,
      days,
      itineraries, // JSON string of updated itineraries
    } = req.body;
    const pricing  = JSON.parse(req.body.pricing);
    const inclusions = JSON.parse(req.body.inclusions);
    console.log(pricing)
    console.log(inclusions)
    const pkg = await DefaultPackage.findById(id).populate("itineraries");
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
    pkg.pricing = pricing || pkg.pricing;
    pkg.inclusions = inclusions || pkg.inclusions
    pkg.itineraries = finalItineraryIds;

    const updatedPackage = await pkg.save();

    return res
      .status(200)
      .json({ message: "Package updated", package: updatedPackage });
  } catch (error) {
    console.error("createDefaultPackage error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: "Validation error", errors });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
  
};
