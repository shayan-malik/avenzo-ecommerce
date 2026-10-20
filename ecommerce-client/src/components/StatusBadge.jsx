const styles = {
    pending: "bg-amber-950 text-accent",
    processing: "bg-blue-950 text-blue-400",
    shipped: "bg-purple-950 text-purple-400",
    delivered: "bg-green-950 text-green-400",
    cancelled: "bg-red-950 text-red-400"
};

export default function StatusBadge({ status }) {
    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                styles[status] || "bg-surface-2 text-muted"
            }`}
        >
            {status}
        </span>
    );
}