import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
    category_id: ""
};

const inputClass =
    "w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent";

export default function AdminProducts() {
    const [form, setForm] = useState(emptyForm);
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await api.get("/categories");
                setCategories(res.data);
            } catch {
                toast.error("Categories load nahi ho sakin");
            }
        };

        loadCategories();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await api.post("/products", {
                name: form.name,
                description: form.description,
                price: Number(form.price),
                stock: form.stock === "" ? 0 : Number(form.stock),
                image_url: form.image_url,
                category_id: Number(form.category_id)
            });

            toast.success("Product add ho gaya");
            setForm(emptyForm);
        } catch (error) {
            toast.error(error.response?.data?.message || "Product add nahi ho saka");
        } finally {
            setSaving(false);
        }
    };

    if (categories.length === 0) {
        return (
            <p className="text-muted">
                Product add karne se pehle{" "}
                <Link to="/admin/categories" className="text-accent hover:underline">
                    category add karein
                </Link>
                .
            </p>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-2xl rounded-2xl border border-border bg-surface p-6"
        >
            <h2 className="mb-6 text-xl font-bold">Naya product</h2>

            <label className="mb-1 block text-sm text-muted">Name</label>
            <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={`${inputClass} mb-4`}
            />

            <label className="mb-1 block text-sm text-muted">Description</label>
            <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className={`${inputClass} mb-4`}
            />

            <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm text-muted">Price</label>
                    <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm text-muted">Stock</label>
                    <input
                        type="number"
                        name="stock"
                        min="0"
                        step="1"
                        value={form.stock}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>
            </div>

            <label className="mb-1 block text-sm text-muted">Category</label>
            <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                className={`${inputClass} mb-4`}
            >
                <option value="">Category chunein</option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.name}
                    </option>
                ))}
            </select>

            <label className="mb-1 block text-sm text-muted">Image URL</label>
            <input
                type="url"
                name="image_url"
                placeholder="https://..."
                value={form.image_url}
                onChange={handleChange}
                className={`${inputClass} mb-4`}
            />

            {form.image_url && (
                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-surface-2">
                    <img
                        src={form.image_url}
                        alt="Preview"
                        className="h-full w-full object-contain p-2"
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-accent py-3 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
            >
                {saving ? "Wait..." : "Product add karein"}
            </button>
        </form>
    );
}