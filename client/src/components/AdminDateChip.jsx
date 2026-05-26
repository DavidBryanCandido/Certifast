import { Calendar } from "lucide-react";

function formatDate(compact) {
    return new Date().toLocaleDateString("en-US", {
        weekday: compact ? undefined : "long",
        year: "numeric",
        month: compact ? "short" : "long",
        day: "numeric",
    });
}

export default function AdminDateChip({ compact = false, style = {} }) {
    return (
        <div
            style={{
                fontSize: 11,
                color: "#9090aa",
                background: "#f8f6f1",
                border: "1px solid #e4dfd4",
                borderRadius: 4,
                padding: "5px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
                ...style,
            }}
        >
            <Calendar size={12} style={{ opacity: 0.65 }} />
            {formatDate(compact)}
        </div>
    );
}
