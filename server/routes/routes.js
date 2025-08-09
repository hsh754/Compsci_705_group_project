import express from "express";
import apiRoutes from "./api/api.js";

const router = express.Router();

router.get("/", (req, res) => {
    return res.json({ message: "API normally operated", mock: process.env.MOCK === 'true' });
});

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// Mount all API routes at root path
router.use("/", apiRoutes);

export default router;