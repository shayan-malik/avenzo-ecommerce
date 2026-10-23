import jwt from "jsonwebtoken";
import { db } from "../db.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Please log in first" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await db.query(
            "SELECT id, role, is_active FROM users WHERE id = $1",
            [decoded.id]
        );

        const user = result.rows[0];

        if (!user || !user.is_active) {
            return res.status(401).json({ message: "Account not found or deactivated" });
        }

        req.user = { id: user.id, role: user.role };
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You do not have permission to perform this action" });
        }
        next();
    };
};