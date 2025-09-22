import Vehicle from "../../Models/Vehicle.js";


//create vehicles for admin dashboard
export const addVehicle = async (req, res) => {
  try {
    const { name, capacity, price, type } = req.body;
    if (!name || !capacity || !price || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newVehicle = new Vehicle({ name, capacity, price, type });
    await newVehicle.save();

    return res.status(201).json({
      message: "Vehicle added successfully",
      vehicle: newVehicle,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get all vehicles for admin dashboard
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ created_at: -1 });

    return res.status(200).json({
      message: "Vehicles fetched successfully",
      vehicles,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

//update vehicle for admin dashboard
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, price, type } = req.body;
    
    if (!name && !capacity && !price && !type) {
      return res.status(400).json({
        message: "No fields provided for update",
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { name, capacity, price, type },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    return res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

//delete vehicle fro admin dashboard
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Vehicle.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    return res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
