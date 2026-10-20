import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/auth.js";
import { formatPrice } from "../utils/formatPrice.js";


export default function ProductDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            setNotFound(false);

            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
                setQuantity(1);
            } catch (error) {
                const status = error.response?.status;

                if (status === 404 || status === 400) {
                    setNotFound(true);
                } else {
                    toast.error("Product load nahi ho saka");
                }
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id]);

    const addToCart = async (goToCart) => {
        if (!user) {
            toast.error("Pehle login karein");
            return navigate("/login");
        }

        setAdding(true);

        try {
            await api.post("/cart", { product_id: product.id, quantity });
            toast.success("Cart mein add ho gaya");

            if (goToCart) {
                navigate("/cart");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Kuch masla ho gaya");
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return <p className="p-8 text-muted">Loading...</p>;
    }

    if (notFound || !product) {
        return (
            <div className="p-8">
                <p className="text-muted">Product nahi mila</p>
                <Link to="/" className="mt-4 inline-block text-accent hover:underline">
                    ← Products pe wapas
                </Link>
            </div>
        );
    }

    const outOfStock = product.stock === 0;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <Link to="/" className="mb-6 inline-block text-sm text-muted hover:text-accent">
                ← Back to products
            </Link>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-surface-2">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-contain p-6"
                        />
                    ) : (
                        <span className="text-muted">No image</span>
                    )}
                </div>

                <div>
                    {product.category_name && (
                        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-black">
                            {product.category_name}
                        </span>
                    )}

                    <h1 className="mt-3 text-3xl font-extrabold">{product.name}</h1>

                    <p className="mt-4 text-3xl font-bold text-accent">
                        {formatPrice(product.price)}
                    </p>

                    {product.description && (
                        <p className="mt-4 leading-relaxed text-muted">{product.description}</p>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-surface p-4">
                        <div className="rounded-lg border border-border p-3">
                            <p className="text-xs text-muted">Stock</p>
                            <p className="font-semibold">
                                {outOfStock ? "Out of stock" : `${product.stock} items`}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border p-3">
                            <p className="text-xs text-muted">Category</p>
                            <p className="font-semibold">{product.category_name || "-"}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-4">
                        <span className="text-sm text-muted">Quantity</span>
                        <div className="flex items-center rounded-lg border border-border">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                disabled={outOfStock}
                                className="px-4 py-2 hover:text-accent disabled:opacity-40"
                            >
                                −
                            </button>
                            <span className="min-w-8 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                disabled={outOfStock}
                                className="px-4 py-2 hover:text-accent disabled:opacity-40"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={() => addToCart(false)}
                            disabled={outOfStock || adding}
                            className="flex-1 rounded-lg bg-accent py-3 font-semibold text-black hover:bg-accent-dark disabled:opacity-50"
                        >
                            {outOfStock ? "Out of stock" : "Add To Cart"}
                        </button>

                        <button
                            onClick={() => addToCart(true)}
                            disabled={outOfStock || adding}
                            className="flex-1 rounded-lg border border-border py-3 font-semibold hover:border-accent disabled:opacity-50"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}