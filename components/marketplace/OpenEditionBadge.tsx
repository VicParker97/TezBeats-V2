import { Badge } from "@/components/ui/badge";
import { Infinity } from "lucide-react";

interface OpenEditionBadgeProps {
    supply: number;
}

export function OpenEditionBadge({ supply }: OpenEditionBadgeProps) {
    return (
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 text-xs font-medium backdrop-blur-sm">
            <Infinity className="h-3 w-3 mr-1" />
            Open Edition
            <span className="ml-1 text-xs opacity-90">({supply.toLocaleString()} minted)</span>
        </Badge>
    );
}
