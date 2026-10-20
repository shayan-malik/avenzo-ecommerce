import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import StatusBadge from "../../components/StatusBadge.jsx";
import { formatPrice } from "../../utils/formatPrice.js";
import { formatDate } from "../../utils/formatDate.js";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const fieldClass =
    "rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-50";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
    const loadOrders = async () => {
        try {
            const res = await api.get("/orders/admin/all", {
                params: { status: statusFilter }
            });
            setOrders(res.data);
        } catch {
            toast.error("Orders load nahi ho sake");
        } finally {
            setLoading(false);
        }
    };

    loadOrders();
}, [statusFilter, reloadKey]);

    const changeStatus = async (order, newStatus) => {
        if (newStatus === order.status) {
            return;
        }

        if (
            newStatus === "cancelled" &&
            !window.confirm("Order cancel karna hai? Ye wapas nahi ho sakta.")
        ) {
            return;
        }

        try {
            await api.put(`/orders/${order.id}/status`, { status: newStatus });
            toast.success(`Order #${order.id}: ${newStatus}`);
            setReloadKey((k) => k + 1);
        } catch (error) {
            toast.error(error.response?.data?.message || "Status update nahi hua");
        }
    };

    if (loading) {
        return <p className="text-muted">Loading...</p>;
    }

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted">{orders.length} orders</p>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={fieldClass}
                >
                    <option value="">All statuses</option>
                    {statuses.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>
            </div>

            {orders.length === 0 && <p className="text-muted">Koi order nahi mila</p>}

            <div className="space-y-6">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="rounded-2xl border border-border bg-surface p-5"
                    >
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="font-bold">Order #{order.id}</p>
                                <p className="text-sm text-muted">{formatDate(order.created_at)}</p>
                                <p className="mt-1 text-sm">
                                    {order.first_name} {order.last_name}
                                    <span className="text-muted"> · {order.email}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <StatusBadge status={order.status} />
                                <select
                                    value={order.status}
                                    onChange={(e) => changeStatus(order, e.target.value)}
                                    disabled={order.status === "cancelled"}
                                    className={fieldClass}
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="divide-y divide-border">
                            {order.items.map((item) => (
                                <div
                                    key={item.product_id}
                                    className="flex items-center justify-between py-2 text-sm"
                                >
                                    <span>{item.name}</span>
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