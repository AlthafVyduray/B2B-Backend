import Register from "../../Models/Register.js";

//fetch all agents for admin dashboard
export const getAllAgents = async (req, res) => {
  try {
    const { searchField, searchValue, page = 1, limit = 25 } = req.query;

    let filter = { role: "Agent" };

    if (searchField && searchValue) {
      if (searchField === "name") {
        filter.fullName = { $regex: searchValue, $options: "i" };
      } else if (searchField === "email") {
        filter.email = { $regex: searchValue, $options: "i" };
      } else if (searchField === "state") {
        filter.state = { $regex: searchValue, $options: "i" };
      } else if (searchField === "company") {
        filter.companyName = { $regex: searchValue, $options: "i" };
      } else if (searchField === "mobile") {
        filter.mobileNumber = { $regex: searchValue, $options: "i" };
      }
    }

    // Convert page/limit to numbers
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 25;
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch paginated agents
    const agents = await Register.find(filter)
      .select("-password -__v")
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const totalAgents = await Register.countDocuments({ role: "Agent" });

    // Status counts
    const statusCounts = await Register.aggregate([
      { $match: { role: "Agent" } },
      { $group: { _id: "$isApproved", count: { $sum: 1 } } }
    ]);

    let counts = { pending: 0, approved: 0, rejected: 0 };
    statusCounts.forEach(item => {
      if (item._id === "pending") counts.pending = item.count;
      if (item._id === "approved") counts.approved = item.count;
      if (item._id === "rejected") counts.rejected = item.count;
    });

    counts.total = totalAgents;

    return res.status(200).json({
      counts,
      agents,
      pagination: {
        total: totalAgents,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalAgents / limitNumber),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching agents",
      error: error.message,
    });
  }
};




//approve agents for admin dashboard
export const approveAgent = async (req, res) => {
  try {
    const agent = await Register.findById(req.params.id).select("-password -__v");
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (agent.isApproved === "approved") {
      return res.status(200).json({ message: "Agent is already approved", agent });
    }

    agent.isApproved = "approved";
    await agent.save();

    return res.status(200).json({ message: "Agent approved successfully", agent });
  } catch (error) {
    return res.status(500).json({ message: "Error approving agent", error: error.message });
  }
};


//Reject agents for admin dashboard
export const rejectAgent = async (req, res) => {
  try {
    const agent = await Register.findById(req.params.id).select("-password -__v");
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (!agent.isApproved === "rejected") {
      return res.status(200).json({ message: "Agent is already rejected", agent });
    }

    agent.isApproved = "rejected";
    await agent.save();

    return res.status(200).json({ message: "Agent rejected successfully", agent });
  } catch (error) {
    return res.status(500).json({ message: "Error rejecting agent", error: error.message });
  }
};

