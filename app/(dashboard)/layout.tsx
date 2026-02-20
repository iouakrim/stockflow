"use client"

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    Menu,
    X,
    Bell,
    Search,
    ChevronDown,
    LogOut,
    Warehouse,
    BarChart3,
    Leaf,
    Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/SignOutButton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Sales", href: "/sales", icon: ShoppingCart },
        { label: "Products", href: "/products", icon: Package },
        { label: "Customers", href: "/customers", icon: Users },
        { label: "Suppliers", href: "/suppliers", icon: Building2 },
        { label: "Reports", href: "/reports", icon: BarChart3 },
        { label: "Settings", href: "/settings", icon: Settings },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <div className="flex h-screen bg-background dark:bg-[#102219] overflow-hidden selection:bg-primary/30 selection:text-primary">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-col border-r border-primary/10 bg-white dark:bg-[#0a140f] z-30 transition-all duration-300">
                <div className="p-8 flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-primary flex items-center justify-center text-[#102219] shadow-lg shadow-primary/20 animate-float">
                        <Leaf className="h-6 w-6 fill-current" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-foreground text-lg font-black leading-tight tracking-tighter">StockFlow Pro</h1>
                        <p className="text-primary text-[10px] font-black uppercase tracking-widest opacity-80">Agri-Logistics OS</p>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-1.5 py-6 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${isActive(item.href)
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                }`}
                        >
                            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-primary/5 bg-accent/5">
                    <Link
                        href="/settings"
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive("/settings")
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                            }`}
                    >
                        <Settings className="h-5 w-5" />
                        Settings
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden premium-grid">
                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-white/40 dark:bg-[#102219]/40 backdrop-blur-xl border-b border-primary/10 sticky top-0 z-20">
                    <div className="flex items-center gap-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden text-foreground"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>

                        <div className="hidden md:flex items-center gap-2.5 text-foreground">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Warehouse className="h-4 w-4" />
                            </div>
                            <h2 className="text-lg font-black tracking-tight">North Silo A <span className="text-xs font-medium text-muted-foreground ml-2 opacity-50">#42021</span></h2>
                        </div>

                        <div className="relative hidden lg:block w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full bg-accent/30 border-none rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/40"
                                placeholder="Search inventory or receipts..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <Button variant="ghost" size="icon" className="relative size-11 rounded-2xl bg-accent/30 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/10">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2.5 right-2.5 size-2 bg-destructive rounded-full border-2 border-background animate-pulse" />
                        </Button>

                        <div className="h-8 w-px bg-primary/10 mx-1" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 pl-2 group transition-all">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-black leading-none group-hover:text-primary">Alex Rivera</p>
                                        <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-widest opacity-80">Silo Manager</p>
                                    </div>
                                    <div className="size-11 rounded-2xl border-2 border-primary/20 p-0.5 group-hover:border-primary group-hover:scale-105 transition-all active:scale-95 shadow-lg shadow-primary/5 overflow-hidden">
                                        <img
                                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                                            alt="User"
                                            className="w-full h-full rounded-[0.6rem] bg-accent object-cover"
                                        />
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 rounded-2xl border-primary/10 mt-2" align="end">
                                <DropdownMenuLabel className="font-black text-xs uppercase tracking-widest text-muted-foreground">My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-primary/5" />
                                <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5">
                                    <Users className="h-4 w-4" /> Profile Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-primary/10 focus:text-primary cursor-pointer py-2.5">
                                    <Settings className="h-4 w-4" /> Account Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-primary/5" />
                                <div className="p-1">
                                    <SignOutButton />
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
                    {children}
                </div>
            </main>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-80 bg-card border-r border-primary/10 z-50 md:hidden transition-transform duration-300 transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-[#102219]">
                            <Leaf className="h-5 w-5 fill-current" />
                        </div>
                        <h1 className="text-foreground text-lg font-black tracking-tighter">StockFlow</h1>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>
                <nav className="px-6 py-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black tracking-tight transition-all ${isActive(item.href)
                                ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                    <div className="pt-4 mt-4 border-t border-primary/5">
                        <Link
                            href="/settings"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-black text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        >
                            <Settings className="h-5 w-5" />
                            Settings
                        </Link>
                    </div>
                </nav>
            </aside>
        </div>
    );
}
