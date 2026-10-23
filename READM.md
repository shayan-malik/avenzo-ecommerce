# Avenzo - Backend API

REST API for **Avenzo**, a full-stack e-commerce app. Built with Node.js, Express and PostgreSQL (Neon), using plain SQL (`pg`) with no ORM.

- **Live API:** https://avenzo-ecommerce.vercel.app/
- **Live app:** https://avenzo-plum.vercel.app/
- **Frontend repo:** https://github.com/shayan-malik/avenzo

## Features

- JWT authentication stored in an httpOnly cookie, passwords hashed with bcrypt
- Role-based access control (`user` and `admin`) through `verifyToken` and `requireRole` middleware
- Products with search, category filter, sorting and pagination
- Cart with stock validation
- Checkout inside a PostgreSQL transaction: create order, decrement stock, clear cart (rows are locked to prevent overselling)
- Admin order management, with stock restored when an order is cancelled
- Admin-only image upload to Cloudinary (multer memory storage, serverless friendly)
- Parameterized queries only, protection against SQL injection
- `helmet`, request body size limit and rate limiting (stricter on login and signup)

## Tech Stack

Node.js, Express (ES modules), PostgreSQL (Neon), `pg`, JWT, bcrypt, multer, Cloudinary, helmet, express-rate-limit. Deployed on Vercel.

## API Overview

| Route group | Access | Description |
| --- | --- | --- |
| `/api/auth` | Public | Sign up, log in, log out |
| `/api/profile` | Logged in | Get, update and deactivate own profile |
| `/api/categories` | GET public, others admin | List, add, rename, delete |
| `/api/products` | GET public, others admin | List (search, filter, sort, pagination), detail, add, edit, delete |
| `/api/cart` | Logged in | Get cart, add item, update quantity, remove item |
| `/api/orders` | Logged in / admin | Checkout, my orders, all orders and status update (admin) |
| `/api/upload` | Admin | Upload a product image |

## Run Locally

```bash
git clone https://github.com/shayan-malik/avenzo-ecommerce
cd avenzo-ecommerce
npm install
```

Create a `.env` file:

```env
PORT=5000
PGHOST=your-neon-host
PGDATABASE=your-db-name
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGPORT=5432
JWT_SECRET=a-long-random-string
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

## Project Structure

```
.
├── index.js               # Express app and middleware setup
├── db.js                  # pg Pool (Neon)
├── config/
│   └── cloudinary.js
├── middleware/
│   └── authMiddleware.js  # verifyToken, requireRole
└── routes/
    ├── auth.js
    ├── profile.js
    ├── categories.js
    ├── products.js
    ├── cart.js
    ├── orders.js
    └── upload.js
```

## Author

**Shayan Malik**

- GitHub: https://github.com/shayan-malik
- LinkedIn: https://www.linkedin.com/in/shayan-malik-43a93139b/
