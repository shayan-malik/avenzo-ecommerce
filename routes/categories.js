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
            return res.status(400).json({ message: "Please enter a category name" });
        }

        const result = await db.query(
            "INSERT INTO categories (name) VALUES ($1) RETURNING id, name",
            [name.trim()]
        );

        res.status(201).json({
            message: "Category added successfully",
            category: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "This category already exists" });
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
            return res.status(400).json({ message: "Invalid category id" });
        }

        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Please enter a category name" });
        }

        const result = await db.query(
            "UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name",
            [name.trim(), categoryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category updated successfully", category: result.rows[0] });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "This name already exists" });
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
            return res.status(400).json({ message: "Invalid category id" });
        }

        const result = await db.query(
            "DELETE FROM categories WHERE id = $1 RETURNING id",
            [categoryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
            if (error.code === "23503" || error.code === "23001") {
            return res.status(409).json({
                message: "This category has products. Remove them or move them to another category first."
            });
        }
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


export default router;