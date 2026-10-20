import jwt from "jsonwebtoken";
import { db } from "../db.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Pehle login karein" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await db.query(
            "SELECT id, role, is_active FROM users WHERE id = $1",
            [decoded.id]
        );

        const user = result.rows[0];

        if (!user || !user.is_active) {
            return res.status(401).json({ message: "Account maujood nahi ya band hai" });
        }

        req.user = { id: user.id, role: user.role };
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token galat ya expire ho gaya" });
        }
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Aapko is kaam ki ijazat nahi" });
        }
        next();
    };
};