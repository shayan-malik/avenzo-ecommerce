import express from "express";
import { db } from "../db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// GET /api/cart : meri cart
router.get("/", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT ci.id, ci.product_id, ci.quantity,
                    p.name, p.price, p.image_url, p.stock,
                    (p.price * ci.quantity) AS line_total
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.user_id = $1
             ORDER BY ci.created_at DESC`,
            [req.user.id]
        );

        const total = result.rows.reduce((sum, item) => sum + Number(item.line_total), 0);

        res.json({ items: result.rows, total: Number(total.toFixed(2)) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /api/cart : cart mein product add karna
router.post("/", async (req, res) => {
    try {
        const product_id = Number(req.body.product_id);
        const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity);

        if (!Number.isInteger(product_id) || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: "Please provide a valid product_id and quantity" });
        }

        const productResult = await db.query(
            "SELECT stock FROM products WHERE id = $1",
            [product_id]
        );

        const product = productResult.rows[0];

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const existingResult = await db.query(
            "SELECT quantity FROM cart_items WHERE user_id = $1 AND product_id = $2",
            [req.user.id, product_id]
        );

        const existingQty = existingResult.rows[0] ? existingResult.rows[0].quantity : 0;
        const newQty = existingQty + quantity;

        if (newQty > product.stock) {
            return res.status(400).json({ message: `Only ${product.stock} items are in stock` });
        }

        const result = await db.query(
            `INSERT INTO cart_items (user_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, product_id)
             DO UPDATE SET quantity = EXCLUDED.quantity
             RETURNING id, product_id, quantity`,
            [req.user.id, product_id, newQty]
        );

        res.status(201).json({ message: "Added to cart", item: result.rows[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /api/cart/:id : quantity badalna (id = cart item ki id)
router.put("/:id", async (req, res) => {
    try {
        const itemId = Number(req.params.id);
        const quantity = Number(req.body.quantity);

        if (!Number.isInteger(itemId) || !Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be a whole number (1 or more)" });
        }

        const check = await db.query(
            `SELECT p.stock
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.id = $1 AND ci.user_id = $2`,
            [itemId, req.user.id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        if (quantity > check.rows[0].stock) {
            return res.status(400).json({ message: `Only ${check.rows[0].stock} items are in stock` });
        }

        const result = await db.query(
            `UPDATE cart_items SET quantity = $1
             WHERE id = $2 AND user_id = $3
             RETURNING id, product_id, quantity`,
            [quantity, itemId, req.user.id]
        );

        res.json({ message: "Quantity updated successfully", item: result.rows[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /api/cart/:id : cart se hatana
router.delete("/:id", async (req, res) => {
    try {
        const itemId = Number(req.params.id);

        if (!Number.isInteger(itemId)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        const result = await db.query(
            "DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id",
            [itemId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.json({ message: "Removed from cart" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;