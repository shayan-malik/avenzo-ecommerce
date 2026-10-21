import { Link, Outlet } from "react-router-dom";

const year = new Date().getFullYear();

export default function AuthLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="px-4 py-4">
                <Link to="/" className="text-sm text-muted hover:text-accent">
                    ← Back to store
                </Link>
            </div>

            <main className="flex flex-1 items-center">
                <Outlet />
            </main>

            <p className="py-4 text-center text-xs text-muted">
                © {year} Avenzo. All rights reserved.
            </p>
        </div>
    );
}