import express from "express";
import { db } from "../db.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

// POST /api/orders : checkout (cart se order banana)
router.post("/", async (req, res) => {
    const { shipping_address } = req.body;

    if (!shipping_address || !shipping_address.trim()) {
        return res.status(400).json({ message: "Please enter a shipping address" });
    }

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        // cart ke items, saath mein product rows lock (FOR UPDATE)
        const cartResult = await client.query(
            `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.user_id = $1
             ORDER BY p.id
             FOR UPDATE OF p`,
            [req.user.id]
        );

        const items = cartResult.rows;

        if (items.length === 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Your cart is empty" });
        }

        let total = 0;

        for (const item of items) {
            if (item.quantity > item.stock) {
                await client.query("ROLLBACK");
                return res.status(400).json({
                    message: `Not enough stock for ${item.name} (only ${item.stock} left)`
                });
            }
            total += Number(item.price) * item.quantity;
        }

        total = Number(total.toFixed(2));

        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total_amount, shipping_address)
             VALUES ($1, $2, $3)
             RETURNING id, total_amount, status, shipping_address, created_at`,
            [req.user.id, total, shipping_address.trim()]
        );

        const order = orderResult.rows[0];

        for (const item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4)`,
                [order.id, item.product_id, item.quantity, item.price]
            );

            await client.query(
                "UPDATE products SET stock = stock - $1 WHERE id = $2",
                [item.quantity, item.product_id]
            );
        }

        await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);

        await client.query("COMMIT");

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        await client.query("ROLLBACK");
        console.log(error);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
});

// GET /api/orders : mere orders
router.get("/", async (req, res) => {
    try {
        const ordersResult = await db.query(
            `SELECT id, total_amount, status, shipping_address, created_at
             FROM orders
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        const orders = ordersResult.rows;

        if (orders.length === 0) {
            return res.json([]);
        }

        const orderIds = orders.map((order) => order.id);

        const itemsResult = await db.query(
            `SELECT oi.order_id, oi.product_id, p.name, oi.quantity, oi.price
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ANY($1)`,
            [orderIds]
        );

        orders.forEach((order) => {
            order.items = itemsResult.rows.filter((item) => item.order_id === order.id);
        });

        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


// GET /api/orders/admin/all : admin sab orders dekhe (?status=pending se filter)
router.get("/admin/all", requireRole("admin"), async (req, res) => {
    try {
        const { status } = req.query;

        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const values = [];
        let where = "";

        if (status) {
            values.push(status);
            where = "WHERE o.status = $1";
        }

        const ordersResult = await db.query(
            `SELECT o.id, o.total_amount, o.status, o.shipping_address, o.created_at,
                    u.first_name, u.last_name, u.email
             FROM orders o
             JOIN users u ON u.id = o.user_id
             ${where}
             ORDER BY o.created_at DESC`,
            values
        );

        const orders = ordersResult.rows;

        if (orders.length === 0) {
            return res.json([]);
        }

        const orderIds = orders.map((order) => order.id);

        const itemsResult = await db.query(
            `SELECT oi.order_id, oi.product_id, p.name, oi.quantity, oi.price
             FROM order_items oi
             JOIN products p ON p.id = oi.product_id
             WHERE oi.order_id = ANY($1)`,
            [orderIds]
        );

        orders.forEach((order) => {
            order.items = itemsResult.rows.filter((item) => item.order_id === order.id);
        });

        res.json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /api/orders/:id/status : admin order ka status badle
router.put("/:id/status", requireRole("admin"), async (req, res) => {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(orderId) || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid order id or status" });
    }

    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const current = await client.query(
            "SELECT status FROM orders WHERE id = $1 FOR UPDATE",
            [orderId]
        );

        if (current.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Order not found" });
        }

        if (current.rows[0].status === "cancelled") {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "A cancelled order cannot be changed again" });
        }

        // cancel karne par stock wapas
        if (status === "cancelled") {
            await client.query(
                `UPDATE products AS p
                 SET stock = p.stock + oi.quantity
                 FROM order_items oi
                 WHERE oi.order_id = $1 AND oi.product_id = p.id`,
                [orderId]
            );
        }

        const result = await client.query(
            `UPDATE orders SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING id, status, updated_at`,
            [status, orderId]
        );

        await client.query("COMMIT");

        res.json({ message: "Order status updated successfully", order: result.rows[0] });
    } catch (error) {
        await client.query("ROLLBACK");
        console.log(error);
        res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
});

export default router;