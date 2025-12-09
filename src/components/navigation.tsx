"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    Calendar,
    RefreshCw,
    TrendingUp,
} from "lucide-react";

const navItems = [
    { href: "/", label: "Command Center", icon: LayoutDashboard },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/review", label: "Board Room", icon: Calendar },
    { href: "/sync", label: "Sync", icon: RefreshCw },
];

export function Navigation() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
                        <TrendingUp className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent hidden sm:block">
                        Titan Finance
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-amber-500/15 text-amber-500"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden md:block">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
