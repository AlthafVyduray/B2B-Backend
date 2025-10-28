import Pricing from "../../Models/Pricing.js";


//create pricing for admin dashboard
export const createPricing = async (req, res) => {
  try {
    const { package_id, entryAdult, entryChild, snowAdult, snowChild, breakfast, lunchVeg, lunchNonVeg, guide } = req.body;

    const existingPricing = await Pricing.findOne({ package_id });
    if (existingPricing) {
      return res.status(400).json({ message: "Pricing already exists for this package" });
    }

    const pricing = new Pricing({package_id, entryAdult, entryChild, snowAdult, snowChild, breakfast, lunchVeg, lunchNonVeg, guide});
    await pricing.save();

    return res.status(201).json({
      message: "Pricing created successfully",
      pricing,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

//get all pricing for admin dashboard
export const getAllPricing = async (req, res) => {
  try {
    const pricing = await Pricing.find()
      .sort({ createdAt: -1 })
      .populate("package_id", "_id package_name");
    
    return res.status(200).json({
      message: "Pricing list fetched successfully",
      pricing,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

//update pricing for admin dashboard
export const updatePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("package_id", "_id name");

    if (!pricing) {
      return res.status(404).json({ message: "Pricing not found" });
    }

    return res.status(200).json({
      message: "Pricing updated successfully",
      pricing,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }

    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};


//delete pricing for admin dashboard
export const deletePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndDelete(req.params.id);

    if (!pricing) {
      return res.status(404).json({ message: "Pricing not found" });
    }

    return res.status(200).json({
      message: "Pricing deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

