/**
 * PriceBadge Component
 * Displays Tezos price information with appropriate styling
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriceBadgeProps {
    price: string; // Price in tez (e.g., "5.50")
    label?: string; // Optional label (e.g., "Listed", "Floor", "Last Sale")
    variant?: "listing" | "floor" | "sale" | "default";
    className?: string;
}

export function PriceBadge({
    price,
    label,
    variant = "default",
    className,
}: PriceBadgeProps) {
    const variantStyles = {
        listing: "bg-blue-500/90 text-white hover:bg-blue-500",
        floor: "bg-green-500/90 text-white hover:bg-green-500",
        sale: "bg-gray-500/90 text-white hover:bg-gray-500",
        default: "bg-black/70 text-white hover:bg-black/80",
    };

    return (
        <Badge
            variant="secondary"
            className={cn(
                variantStyles[variant],
                "font-mono text-xs px-2 py-1",
                className
            )}
        >
            {label && <span className="mr-1">{label}:</span>}
            {price} ꜩ
        </Badge>
    );
}
