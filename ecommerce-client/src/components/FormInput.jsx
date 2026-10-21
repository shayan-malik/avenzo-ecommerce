import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function FormInput({ icon: Icon, type = "text", ...props }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="relative">
            {Icon && (
                <Icon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            )}

            <input
                type={isPassword && show ? "text" : type}
                {...props}
                className={`w-full rounded-lg border border-border bg-surface-2 py-3 outline-none focus:border-accent ${
                    Icon ? "pl-10" : "pl-3"
                } ${isPassword ? "pr-10" : "pr-3"}`}
            />

            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    aria-label="Password dikhayein ya chhupayein"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                >
                    {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            )}
        </div>
    );
}