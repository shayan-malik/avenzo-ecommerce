import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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
  }, [reloadKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Category ka naam likhein");
    }

    setSaving(true);

    try {
      await api.post("/categories", { name });
      toast.success("Category add ho gayi");
      setName("");
      setReloadKey((k) => k + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Category add nahi ho saki");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="Nayi category (jaise Beauty)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2 font-semibold text-black hover:bg-accent-dark disabled:opacity-60"
        >
          {saving ? "Wait..." : "Add"}
        </button>
      </form>

      <h2 className="mb-3 text-lg font-bold">
        Categories ({categories.length})
      </h2>

      {categories.length === 0 ? (
        <p className="text-muted">Abhi koi category nahi</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category.id}
              className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm"
            >
              {category.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
