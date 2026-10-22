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


// PUT /api/categories/:id : sirf admin category ka naam badal sakta hai
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const categoryId = Number(req.params.id);

        if (!Number.isInteger(categoryId)) {
            return res.status(400).json({ message: "Galat category id" });
        }

        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Category ka naam dein" });
        }

        const result = await db.query(
            "UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name",
            [name.trim(), categoryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category nahi mili" });
        }

        res.json({ message: "Category update ho gayi", category: result.rows[0] });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "Ye naam pehle se maujood hai" });
        }
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


// DELETE /api/categories/:id : sirf admin category delete kar sakta hai
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const categoryId = Number(req.params.id);

        if (!Number.isInteger(categoryId)) {
            return res.status(400).json({ message: "Galat category id" });
        }

        const result = await db.query(
            "DELETE FROM categories WHERE id = $1 RETURNING id",
            [categoryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category nahi mili" });
        }

        res.json({ message: "Category delete ho gayi" });
    } catch (error) {
            if (error.code === "23503" || error.code === "23001") {
            return res.status(409).json({
                message: "Is category mein products maujood hain, pehle unhein hatayein ya doosri category mein daalein"
            });
        }
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


export default router;