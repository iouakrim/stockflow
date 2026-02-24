import { createClient, getTenantSettings } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { SearchInput } from "./SearchInput"
import { RoleFilter } from "./RoleFilter"
import { SettingsTabs } from "./SettingsTabs"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import { InviteUserSheet } from "./InviteUserSheet"
import { UserActionsDropdown } from "./UserActionsDropdown"
import { ThemeSwitcher } from "./ThemeSwitcher"
import { GeneralSettingsForm } from "./GeneralSettingsForm"

export default async function SettingsPage({ searchParams }: { searchParams: { q?: string, role?: string, tab?: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch requester profile
    const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user?.id)
        .single()

    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', requesterProfile?.tenant_id)
        .single()

    const { currency } = await getTenantSettings()

    const isAdmin = requesterProfile?.role === 'admin' || requesterProfile?.role === 'super-admin'

    // Default tab logic based on role
    let tab = searchParams?.tab || (isAdmin ? "Users & Roles" : "Appearance");

    // Security check: If not admin and trying to access admin tabs, redirect to Appearance
    const adminTabs = ["Users & Roles", "General Settings"]
    if (!isAdmin && adminTabs.includes(tab)) {
        tab = "Appearance"
    }

    // Fetch warehouses for invitation form
    const { data: warehouses } = await supabase
        .from("warehouses")
        .select("*")
        .order("name", { ascending: true })

    // Fetch real profiles - Only for Admins
    let profiles: { id: string; full_name: string | null; email: string | null; role: string; created_at: string; warehouse_access?: string[] | null }[] = []
    if (isAdmin) {
        const { data: profilesData } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })
        profiles = profilesData || []
    }

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

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">{t("title")}</h1>
                </div>
            </div>

            <SettingsTabs currentTab={tab} isAdmin={isAdmin} />

            {tab === "Users & Roles" && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                        <SearchInput />
                        <div className="flex items-center gap-3">
                            <InviteUserSheet warehouses={warehouses || []} />
                            <RoleFilter />
                        </div>
                    </div>

                    {/* User List Matrix */}
                    <div className="rounded-[2.5rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                        <Table>
                            <TableHeader className="bg-primary/[0.03]">
                                <TableRow className="border-b border-primary/5 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">{t("employeeEntity")}</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("assignedProtocol") || "Rôle"}</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("warehouses") || "Dépôts"}</TableHead>
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
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {p.warehouse_access && p.warehouse_access.length > 0 ? (
                                                        p.warehouse_access.map((wId: string) => {
                                                            const wName = warehouses?.find(w => w.id === wId)?.name || 'Unknown'
                                                            return (
                                                                <span key={wId} className="text-[8px] px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/10 font-black uppercase tracking-tighter">
                                                                    {wName}
                                                                </span>
                                                            )
                                                        })
                                                    ) : (
                                                        <span className="text-[8px] text-muted-foreground opacity-40 font-black uppercase tracking-widest italic">{p.role === 'admin' ? 'Accès Total' : 'Aucun Dépôt'}</span>
                                                    )}
                                                </div>
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
                                                <UserActionsDropdown
                                                    user={p}
                                                    warehouses={warehouses || []}
                                                    currentUserId={user?.id}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <div className="px-8 py-5 border-t border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{t("directoryMatrix", { count: personnelCount })}</p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-primary/10 bg-primary/10 text-primary font-black text-xs">1</Button>
                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-muted-foreground font-black text-xs hover:bg-primary/5">2</Button>
                            </div>
                        </div>
                    </div>


                </div>
            )}

            {tab === "General Settings" && (
                <div className="max-w-2xl mt-6 animate-in fade-in duration-500">
                    <Card className="glass-card border-primary/10">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black tracking-tight">{t("facilityIdentity")}</CardTitle>
                            <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">{t("globalSystemNomenclature")}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <GeneralSettingsForm
                                initialName={tenant?.name || ""}
                                currency={currency}
                                labels={{
                                    entityDesignation: t("entityDesignation"),
                                    primaryCurrencyBase: t("primaryCurrencyBase"),
                                    commitChanges: t("commitChanges")
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {tab === "Appearance" && (
                <div className="max-w-4xl mt-6 animate-in slide-in-from-bottom-5 duration-700">
                    <ThemeSwitcher />
                </div>
            )}
        </div>
    )
}

