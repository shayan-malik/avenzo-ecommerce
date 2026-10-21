import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import AuthLayout from "./components/AuthLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Orders from "./pages/Orders.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";

export default function App() {
    return (
        <Routes>
            {/* login/signup: bina navbar aur footer ke */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Route>

            {/* baqi sab pages: navbar + footer ke saath */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/orders"
                    element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute adminOnly>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="orders" replace />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="products" element={<AdminProducts />} />
                </Route>

                <Route path="*" element={<p className="p-8 text-muted">Page nahi mila</p>} />
            </Route>
        </Routes>
    );
}