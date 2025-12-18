import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";

import analyticsRoutes from "./routes/analytics.route.js";
import authRoutes from "./routes/auth.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import productRoutes from "./routes/product.route.js";

import { connectDB } from "./lib/db.js";

(async() => {
    dotenv.config();
    await connectDB();

    const app = express();
    const PORT = process.env.PORT || 5000;

    app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request, limit means the maximum size of the request body
    app.use(cookieParser());

    app.use("/api/auth", authRoutes);
    app.use("/api/products", productRoutes);
    app.use("/api/cart", cartRoutes);
    app.use("/api/coupons", couponRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/analytics", analyticsRoutes);

    app.listen(PORT, () => {
        console.log("Server is running on http://localhost:" + PORT);
    });
})();