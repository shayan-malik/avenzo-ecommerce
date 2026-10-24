import express from "express";
import bcrypt from "bcrypt";
import { db } from "../db.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

router.post("/signup", async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ message: "Please fill in all required fields" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const cleanEmail = email.trim().toLowerCase();

        const existing = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [cleanEmail]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "This email is already registered" });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users (first_name, last_name, email, password_hash, phone)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, first_name, last_name, email, role`,
            [first_name.trim(), last_name.trim(), cleanEmail, password_hash, phone || null]
        );

        res.status(201).json({ message: "Signed up successfully", user: result.rows[0] });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please enter both email and password" });
        }

        const cleanEmail = email.trim().toLowerCase();

        const result = await db.query(
            `SELECT id, first_name, last_name, email, password_hash, role, is_active
             FROM users WHERE email = $1`,
            [cleanEmail]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "Incorrect email or password" });
        }

        if (!user.password_hash) {
            return res.status(400).json({
                message: "This account uses Google sign-in. Please use Continue with Google."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect email or password" });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: "Your account has been deactivated" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Logged in successfully",
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    res.json({ message: "Logged out successfully" });
});



router.post("/google", async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ message: "Google credential is missing" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.email_verified) {
            return res.status(400).json({ message: "Your Google email is not verified" });
        }

        const googleId = payload.sub;
        const email = payload.email.trim().toLowerCase();

        const existing = await db.query(
            `SELECT id, first_name, last_name, email, role, is_active, google_id
             FROM users WHERE google_id = $1 OR email = $2`,
            [googleId, email]
        );

        let user = existing.rows[0];

        if (user) {
            if (!user.is_active) {
                return res.status(403).json({ message: "Your account has been deactivated" });
            }

            // purana email wala account hai: Google se jod do
            if (!user.google_id) {
                await db.query("UPDATE users SET google_id = $1 WHERE id = $2", [googleId, user.id]);
            }
        } else {
            const firstName = (payload.given_name || payload.name || "User").trim();
            const lastName = (payload.family_name || "").trim();

            const created = await db.query(
                `INSERT INTO users (first_name, last_name, email, google_id)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, first_name, last_name, email, role`,
                [firstName, lastName, email, googleId]
            );

            user = created.rows[0];
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: "Logged in successfully",
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: "Google sign-in failed. Please try again." });
    }
});

export default router;