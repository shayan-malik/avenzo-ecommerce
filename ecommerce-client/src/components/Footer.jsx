import { ShieldCheck, Truck, Headset } from "lucide-react";
import Logo from "./Logo.jsx";

const year = new Date().getFullYear();

const features = [
    { icon: ShieldCheck, label: "Secure" },
    { icon: Truck, label: "Fast Delivery" },
    { icon: Headset, label: "24/7 Support" }
];

export default function Footer() {
    return (
        <footer className="mt-16 border-t border-border bg-bg">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row">
                <Logo className="h-16" />

                <div className="flex items-center gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.label}
                                className={`flex flex-col items-center gap-1 text-xs text-muted ${
                                    index > 0 ? "border-l border-border pl-8" : ""
                                }`}
                            >
                                <Icon className="h-6 w-6 text-accent" />
                                {feature.label}
                            </div>
                        );
                    })}
                </div>
            </div>

            <p className="border-t border-border py-4 text-center text-xs text-muted">
                © {year} Avenzo. All rights reserved.
            </p>
        </footer>
    );
}