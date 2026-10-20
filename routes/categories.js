import express from "express";
import { db } from "../db.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/categories : sab categories (login ki zaroorat nahi)
router.get("/", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, name FROM categories ORDER BY name"
        );

        res.json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/categories : sirf admin nayi category add kar sakta hai
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Category ka naam dein" });
        }

        const result = await db.query(
            "INSERT INTO categories (name) VALUES ($1) RETURNING id, name",
            [name.trim()]
        );

        res.status(201).json({
            message: "Category add ho gayi",
            category: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "Ye category pehle se maujood hai" });
        }
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;