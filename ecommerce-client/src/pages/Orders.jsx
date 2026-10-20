import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge.jsx";
import { formatPrice } from "../utils/formatPrice.js";
import { formatDate } from "../utils/formatDate.js";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await api.get("/orders");
                setOrders(res.data);
            } catch {
                toast.error("Orders load nahi ho sake");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, []);

    if (loading) {
        return <p className="p-8 text-muted">Loading...</p>;
    }

    if (orders.length === 0) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-extrabold text-accent">My Orders</h1>
                <p className="mt-4 text-muted">Aap ne abhi tak koi order nahi diya</p>
                <Link
                    to="/"
                    className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-black hover:bg-accent-dark"
                >
                    Shopping shuru karein
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <h1 className="mb-6 text-3xl font-extrabold text-accent">My Orders</h1>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="rounded-2xl border border-border bg-surface p-5"
                    >
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="font-bold">Order #{order.id}</p>
                                <p className="text-sm text-muted">{formatDate(order.created_at)}</p>
                            </div>
                            <StatusBadge status={order.status} />
                        </div>

                        <div className="divide-y divide-border">
                            {order.items.map((item) => (
                                <div
                                    key={item.product_id}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <Link
                                        to={`/products/${item.product_id}`}
                                        className="hover:text-accent"
                                    >
                                        {item.name}
                                    </Link>
                                    <span className="text-muted">
                                        {item.quantity} × {formatPrice(item.price)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t border-border pt-4">
                            <p className="text-sm text-muted">Ship to: {order.shipping_address}</p>
                            <p className="text-lg font-bold text-accent">
                                {formatPrice(order.total_amount)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}