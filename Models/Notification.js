import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["booking", "success", "system", "cancel"],
    default: "system",
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
    required: function () {
      return this.type === "system";
    },
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return this.type === "booking" || this.type === "success" || this.type === "cancel";
    },
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: function () {
      return this.type === "booking" || this.type === "success" || this.type === "cancel";
    },
  },
}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
