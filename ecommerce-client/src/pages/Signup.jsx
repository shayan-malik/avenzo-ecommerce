import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";
import Logo from "../components/Logo.jsx";
import FormInput from "../components/FormInput.jsx";

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
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
        password: form.password,
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
    <div className="flex w-full justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-8"
      >
        <div className="mb-6 flex justify-center">
          <Logo className="h-24" />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <FormInput
            icon={User}
            name="first_name"
            placeholder="First name"
            aria-label="First name"
            autoComplete="given-name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <FormInput
            icon={User}
            name="last_name"
            placeholder="Last name"
            aria-label="Last name"
            autoComplete="family-name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <FormInput
            icon={Mail}
            type="email"
            name="email"
            placeholder="Email address"
            aria-label="Email address"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-4">
          <FormInput
            icon={Phone}
            name="phone"
            placeholder="Phone (optional)"
            aria-label="Phone"
            autoComplete="tel"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <FormInput
            icon={Lock}
            type="password"
            name="password"
            placeholder="Password"
            aria-label="Password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-6">
          <FormInput
            icon={Lock}
            type="password"
            name="confirm_password"
            placeholder="Confirm password"
            aria-label="Confirm password"
            autoComplete="new-password"
            value={form.confirm_password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
        >
          {submitting ? "Wait..." : "Sign up"}
        </button>

        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-accent hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
