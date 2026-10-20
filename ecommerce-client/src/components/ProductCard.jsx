import { Link } from "react-router-dom";
import { formatPrice } from "../utils/formatPrice.js";

export default function ProductCard({ product }) {
    const { id, name, price, stock, image_url, category_name } = product;

    let stockText = "In stock";
    let stockClass = "bg-surface-2 text-muted";

    if (stock === 0) {
        stockText = "Out of stock";
        stockClass = "bg-red-950 text-red-400";
    } else if (stock <= 5) {
        stockText = `Only ${stock} left`;
        stockClass = "bg-amber-950 text-accent";
    }

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:border-accent">
            <div className="relative flex h-56 items-center justify-center bg-surface-2">
                {category_name && (
                    <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-black">
                        {category_name}
                    </span>
                )}

                {image_url ? (
                    <img
                        src={image_url}
                        alt={name}
                        loading="lazy"
                        className="h-full w-full object-contain p-4"
                    />
                ) : (
                    <span className="text-sm text-muted">No image</span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <h3 className="truncate text-lg font-bold" title={name}>
                    {name}
                </h3>

                <div className="mt-4 flex items-end justify-between">
                    <div>
                        <p className="text-xs text-muted">Price</p>
                        <p className="text-xl font-bold text-accent">{formatPrice(price)}</p>
                    </div>

                    <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${stockClass}`}>
                        {stockText}
                    </span>
                </div>

                <Link
                    to={`/products/${id}`}
                    className="mt-4 rounded-lg bg-accent py-2.5 text-center font-semibold text-black hover:bg-accent-dark"
                >
                    View Product →
                </Link>
            </div>
        </div>
    );
}