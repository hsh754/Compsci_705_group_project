import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    // Mock bypass: when MOCK=true, always authenticate as a mock user
    if (process.env.MOCK === 'true') {
        const mockRole = req.headers['x-mock-role'] || 'user';
        req.user = { id: 'mock-user-id', role: mockRole };
        return next();
    }
    let token = req.headers.authorization && req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null;
    if (!token) return res.status(401).json({ error: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id }; // store only id to reduce redundancy
        next();
    } catch (err) {
        res.status(401).json({ error: "Token is not valid" });
    }
};

export const requireRole = (roles = []) => {
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return async (req, res, next) => {
        try {
            if (process.env.MOCK === 'true') {
                const role = req.user?.role || req.headers['x-mock-role'] || 'user';
                if (requiredRoles.length && !requiredRoles.includes(role)) {
                    return res.status(403).json({ error: "Forbidden" });
                }
                return next();
            }
            // if protect not run yet, try decode quickly to get id
            if (!req.user?.id) {
                const token = req.headers.authorization?.startsWith("Bearer")
                    ? req.headers.authorization.split(" ")[1]
                    : null;
                if (!token) return res.status(401).json({ error: "No token" });
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = { id: decoded.id };
            }
            const u = await User.findById(req.user.id).select("role");
            if (!u) return res.status(401).json({ error: "Unauthorized" });
            if (requiredRoles.length && !requiredRoles.includes(u.role)) {
                return res.status(403).json({ error: "Forbidden" });
            }
            next();
        } catch (e) {
            return res.status(401).json({ error: "Unauthorized" });
        }
    };
};