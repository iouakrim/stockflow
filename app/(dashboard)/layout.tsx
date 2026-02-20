"use client"

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    Bell,
    ChevronDown,
    Warehouse,
    BarChart3,
    Leaf,
    Building2,
    PlusCircle,
    Activity,
    CreditCard
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
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [userProfile, setUserProfile] = useState<{ full_name: string; role: string } | null>(null);
    const [warehouseInfo, setWarehouseInfo] = useState<{ name: string; id: string } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        async function getInitialData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, role, tenant_id')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserProfile(profile);

                    // Fetch the first warehouse associated with the tenant
                    const { data: warehouse } = await supabase
                        .from('warehouses')
                        .select('name, id')
                        .eq('tenant_id', profile.tenant_id)
                        .limit(1)
                        .maybeSingle();

                    if (warehouse) {
                        setWarehouseInfo(warehouse);
                    }
                }
            }
        }
        getInitialData();
    }, [supabase]);

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Sales", href: "/sales", icon: ShoppingCart },
        { label: "Products", href: "/products", icon: Package },
        { label: "Customers", href: "/customers", icon: Users },
        { label: "Suppliers", href: "/suppliers", icon: Building2 },
        { label: "Reports", href: "/reports", icon: BarChart3 },
        { label: "Settings", href: "/settings", icon: Settings },
    ];

    const mobileNavItems = [
        { label: "Home", href: "/dashboard", icon: LayoutDashboard },
        { label: "Inventory", href: "/products", icon: Package },
        { label: "POS", href: "/sales/new", icon: PlusCircle, primary: true },
        { label: "Ledger", href: "/sales", icon: CreditCard },
        { label: "Account", href: "/settings", icon: Settings },
    ];

    const isActive = (path: string) => pathname === path;

    const displayName = userProfile?.full_name || "Loading...";
    const displayRole = userProfile?.role || "Operator";
    const initials = userProfile?.full_name ? userProfile.full_name.split(' ').map(n => n[0]).join('') : "SF";

    const displayWarehouse = warehouseInfo?.name || "System Base";
    const displayWarehouseId = warehouseInfo?.id ? `#${warehouseInfo.id.slice(0, 5).toUpperCase()}` : "LIVE";

    return (
        <div className="flex h-screen bg-background dark:bg-[#102219] overflow-hidden selection:bg-primary/30 selection:text-primary transition-colors duration-500">
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
                            className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${isActive(item.href)
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-5px_rgba(17,212,115,0.2)]"
                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                }`}
                        >
                            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 group-active:scale-95 ${isActive(item.href) ? "text-primary fill-current/10" : "text-muted-foreground group-hover:text-primary"}`} />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-primary/5 bg-accent/5">
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mb-4 mx-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="size-3 text-primary animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">System Node Active</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/60 font-medium leading-tight">Last sync: 12s ago via Silo Matrix v4.2</p>
                    </div>
                    <SignOutButton />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden premium-grid">
                {/* Top Header */}
                <header className="h-16 md:h-20 flex items-center justify-between px-6 md:px-8 bg-white/40 dark:bg-[#102219]/40 backdrop-blur-xl border-b border-primary/10 sticky top-0 z-20">
                    <div className="flex items-center gap-4 md:gap-8">
                        <div className="md:hidden flex items-center gap-2">
                            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-[#102219] shadow-lg shadow-primary/20">
                                <Leaf className="h-4.5 w-4.5 fill-current" />
                            </div>
                            <h1 className="text-foreground text-sm font-black tracking-tighter uppercase italic">SF <span className="text-primary tracking-[0.2em] font-black ml-0.5">PRO</span></h1>
                        </div>

                        <div className="hidden md:flex items-center gap-2.5 text-foreground">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Warehouse className="h-4 w-4" />
                            </div>
                            <h2 className="text-lg font-black tracking-tight">{displayWarehouse} <span className="text-[10px] font-medium text-muted-foreground ml-3 bg-accent/50 px-2 py-0.5 rounded-full opacity-60">ID: {displayWarehouseId}</span></h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        <Button variant="ghost" size="icon" className="relative size-10 md:size-11 rounded-xl md:rounded-2xl bg-accent/30 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/10">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-[#102219] animate-pulse" />
                        </Button>

                        <div className="h-6 w-px bg-primary/10 mx-1 hidden sm:block opacity-50" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 md:gap-3 pl-1 md:pl-2 group transition-all">
                                    <div className="text-right hidden xl:block">
                                        <p className="text-xs font-black leading-none group-hover:text-primary transition-colors">{displayName}</p>
                                        <p className="text-[9px] text-primary font-black uppercase mt-1 tracking-widest opacity-80">{displayRole}</p>
                                    </div>
                                    <div className="size-9 md:size-11 rounded-xl md:rounded-2xl border-2 border-primary/20 bg-primary/10 flex items-center justify-center group-hover:border-primary group-hover:scale-105 transition-all active:scale-95 shadow-lg shadow-primary/5 overflow-hidden">
                                        <span className="text-xs md:text-sm font-black text-primary uppercase">
                                            {initials}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary hidden md:block opacity-40" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 p-3 rounded-[1.5rem] border-primary/10 mt-3 shadow-2xl glass-card backdrop-blur-3xl" align="end">
                                <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 px-3">System Identity</DropdownMenuLabel>
                                <div className="flex items-center gap-3 px-3 py-4 bg-primary/5 rounded-2xl mb-2 border border-primary/10">
                                    <div className="size-10 rounded-xl bg-primary flex items-center justify-center font-black text-xs text-background">{initials}</div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black tracking-tight">{displayName}</span>
                                        <span className="text-[10px] text-muted-foreground font-bold italic uppercase tracking-tighter">{displayRole} Level Sync</span>
                                    </div>
                                </div>
                                <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-primary/10 focus:text-primary cursor-pointer py-3 px-4">
                                    <Users className="h-4 w-4" /> Profile Analytics
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl font-bold gap-3 focus:bg-primary/10 focus:text-primary cursor-pointer py-3 px-4">
                                    <Settings className="h-4 w-4" /> Node Preferences
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 bg-primary/5" />
                                <div className="p-1">
                                    <SignOutButton />
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-28 md:pb-10 custom-scrollbar relative">
                    {children}
                </div>

                {/* Mobile Bottom Navigation - "App Style" */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none z-40" />
                <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-20 bg-[#0a140f]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] z-50 flex items-center justify-between px-3 shadow-2xl shadow-primary/10 overflow-visible">
                    {mobileNavItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-500 flex-1 relative ${item.primary ? "overflow-visible" : ""}`}
                            >
                                {item.primary ? (
                                    <div className="relative -mt-12 group pointer-events-auto">
                                        <div className="absolute inset-0 bg-primary/40 rounded-3xl blur-2xl opacity-20 group-active:opacity-60 transition-opacity" />
                                        <div className="size-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/40 border-[6px] border-[#0a140f] relative z-10 hover:scale-110 active:scale-90 transition-all">
                                            <item.icon className="size-8 text-[#0a140f] stroke-[2.5px]" />
                                        </div>
                                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-primary opacity-80">
                                            {item.label}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`p-2 rounded-2xl transition-all duration-300 pointer-events-auto group active:scale-90 flex flex-col items-center w-full`}>
                                        <item.icon className={`size-6 transition-all duration-300 ${active ? "text-primary scale-110 fill-primary/10" : "text-muted-foreground/40 group-hover:text-primary/60"}`} />
                                        <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 transition-all duration-300 ${active ? "text-primary opacity-100" : "text-muted-foreground/20 group-hover:text-primary/40"}`}>
                                            {item.label}
                                        </span>
                                        {active && (
                                            <div className="absolute -bottom-2 size-1.5 rounded-full bg-primary shadow-[0_0_10px_#11d473] animate-pulse" />
                                        )}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </main>
        </div>
    );
}
