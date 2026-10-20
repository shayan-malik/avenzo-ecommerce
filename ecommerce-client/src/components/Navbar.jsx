import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth.js";

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logout ho gaya");
            navigate("/login");
        } catch {
            toast.error("Logout nahi ho saka");
        }
    };

    const linkClass = ({ isActive }) =>
        isActive
            ? "border-b-2 border-accent pb-1 font-semibold text-accent"
            : "pb-1 text-gray-300 hover:text-white";

    return (
        <header className="border-b border-border bg-bg">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link to="/" className="text-2xl font-extrabold text-accent">
                    {/* <img src="/avenzo-logo.png" alt="Avenzo-Logo" /> */}
                    Avenzo
                </Link>

                <div className="flex items-center gap-6 text-sm">
                    <NavLink to="/" end className={linkClass}>
                        Products
                    </NavLink>

                    {user && (
                        <NavLink to="/cart" className={linkClass}>
                            Cart
                        </NavLink>
                    )}

                    {user && (
                        <NavLink to="/orders" className={linkClass}>
                            Orders
                        </NavLink>
                    )}

                    {user?.role === "admin" && (
                        <NavLink to="/admin" className={linkClass}>
                            Admin
                        </NavLink>
                    )}

                    {!loading &&
                        (user ? (
                            <>
                                <span className="text-muted">{user.first_name}</span>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-lg border border-border px-3 py-1.5 hover:border-accent"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={linkClass}>
                                    Login
                                </NavLink>
                                <Link
                                    to="/signup"
                                    className="rounded-lg bg-accent px-3 py-1.5 font-semibold text-black hover:bg-accent-dark"
                                >
                                    Signup
                                </Link>
                            </>
                        ))}
                </div>
            </nav>
        </header>
    );
}