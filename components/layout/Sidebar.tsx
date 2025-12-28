"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Library, ListMusic, ShoppingBag, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Playlist } from "@/components/music/Playlist";

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const [isQueueExpanded, setIsQueueExpanded] = useState(false);

    const navItems = [
        { href: "/", label: "Dashboard", icon: Home },
        { href: "/library", label: "Library", icon: Library },
        { href: "/playlists", label: "Playlists", icon: ListMusic },
        { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    ];

    return (
        <div
            className={cn(
                "relative w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col h-full pt-16",
                className
            )}
        >
            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className="w-full justify-start"
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Queue Section */}
            <div className="mt-auto border-t">
                {/* Queue Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="font-semibold text-sm">Queue</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsQueueExpanded(!isQueueExpanded)}
                        className="h-8 w-8"
                        title={isQueueExpanded ? "Collapse Queue" : "Expand Queue"}
                    >
                        {isQueueExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronUp className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Queue Content */}
                {isQueueExpanded && (
                    <div className="h-[300px] overflow-hidden">
                        <Playlist />
                    </div>
                )}
            </div>
        </div>
    );
}
