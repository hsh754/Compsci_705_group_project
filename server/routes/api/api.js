import express from "express";
import userRoutes from "./user.js";
import adminRoutes from "./admin.js";
import publicRoutes from "./public.js";

const router = express.Router();
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);
router.use("/public", publicRoutes);

export default router;