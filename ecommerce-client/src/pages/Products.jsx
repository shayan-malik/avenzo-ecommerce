import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import ProductCard from "../components/ProductCard.jsx";

const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" }
];

const fieldClass =
    "rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:border-accent";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);

    // categories sirf ek dafa
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await api.get("/categories");
                setCategories(res.data);
            } catch (error) {
                console.log(error);
            }
        };

        loadCategories();
    }, []);

    // search: typing rukne ke 500ms baad hi search chalao
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchInput]);

    // products: filters ya page badle to dobara lao
    useEffect(() => {
        let ignore = false;

        const loadProducts = async () => {
            setLoading(true);

            try {
                const res = await api.get("/products", {
                    params: { search, category, sort, page, limit: 8 }
                });

                if (!ignore) {
                    setProducts(res.data.products);
                    setTotalPages(res.data.totalPages);
                }
            } catch {
                if (!ignore) {
                    toast.error("Products load nahi ho sake");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            ignore = true;
        };
    }, [search, category, sort, page]);

    const changePage = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-3xl font-extrabold text-accent">Products</h1>

            <div className="mb-8 flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={`${fieldClass} min-w-60 flex-1`}
                />

                <select
                    value={category}
                    onChange={(e) => {
                        setCategory(e.target.value);
                        setPage(1);
                    }}
                    className={fieldClass}
                >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <select
                    value={sort}
                    onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                    }}
                    className={fieldClass}
                >
                    {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {loading && products.length === 0 && <p className="text-muted">Loading...</p>}

            {!loading && products.length === 0 && (
                <p className="text-muted">Koi product nahi mila</p>
            )}

            {products.length > 0 && (
                <div
                    className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                        loading ? "opacity-50" : ""
                    }`}
                >
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                    <button
                        onClick={() => changePage(page - 1)}
                        disabled={page === 1}
                        className="rounded-lg border border-border px-4 py-2 hover:border-accent disabled:opacity-40"
                    >
                        ← Prev
                    </button>

                    <span className="text-muted">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => changePage(page + 1)}
                        disabled={page === totalPages}
                        className="rounded-lg border border-border px-4 py-2 hover:border-accent disabled:opacity-40"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}