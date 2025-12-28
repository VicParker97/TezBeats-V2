"use client";

import { useState } from "react";
import { useKeyboardShortcuts } from "@/lib/keyboard/useKeyboardShortcuts";
import { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
    const [showHelp, setShowHelp] = useState(false);

    // Initialize keyboard shortcuts
    useKeyboardShortcuts();

    // TODO: Add listener for '?' key to show help dialog

    return (
        <>
            {children}
            <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
        </>
    );
}
