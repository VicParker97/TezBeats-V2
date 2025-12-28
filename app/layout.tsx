import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { KeyboardShortcutsProvider } from "@/components/keyboard/KeyboardShortcutsProvider";
import { MusicPlayer } from "@/components/music/MusicPlayer";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "TezBeat",
    description: "A comprehensive starter template for building decentralized applications on Tezos",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-title" content="TezBeat" />
            </head>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <WalletProvider>
                        <KeyboardShortcutsProvider>
                            <div className="flex min-h-screen flex-col">
                                <Header />
                                <main className="flex-1">{children}</main>
                                {/* Global Music Player - persists across page navigation */}
                                <MusicPlayer />
                            </div>
                        </KeyboardShortcutsProvider>
                    </WalletProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
