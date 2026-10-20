import { NavLink, Outlet } from "react-router-dom";

const tabs = [
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/products", label: "Products" }
];

export default function AdminLayout() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-3xl font-extrabold text-accent">Admin Panel</h1>

            <div className="mb-8 flex gap-2 border-b border-border">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        className={({ isActive }) =>
                            `-mb-px border-b-2 px-4 py-2 text-sm ${
                                isActive
                                    ? "border-accent font-semibold text-accent"
                                    : "border-transparent text-muted hover:text-white"
                            }`
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </div>

            <Outlet />
        </div>
    );
}