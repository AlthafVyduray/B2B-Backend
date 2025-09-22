import Notification from "../../Models/Notification.js";

//get all notifications for admin dashboard
export const getAllNotifications = async (req, res) => {
  try {
    const { filterType, filterStatus, page = 1, limit = 10 } = req.query;

    const query = {};
    if (filterType) query.type = filterType;
    if (filterStatus) query.status = filterStatus;

    const skip = (page - 1) * limit;

    const [notifications, totalCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 }) // newest first
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(query)
    ]);


    // Count by type
    const systemCount = await Notification.countDocuments({ type: "system" });
    const bookingCount = await Notification.countDocuments({ type: "booking" });
    const successCount = await Notification.countDocuments({ type: "success" });

    const activeCount = await Notification.countDocuments({ type: "system", status: "active" });
    const inactiveCount = await Notification.countDocuments({ type: "system", status: "inactive" });

    return res.status(200).json({
      message: "Notification stats fetched successfully",
      notifications,
      stats: {
        total: totalCount,
        system: systemCount,
        booking: bookingCount,
        success: successCount,
        activeSystem: activeCount,
        inactiveSystem: inactiveCount,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / limit),
        totalRecords: totalCount,
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};



//create notification for admin dashboard
export const addNotification = async (req, res) => {
  try {
    const { notification } = req.body;
    console.log(notification)
    if (!notification.message && !notification.title) {
      return res.status(400).json({ message: "Notification title and message is required" });
    }

    const newNotification = new Notification(notification);
    await newNotification.save();

    return res.status(201).json({
      message: "Notification added successfully",
      notification: newNotification,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

//delete notification for admin dashboard
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

//may be do not need this inactive notification controller
export const inactivateNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Notification.findByIdAndUpdate(
      id,
      { status: "inactive" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.status(200).json({
      message: "Notification marked as inactive"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
