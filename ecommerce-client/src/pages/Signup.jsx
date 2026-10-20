import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";

const inputClass =
    "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent";

export default function Signup() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password.length < 6) {
            return toast.error("Password kam az kam 6 characters ka ho");
        }

        if (form.password !== form.confirm_password) {
            return toast.error("Dono passwords match nahi karte");
        }

        setSubmitting(true);

        try {
            await api.post("/auth/signup", {
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                phone: form.phone,
                password: form.password
            });

            // signup ke baad seedha login
            await login(form.email, form.password);

            toast.success("Account ban gaya");
            navigate("/");
        } catch (error) {
            toast.error(error.response?.data?.message || "Kuch masla ho gaya");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-[85vh] items-center justify-center px-4 py-8">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-2xl border border-border bg-surface p-8"
            >
                <h1 className="mb-6 text-2xl font-bold text-accent">Signup</h1>

                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <label className="mb-1 block text-sm text-muted">First name</label>
                        <input
                            name="first_name"
                            value={form.first_name}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-muted">Last name</label>
                        <input
                            name="last_name"
                            value={form.last_name}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>
                </div>

                <label className="mb-1 block text-sm text-muted">Email</label>
                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={`${inputClass} mb-4`}
                />

                <label className="mb-1 block text-sm text-muted">Phone (optional)</label>
                <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`${inputClass} mb-4`}
                />

                <label className="mb-1 block text-sm text-muted">Password</label>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={`${inputClass} mb-4`}
                />

                <label className="mb-1 block text-sm text-muted">Confirm password</label>
                <input
                    type="password"
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    required
                    className={`${inputClass} mb-6`}
                />

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-accent py-2.5 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
                >
                    {submitting ? "Wait..." : "Signup"}
                </button>

                <p className="mt-4 text-center text-sm text-muted">
                    Pehle se account hai?{" "}
                    <Link to="/login" className="text-accent hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}