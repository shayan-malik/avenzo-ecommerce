import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/auth.js";
import Logo from "../components/Logo.jsx";
import FormInput from "../components/FormInput.jsx";

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
    <div className="flex w-full justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8"
      >
        <div className="mb-6 flex justify-center">
          <Logo className="h-24" />
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

        <div className="mb-6">
          <FormInput
            icon={Lock}
            type="password"
            name="password"
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent py-3 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
        >
          {submitting ? "Wait..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-accent hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
