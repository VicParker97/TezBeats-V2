'use client'

import React from 'react';
import Link from "next/link";
import { Music } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import WalletConnection from './connect/WalletConnection';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Music className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg">TezBeat</span>
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <WalletConnection />
        </div>
      </div>
    </header>
  );
};

export default Header;