import express from "express"

import cors from "cors";


import dotenv from "dotenv"
dotenv.config();
import cookieParser from 'cookie-parser';

import authRoutes from "./Routes/authRoute.js"
import bookingRoutes from "./Routes/bookingRoute.js"


//admin routes
import homeRoute from "./Routes/adminDashboardRoutes/homeRoute.js"
import agentRoute from "./Routes/adminDashboardRoutes/agentRoute.js"
import bookingDetailsRoute from "./Routes/adminDashboardRoutes/bookingDetailsRoute.js"
import vehicleRoute from "./Routes/adminDashboardRoutes/vehicleRoute.js"
import notificationRoute from "./Routes/adminDashboardRoutes/notificationRoute.js"
import hotelRoute from "./Routes/adminDashboardRoutes/hotelRoute.js"
import pricingRoute from "./Routes/adminDashboardRoutes/pricingRoute.js"
import userRoute from "./Routes/adminDashboardRoutes/userRoute.js"
import packageRoute from "./Routes/adminDashboardRoutes/packageRoute.js"
import passwordRoute from "./Routes/adminDashboardRoutes/passwordRoute.js"

import connectDB from "./lib/db.js";


const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);

//Admin
app.use("/api/admin/home", homeRoute)
app.use("/api/admin/agents", agentRoute);
app.use("/api/admin/booking-details", bookingDetailsRoute);
app.use("/api/admin/vehicles", vehicleRoute);
app.use("/api/admin/notifications", notificationRoute);
app.use("/api/admin/hotels", hotelRoute);
app.use("/api/admin/packages", packageRoute);
app.use("/api/admin/pricing", pricingRoute);
app.use("/api/admin/users", userRoute);
app.use("/api/admin/password", passwordRoute)





const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
    console.log("Server is Running at PORT 5000");
    await connectDB()
});