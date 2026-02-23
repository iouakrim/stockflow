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
    CreditCard,
    PanelLeftClose,
    PanelLeftOpen,
    ArrowUpRight,
    Truck,
    Activity
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
import { WarehouseProvider, useWarehouse } from "@/components/providers/WarehouseProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

function DashboardContent({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [userProfile, setUserProfile] = useState<{ full_name: string; role: string } | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        async function getInitialData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, role, tenant_id, preferred_language')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserProfile(profile);

                    // Sync preferred language to cookie if cookie is missing
                    const match = document.cookie.match(/(?:^|;)\s*NEXT_LOCALE=([^;]*)/);
                    if (!match && profile.preferred_language) {
                        document.cookie = `NEXT_LOCALE=${profile.preferred_language}; path=/; max-age=31536000; SameSite=Lax`;
                        window.location.reload();
                    }
                }
            }
        }
        getInitialData();
    }, [supabase]);

    const { activeWarehouse, warehouses, setActiveWarehouse, isLoading } = useWarehouse()
    const t = useTranslations("Sidebar");

    const navItems = [
        { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { label: t("pos"), href: "/sales/new", icon: ShoppingCart },
        { label: "Arrivages", href: "/purchases", icon: Truck },
        { label: t("inventory"), href: "/products", icon: Package },
        { label: t("customers"), href: "/customers", icon: Users },
        { label: t("suppliers"), href: "/suppliers", icon: Building2 },
        ...(['admin', 'super-admin', 'manager'].includes(userProfile?.role || '')
            ? [{ label: t("reports"), href: "/reports", icon: BarChart3 }]
            : []),
        ...(['admin', 'super-admin', 'manager'].includes(userProfile?.role || '')
            ? [{ label: "Audit", href: "/movements", icon: Activity }]
            : []),
        ...(['admin', 'super-admin'].includes(userProfile?.role || '')
            ? [{ label: t("warehousesNetwork"), href: "/warehouses", icon: Warehouse }]
            : []),
        { label: t("settings"), href: "/settings", icon: Settings },
    ];

    const mobileNavItems = [
        { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
        { label: t("inventory"), href: "/products", icon: Package },
        { label: t("pos"), href: "/sales/new", icon: PlusCircle },
        { label: t("ledger"), href: "/sales", icon: CreditCard },
        { label: t("settings"), href: "/settings", icon: Settings },
    ];

    const isActive = (path: string) => pathname === path;

    const displayName = userProfile?.full_name || t("loading");
    const displayRole = userProfile?.role || t("operator");
    const initials = userProfile?.full_name ? userProfile.full_name.split(' ').map(n => n[0]).join('') : "SF";

    const displayWarehouse = activeWarehouse?.name || (isLoading ? t("syncing") : t("noDepotFound"));
    const displayWarehouseId = activeWarehouse?.id ? `#${activeWarehouse.id.slice(0, 5).toUpperCase()}` : "NULL";

    return (
        <div className="flex h-screen bg-background dark:bg-[#102219] overflow-hidden selection:bg-primary/30 selection:text-primary transition-colors duration-500">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col border-r border-primary/10 bg-white dark:bg-[#0a140f] z-30 transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-64'}`}>
                <div className={`p-8 flex items-center ${isCollapsed ? 'justify-center px-4' : 'gap-3'}`}>
                    <div className="size-11 shrink-0 rounded-xl bg-primary flex items-center justify-center text-[#102219] shadow-lg shadow-primary/20 animate-float">
                        <Leaf className="h-6 w-6 fill-current" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-foreground text-lg font-black leading-tight tracking-tighter truncate">StockFlow Pro</h1>
                            <p className="text-primary text-[10px] font-black uppercase tracking-widest opacity-80 truncate">Agri-Logistics OS</p>
                        </div>
                    )}
                </div>

                <nav className={`flex-1 space-y-1.5 py-6 overflow-y-auto custom-scrollbar ${isCollapsed ? 'px-4' : 'px-6'}`}>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3.5 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${isActive(item.href)
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-5px_rgba(17,212,115,0.2)]"
                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                } ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 group-active:scale-95 ${isActive(item.href) ? "text-primary fill-current/10" : "text-muted-foreground group-hover:text-primary"}`} />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-primary/5 bg-accent/5">
                    {!isCollapsed && (
                        <div className="pt-2 flex justify-center items-center opacity-80 hover:opacity-100 transition-opacity">
                            <div className="px-3 py-1 rounded-full bg-primary/5 border border-primary/10 flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-primary/40 animate-pulse" />
                                <span className="font-mono text-[8px] font-black tracking-[0.2em] text-primary/60">V1.0.0</span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden premium-grid">
                {/* Top Header */}
                <header className="h-16 md:h-20 flex items-center justify-between px-6 md:px-8 bg-white/40 dark:bg-[#102219]/40 backdrop-blur-xl border-b border-primary/10 sticky top-0 z-20">
                    <div className="flex items-center gap-4 md:gap-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden md:flex relative size-11 rounded-2xl bg-accent/30 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/10"
                        >
                            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                        </Button>

                        <div className="md:hidden flex items-center gap-2">
                            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-[#102219] shadow-lg shadow-primary/20">
                                <Leaf className="h-4.5 w-4.5 fill-current" />
                            </div>
                            <h1 className="text-foreground text-sm font-black tracking-tighter uppercase italic">SF <span className="text-primary tracking-[0.2em] font-black ml-0.5">PRO</span></h1>
                        </div>

                        <div className="hidden md:flex items-center gap-2.5 text-foreground">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl bg-card border border-primary/10 hover:border-primary/30 transition-all hover:bg-card/50 active:scale-95 group shadow-sm">
                                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform overflow-hidden">
                                            {isLoading ? <div className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Warehouse className="h-4 w-4" />}
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-sm font-black tracking-tight leading-none group-hover:text-primary transition-colors">{displayWarehouse}</h2>
                                                <ChevronDown className="size-3 text-muted-foreground opacity-50 stroke-[3px]" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">ID: {displayWarehouseId}</span>
                                        </div>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-64 rounded-2xl border-primary/10 shadow-xl overflow-hidden mt-1 p-2">
                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-3 py-2">{t("selectActiveDepot")}</DropdownMenuLabel>
                                    <div className="space-y-1">
                                        {warehouses.map(w => (
                                            <DropdownMenuItem
                                                key={w.id}
                                                onClick={() => setActiveWarehouse(w)}
                                                className={`rounded-xl px-3 py-2.5 cursor-pointer font-bold gap-3 ${activeWarehouse?.id === w.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent focus:bg-accent'}`}
                                            >
                                                <Building2 className={`size-4 opacity-70 ${activeWarehouse?.id === w.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-xs truncate">{w.name}</span>
                                                    {w.address && <span className="text-[9px] text-muted-foreground uppercase opacity-70 truncate max-w-[140px]">{w.address}</span>}
                                                </div>
                                                {activeWarehouse?.id === w.id && <div className="size-1.5 bg-primary rounded-full animate-pulse" />}
                                            </DropdownMenuItem>
                                        ))}
                                    </div>
                                    {warehouses.length > 0 && <DropdownMenuSeparator className="my-2 opacity-50" />}
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings?tab=Warehouses Network" className="rounded-xl px-3 py-2 cursor-pointer text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary focus:bg-transparent">
                                            {t("configureNetwork")} <ArrowUpRight className="size-3 ml-auto opacity-50" />
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        <LanguageSwitcher />

                        <Button variant="ghost" size="icon" className="relative size-10 md:size-11 rounded-xl md:rounded-2xl bg-accent/30 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/10">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 size-2 bg-destructive rounded-full border-2 border-[#102219] animate-pulse" />
                        </Button>

                        <div className="h-6 w-px bg-primary/10 mx-1 hidden sm:block opacity-50" />

                        <div className="flex items-center gap-3 md:gap-4 pl-1 md:pl-2">
                            <div className="text-right hidden xl:block">
                                <p className="text-xs font-black leading-none">{displayName}</p>
                                <p className="text-[9px] text-primary font-black uppercase mt-1 tracking-widest opacity-80">{displayRole}</p>
                            </div>
                            <div className="size-9 md:size-11 rounded-xl md:rounded-2xl border-2 border-primary/20 bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/5 overflow-hidden">
                                <span className="text-xs md:text-sm font-black text-primary uppercase">
                                    {initials}
                                </span>
                            </div>
                            <div className="h-6 w-px bg-primary/10 mx-1 hidden sm:block opacity-50" />
                            <SignOutButton minimal />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-28 md:pb-10 custom-scrollbar relative">
                    {children}
                </div>

                {/* Mobile Bottom Navigation - X/WhatsApp Style */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background dark:bg-[#0a140f] border-t border-primary/10 z-50 flex items-center justify-around px-2 pb-safe">
                    {mobileNavItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 h-full w-full`}
                            >
                                <div className={`relative flex flex-col items-center justify-center p-1 rounded-full transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                                    <item.icon className={`h-[22px] w-[22px] stroke-[1.5px] ${active ? "fill-primary/20 stroke-[2px]" : ""}`} />
                                    {/* Optional Notification Badge */}
                                    {item.label === "Account" && (
                                        <span className="absolute top-1 right-0.5 size-2 bg-destructive rounded-full border border-background" />
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium tracking-tight ${active ? "text-primary font-bold" : "text-muted-foreground"}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <WarehouseProvider>
            <SettingsProvider>
                <DashboardContent>
                    {children}
                </DashboardContent>
            </SettingsProvider>
        </WarehouseProvider>
    )
}
