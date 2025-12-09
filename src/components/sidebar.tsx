"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    CreditCard,
    FolderTree,
    ArrowDownUp,
    Settings,
    BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/accounts", label: "Accounts", icon: CreditCard },
    { href: "/journal", label: "Journal", icon: BookOpen },
    { href: "/insights", label: "Insights", icon: BarChart3 },
    { href: "/categories", label: "Categories", icon: FolderTree },
    { href: "/sync", label: "Import/Export", icon: ArrowDownUp },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
            {/* Minimal header */}
            <div className="p-6 border-b border-border">
                <h1 className="text-lg font-medium tracking-tight">Finance</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                isActive
                                    ? "bg-accent text-foreground font-medium"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Settings
                </Link>
            </div>
        </aside>
    );
}

// Mobile bottom tabs
export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
            <div className="flex justify-around py-2">
                {navItems.slice(0, 4).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors",
                                isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
