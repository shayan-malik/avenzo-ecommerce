import express from "express";
import { db } from "../db.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/products : search, filter, sort, pagination (public)
router.get("/", async (req, res) => {
    try {
        const { search, category, min_price, max_price, sort } = req.query;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
        const offset = (page - 1) * limit;

        const conditions = [];
        const values = [];

        if (search) {
            values.push(`%${search}%`);
            conditions.push(`p.name ILIKE $${values.length}`);
        }

        if (category) {
            values.push(category);
            conditions.push(`p.category_id = $${values.length}`);
        }

        if (min_price) {
            values.push(min_price);
            conditions.push(`p.price >= $${values.length}`);
        }

        if (max_price) {
            values.push(max_price);
            conditions.push(`p.price <= $${values.length}`);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        const sortOptions = {
            newest: "p.created_at DESC",
            price_asc: "p.price ASC",
            price_desc: "p.price DESC",
            name_asc: "p.name ASC"
        };
        const orderBy = sortOptions[sort] || sortOptions.newest;

        const countResult = await db.query(
            `SELECT COUNT(*) FROM products p ${where}`,
            values
        );
        const total = Number(countResult.rows[0].count);

        const result = await db.query(
            `SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url,
                    p.category_id, c.name AS category_name
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             ${where}
             ORDER BY ${orderBy}
             LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
            [...values, limit, offset]
        );

        res.json({
            products: result.rows,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


// GET /api/products/:id : ek product ki detail (public)
router.get("/:id", async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId)) {
            return res.status(400).json({ message: "Galat product id" });
        }

        const result = await db.query(
            `SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url,
                    p.category_id, c.name AS category_name, p.created_at
             FROM products p
             LEFT JOIN categories c ON c.id = p.category_id
             WHERE p.id = $1`,
            [productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product nahi mila" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


// POST /api/products : sirf admin
router.post("/", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const { name, description, price, stock, image_url, category_id } = req.body;

        if (!name || price === undefined || !category_id) {
            return res.status(400).json({ message: "Name, price aur category lazmi hain" });
        }

        const priceNum = Number(price);
        const stockNum = stock === undefined ? 0 : Number(stock);

        if (isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({ message: "Price sahi number ho (0 ya zyada)" });
        }

        if (!Number.isInteger(stockNum) || stockNum < 0) {
            return res.status(400).json({ message: "Stock poora number ho (0 ya zyada)" });
        }

        const result = await db.query(
            `INSERT INTO products (name, description, price, stock, image_url, category_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name.trim(), description || null, priceNum, stockNum, image_url || null, category_id]
        );

        res.status(201).json({ message: "Product add ho gaya", product: result.rows[0] });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({ message: "Ye category maujood nahi" });
        }
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


// PUT /api/products/:id : sirf admin product edit kar sakta hai
router.put("/:id", verifyToken, requireRole("admin"), async (req, res) => {
    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId)) {
            return res.status(400).json({ message: "Galat product id" });
        }

        const { name, description, price, stock, image_url, category_id } = req.body;

        if (!name || price === undefined || !category_id) {
            return res.status(400).json({ message: "Name, price aur category lazmi hain" });
        }

        const priceNum = Number(price);
        const stockNum = stock === undefined ? 0 : Number(stock);

        if (isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({ message: "Price sahi number ho (0 ya zyada)" });
        }

        if (!Number.isInteger(stockNum) || stockNum < 0) {
            return res.status(400).json({ message: "Stock poora number ho (0 ya zyada)" });
        }

        const result = await db.query(
            `UPDATE products
             SET name = $1, description = $2, price = $3, stock = $4,
                 image_url = $5, category_id = $6
             WHERE id = $7
             RETURNING *`,
            [name.trim(), description || null, priceNum, stockNum, image_url || null, category_id, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Product nahi mila" });
        }

        res.json({ message: "Product update ho gaya", product: result.rows[0] });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({ message: "Ye category maujood nahi" });
        }
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


// DELETE /api/products/:id : sirf admin product delete kar sakta hai
router.delete("/:id", verifyToken, requireRole("admin"), async (req, res) => {
    const client = await db.connect();

    try {
        const productId = Number(req.params.id);

        if (!Number.isInteger(productId)) {
            return res.status(400).json({ message: "Galat product id" });
        }

        await client.query("BEGIN");

        // pehle logon ke cart se ye product hatao
        await client.query("DELETE FROM cart_items WHERE product_id = $1", [productId]);

        const result = await client.query(
            "DELETE FROM products WHERE id = $1 RETURNING id",
            [productId]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Product nahi mila" });
        }

        await client.query("COMMIT");
        res.json({ message: "Product delete ho gaya" });
    } catch (error) {
        await client.query("ROLLBACK");

        if (error.code === "23503") {
            return res.status(409).json({
                message: "Ye product kisi order mein maujood hai, isliye delete nahi ho sakta"
            });
        }

        console.log(error);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
});


export default router;