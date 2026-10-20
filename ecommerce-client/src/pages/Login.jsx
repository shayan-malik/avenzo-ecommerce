import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth.js";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await login(form.email, form.password);
            toast.success("Login ho gaya");
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || "Kuch masla ho gaya");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[85vh] items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8"
            >
                <h1 className="mb-6 text-2xl font-bold text-accent">Login</h1>

                <label className="mb-1 block text-sm text-muted">Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="mb-4 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
                />

                <label className="mb-1 block text-sm text-muted">Password</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="mb-6 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
                />

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-accent py-2.5 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
                >
                    {submitting ? "Wait..." : "Login"}
                </button>

                <p className="mt-4 text-center text-sm text-muted">
                    Account nahi hai?{" "}
                    <Link to="/signup" className="text-accent hover:underline">
                        Signup
                    </Link>
                </p>
            </form>
        </div>
    );
}