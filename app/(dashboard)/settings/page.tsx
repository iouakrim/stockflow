import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import {
    ShieldCheck,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    FilePenLine,
    ClipboardList,
    Info,
    ArrowUpRight,
    MapPin,
    Building2,
} from "lucide-react"
import { DangerZone } from "./DangerZone"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "./SearchInput"
import { RoleFilter } from "./RoleFilter"
import { SettingsTabs } from "./SettingsTabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function SettingsPage({ searchParams }: { searchParams: { q?: string, role?: string, tab?: string } }) {
    const supabase = createClient()

    // Fetch real profiles
    const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

    // Fetch warehouses
    const { data: warehouses } = await supabase
        .from("warehouses")
        .select("*")
        .order("created_at", { ascending: false })


    const q = searchParams?.q?.toLowerCase() || '';
    const roleFilter = searchParams?.role || 'all';

    let filteredProfiles = profiles || [];
    if (q) {
        filteredProfiles = filteredProfiles.filter(p =>
            p.full_name?.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q)
        );
    }
    if (roleFilter !== 'all') {
        filteredProfiles = filteredProfiles.filter(p => p.role === roleFilter);
    }

    const personnelCount = filteredProfiles.length;
    const t = await getTranslations("Settings")
    const tSidebar = await getTranslations("Sidebar")
    const tab = searchParams?.tab || "Users & Roles";

    const roles = [
        { title: "Admin", desc: "Unrestricted access to all warehouse zones, financial logs, and system configuration settings.", users: profiles?.filter(p => p.role === 'admin').length || 0, icon: ShieldCheck, color: "text-red-500", bg: "bg-red-500/10" },
        { title: "Manager", desc: "Manage stock entries, approve bulk transfers, and view audit trails. No billing access.", users: profiles?.filter(p => p.role === 'manager').length || 0, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
        { title: "Cashier", desc: "Input daily transactions and manage POS terminal. Limited access to inventory settings.", users: profiles?.filter(p => p.role === 'cashier').length || 0, icon: FilePenLine, color: "text-blue-500", bg: "bg-blue-500/10" },
    ]

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">{t("title")}</h1>
                </div>
            </div>

            <SettingsTabs currentTab={tab} />

            {tab === "Users & Roles" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                        <SearchInput />
                        <div className="flex items-center gap-3">
                            <RoleFilter />
                        </div>
                    </div>

                    {/* User List Matrix */}
                    <div className="rounded-[2.5rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                        <Table>
                            <TableHeader className="bg-primary/[0.03]">
                                <TableRow className="border-b border-primary/5 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">{t("employeeEntity")}</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("assignedProtocol")}</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("status")}</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("lastTerminalSync")}</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-8">{t("actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(!filteredProfiles || filteredProfiles.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground/50 font-medium tracking-tight">No personnel nodes found matching criteria.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredProfiles.map((p) => (
                                        <TableRow key={p.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group">
                                            <TableCell className="py-6 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-full bg-primary/10 border border-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase overflow-hidden">
                                                        {p.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm tracking-tight group-hover:text-primary transition-colors">{p.full_name || 'Anonymous'}</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium">{p.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-primary/5 ${p.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    p.role === 'manager' ? 'bg-primary/10 text-primary border-primary/20' :
                                                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    }`}>
                                                    {p.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`size-1.5 rounded-full bg-primary animate-pulse`} />
                                                    <span className="text-xs font-bold tracking-tight text-muted-foreground">{t("active")}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-medium text-muted-foreground opacity-60">
                                                {new Date(p.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all shrink-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl bg-[#0a140f] border-primary/10 shadow-xl shadow-black">
                                                        <DropdownMenuItem className="text-xs font-bold py-2.5 cursor-pointer text-foreground focus:bg-primary/10 focus:text-primary">{t("configureAccess")}</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-xs font-bold py-2.5 cursor-pointer text-foreground focus:bg-primary/10">{t("resetOverrideCode")}</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-xs font-bold py-2.5 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500">{t("terminateConnection")}</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <div className="px-8 py-5 border-t border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{tSidebar("directoryMatrix", { count: personnelCount })}</p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-primary/10 bg-primary/10 text-primary font-black text-xs">1</Button>
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-muted-foreground font-black text-xs hover:bg-primary/5">2</Button>
                            </div>
                        </div>
                    </div>


                </div>
            )}

            {tab === "General Settings" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 animate-in fade-in duration-500">
                    <Card className="glass-card border-primary/10">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black tracking-tight">{t("facilityIdentity")}</CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">{t("globalSystemNomenclature")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("entityDesignation")}</Label>
                                <Input defaultValue="StockFlow Main Warehouse" className="h-12 rounded-2xl bg-card border-primary/10 focus-visible:ring-primary font-bold px-5" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("primaryCurrencyBase")}</Label>
                                <Input defaultValue="USD ($)" className="h-12 rounded-2xl bg-card border-primary/10 focus-visible:ring-primary font-bold px-5" />
                            </div>
                            <div className="pt-4">
                                <Button className="bg-primary text-[#102219] font-black rounded-2xl h-12 px-8 uppercase text-[10px] tracking-widest hover:scale-[1.02] shadow-xl shadow-primary/20">{t("commitChanges")}</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-primary/10">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black tracking-tight">{t("timeAndLocalization")}</CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">{t("temporalAlignment")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("timezoneOffset")}</Label>
                                <Input defaultValue="UTC ±00:00 Greenwich Mean Time" disabled className="h-12 rounded-2xl bg-primary/[0.02] border-primary/10 text-muted-foreground font-bold px-5 opacity-70" />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t("dateFormat")}</Label>
                                <Input defaultValue="DD-MM-YYYY" className="h-12 rounded-2xl bg-card border-primary/10 focus-visible:ring-primary font-bold px-5" />
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">{t("24HourClockStandard")}</Label>
                                    <p className="text-[10px] font-medium text-muted-foreground">{t("forceMilitaryTime")}</p>
                                </div>
                                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {tab === "Security" && (
                <div className="space-y-6 mt-6 animate-in fade-in duration-500">
                    <Card className="glass-card border-primary/10">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black tracking-tight">{t("securityEnhancements")}</CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">{t("automatedDefenseMechanisms")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-primary/10 pb-8">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold flex items-center gap-2">{t("twoFactorAuth")} <span className="text-[9px] px-2 py-0.5 rounded-md bg-primary/20 text-primary uppercase font-black tracking-widest">{t("recommended")}</span></Label>
                                    <p className="text-xs text-muted-foreground font-medium max-w-sm">{t("requireCryptographicFactor")}</p>
                                </div>
                                <div className="flex items-center md:justify-end">
                                    <Switch className="data-[state=checked]:bg-primary" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-primary/10 pb-8">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">{t("automaticSessionTimeout")}</Label>
                                    <p className="text-xs text-muted-foreground font-medium max-w-sm">{t("terminateIdleConnections")}</p>
                                </div>
                                <div className="flex items-center md:justify-end gap-4">
                                    <span className="text-sm font-bold text-primary">15 Min</span>
                                    <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">{t("ipAllowlistRestriction")}</Label>
                                    <p className="text-xs text-muted-foreground font-medium max-w-sm">{t("blockOutsideAccess")}</p>
                                </div>
                                <div className="flex items-center md:justify-end">
                                    <Button variant="outline" className="h-10 px-6 rounded-xl border-primary/20 text-primary hover:bg-primary/10 font-bold text-xs">{t("configureIpRouting")}</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <DangerZone />
                </div>
            )}

            {tab === "Notifications" && (
                <div className="mt-6 animate-in fade-in duration-500">
                    <Card className="glass-card border-primary/10 max-w-3xl">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black tracking-tight">{t("alertPreferences")}</CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">{t("systemWideTransmission")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            {[
                                { title: t("lowStockWarnings"), desc: "Instant push notifications when an item breaches minimum threshold.", checked: true },
                                { title: t("largeTransactionAlerts"), desc: "Email notifications for any sale exceeding $5,000.", checked: true },
                                { title: t("dailyAuditSummary"), desc: "End-of-day discrepancy report delivered at 23:59.", checked: false },
                                { title: t("newAccessNodeLogin"), desc: "Trigger alert upon detection of login from an unknown terminal.", checked: true },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start justify-between py-4 border-b border-primary/5 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <h5 className="font-bold text-sm tracking-tight">{item.title}</h5>
                                        <p className="text-[11px] text-muted-foreground font-medium">{item.desc}</p>
                                    </div>
                                    <Switch defaultChecked={item.checked} className="data-[state=checked]:bg-primary mt-1" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {tab === "Warehouses Network" && (
                <div className="space-y-6 mt-6 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black tracking-tight">{t("depotNetwork")}</h3>
                            <p className="text-xs text-muted-foreground/60 font-medium mt-1 uppercase tracking-widest underline underline-offset-4 decoration-primary/30">{t("geographicLogicalStorage")}</p>
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-2xl h-11 px-6 uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                                    <Plus className="h-4 w-4 stroke-[3px]" /> {t("addNewLocation")}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[400px] sm:w-[540px] border-primary/10 bg-background/80 backdrop-blur-xl p-0">
                                <form className="h-full flex flex-col">
                                    <div className="p-6 border-b border-primary/10">
                                        <SheetHeader>
                                            <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-2">
                                                <Building2 className="size-6" />
                                            </div>
                                            <SheetTitle className="text-2xl font-black tracking-tight">{t("newDepot")}</SheetTitle>
                                            <SheetDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                                {t("initializeStorageLocation")}
                                            </SheetDescription>
                                        </SheetHeader>
                                    </div>
                                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("depotName")}</Label>
                                            <Input name="name" placeholder="e.g. Central Warehouse Paris" className="h-12 border-primary/20 rounded-xl bg-primary/5 font-bold focus-visible:ring-primary shadow-inner" required />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("geographicCoordinates")}</Label>
                                            <Input name="address" placeholder="e.g. 15 Rue de Rivoli, 75001 Paris" className="h-12 border-primary/20 rounded-xl bg-primary/5 font-medium focus-visible:ring-primary shadow-inner" required />
                                        </div>
                                        <div className="space-y-3 pt-4 border-t border-primary/10">
                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><div className="size-2 rounded-full bg-primary animate-pulse" /> {t("advancedNetworkSettings")}</Label>
                                            <div className="p-4 rounded-xl border border-primary/10 bg-accent/30 flex items-start gap-4">
                                                <Switch id="online-sync" defaultChecked className="data-[state=checked]:bg-primary" />
                                                <div className="space-y-1">
                                                    <Label htmlFor="online-sync" className="font-bold text-sm tracking-tight">{t("enableLiveSync")}</Label>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{t("synchronizeStock")}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 border-t border-primary/10 bg-accent/10">
                                        <SheetFooter className="flex w-full sm:justify-between gap-4">
                                            <SheetClose asChild>
                                                <Button type="button" variant="outline" className="h-12 rounded-xl flex-1 border-primary/20 font-bold hover:bg-primary/5">{t("abort")}</Button>
                                            </SheetClose>
                                            <Button type="submit" className="h-12 rounded-xl flex-1 bg-primary text-[#102219] font-black uppercase tracking-widest text-xs hover:bg-primary/90 shadow-xl shadow-primary/20">{t("initializeNode")}</Button>
                                        </SheetFooter>
                                    </div>
                                </form>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(!warehouses || warehouses.length === 0) ? (
                            <div className="col-span-full p-12 text-center rounded-3xl border border-dashed border-primary/20 bg-primary/5">
                                <Building2 className="size-10 text-primary/40 mx-auto mb-4" />
                                <h4 className="text-sm font-black tracking-tight mb-1">{t("noDepotsFound")}</h4>
                                <p className="text-xs text-muted-foreground font-medium">{t("createFirstWarehouse")}</p>
                            </div>
                        ) : (
                            warehouses.map((w: any) => (
                                <Card key={w.id} className="glass-card group hover:scale-[1.02] transition-all duration-300 border-primary/10 overflow-hidden">
                                    <div className="h-32 bg-primary/[0.03] w-full border-b border-primary/5 relative flex items-center justify-center overflow-hidden">
                                        {/* Stylized map pattern background */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                                        <div className="size-16 rounded-3xl bg-card border border-primary/10 flex items-center justify-center shadow-xl shadow-black/20 z-10 group-hover:scale-110 transition-transform">
                                            <Building2 className="size-6 text-primary" />
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-4 pt-5">
                                        <div>
                                            <h4 className="text-base font-black tracking-tight group-hover:text-primary transition-colors">{w.name}</h4>
                                            <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                                                <MapPin className="size-3" />
                                                <p className="text-[10px] font-medium truncate uppercase tracking-widest">{w.address || t("locationCoordinatesMissing")}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-4 border-t border-primary/5">
                                            <div className="flex -space-x-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className={`size-6 rounded-full border-2 border-background bg-accent flex items-center justify-center text-[8px] font-black`}>M</div>
                                                ))}
                                                <div className="size-6 rounded-full border-2 border-background bg-primary/10 text-primary flex items-center justify-center text-[8px] font-black">+2</div>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t("assignedNodes")}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <Sheet>
                                                <SheetTrigger asChild>
                                                    <Button variant="outline" className="h-9 rounded-xl border-primary/20 text-xs font-bold hover:bg-primary/10">{t("configure")}</Button>
                                                </SheetTrigger>
                                                <SheetContent className="w-[400px] sm:w-[540px] border-primary/10 bg-background/80 backdrop-blur-xl">
                                                    <SheetHeader className="mb-6">
                                                        <SheetTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                                            <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Building2 className="size-5" /></div>
                                                            {w.name}
                                                        </SheetTitle>
                                                        <SheetDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t("warehousesNetwork")}</SheetDescription>
                                                    </SheetHeader>
                                                    <div className="space-y-6">
                                                        <div className="space-y-2 pb-4 border-b border-primary/10">
                                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("uuidTracker")}</Label>
                                                            <div className="p-3 rounded-lg bg-accent font-mono text-xs overflow-hidden text-ellipsis">{w.id}</div>
                                                        </div>
                                                        <div className="space-y-2 pb-4 border-b border-primary/10">
                                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("currentAddress")}</Label>
                                                            <div className="p-3 rounded-lg border border-primary/10 bg-primary/5 text-sm font-medium">{w.address}</div>
                                                        </div>
                                                        <div className="pt-2 flex justify-between gap-4">
                                                            <Button variant="destructive" className="flex-1 opacity-80 hover:opacity-100 font-bold rounded-xl h-11">{t("decommissionDepot")}</Button>
                                                            <Button className="flex-1 bg-primary text-[#102219] font-bold rounded-xl h-11">{t("saveChanges")}</Button>
                                                        </div>
                                                    </div>
                                                </SheetContent>
                                            </Sheet>
                                            <Button variant="outline" className="h-9 rounded-xl border-primary/20 text-xs font-bold text-primary hover:bg-primary/10"><ArrowUpRight className="size-3 mr-1" /> {t("viewStock")}</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

