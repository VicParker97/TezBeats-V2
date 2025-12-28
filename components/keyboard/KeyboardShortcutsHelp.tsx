"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsHelpProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const shortcuts = [
    {
        category: "Playback",
        items: [
            { keys: ["Space"], description: "Play / Pause" },
            { keys: ["→"], description: "Next track" },
            { keys: ["←"], description: "Previous track" },
            { keys: ["Shift", "→"], description: "Seek forward 10s" },
            { keys: ["Shift", "←"], description: "Seek backward 10s" },
            { keys: ["↑"], description: "Volume up" },
            { keys: ["↓"], description: "Volume down" },
            { keys: ["M"], description: "Toggle mute" },
        ],
    },
    {
        category: "Actions",
        items: [
            { keys: ["F"], description: "Toggle favorite" },
            { keys: ["R"], description: "Toggle repeat" },
            { keys: ["S"], description: "Toggle shuffle" },
        ],
    },
    {
        category: "Navigation",
        items: [
            { keys: ["G", "D"], description: "Go to Dashboard" },
            { keys: ["G", "L"], description: "Go to Library" },
            { keys: ["/"], description: "Focus search" },
        ],
    },
];

export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                        Use these keyboard shortcuts to navigate and control playback
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {shortcuts.map((section) => (
                        <div key={section.category}>
                            <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">
                                {section.category}
                            </h3>
                            <div className="space-y-2">
                                {section.items.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                                    >
                                        <span className="text-sm">{shortcut.description}</span>
                                        <div className="flex items-center gap-1">
                                            {shortcut.keys.map((key, keyIndex) => (
                                                <span key={keyIndex} className="flex items-center gap-1">
                                                    <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border border-border">
                                                        {key}
                                                    </kbd>
                                                    {keyIndex < shortcut.keys.length - 1 && (
                                                        <span className="text-xs text-muted-foreground">then</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
