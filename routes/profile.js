import express from "express";
import { db } from "../db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// is file ke saare routes ke liye login zaroori hai    
router.use(verifyToken);

// GET /api/profile : apni profile dekhna
router.get("/", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, first_name, last_name, email, phone, role, created_at
             FROM users WHERE id = $1`,
            [req.user.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /api/profile : apni profile update karna
router.put("/", async (req, res) => {
    try {
        const { first_name, last_name, phone } = req.body;

        if (!first_name || !last_name) {
            return res.status(400).json({ message: "First name aur last name lazmi hain" });
        }

        const result = await db.query(
            `UPDATE users
             SET first_name = $1, last_name = $2, phone = $3, updated_at = NOW()
             WHERE id = $4
             RETURNING id, first_name, last_name, email, phone, role`,
            [first_name.trim(), last_name.trim(), phone || null, req.user.id]
        );

        res.json({ message: "Profile update ho gayi", user: result.rows[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /api/profile : apna account band karna
router.delete("/", async (req, res) => {
    try {
        await db.query(
            "UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1",
            [req.user.id]
        );

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        res.json({ message: "Account delete ho gaya" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;