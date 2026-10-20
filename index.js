import express from "express";
import cookieParser from "cookie-parser";
import { db } from "./db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";






const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);


app.get("/", (req, res) => {
    res.send("Hello EXPRESS from 5000 PORT");
});


app.get("/db-test", async (req, res) => {
    try{
        const result = await db.query("SELECT NOW()");
        res.send(result.rows);
        
    }

    catch(error){
        res.status(500).send({message: "Server error"})
        console.log(error, "error");
    }

})


app.listen(PORT, () => {
    console.log("Server Running on PORT", PORT);
});

