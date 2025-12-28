"use client";

import { Sidebar } from "./Sidebar";
import { MusicPlayer } from "@/components/music/MusicPlayer";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="h-screen flex overflow-hidden">
            {/* Fixed Sidebar */}
            <aside className="fixed left-0 top-0 h-screen z-10">
                <Sidebar />
            </aside>

            {/* Main Content with left margin to account for fixed sidebar */}
            <div className="flex-1 flex flex-col overflow-hidden ml-64">
                {children}

                {/* Music Player - positioned in main content area */}
                <MusicPlayer />
            </div>
        </div>
    );
}
