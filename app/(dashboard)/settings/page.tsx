import { createClient } from "@/lib/supabase/server"
import {
    Settings,
    Users,
    ShieldCheck,
    History,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    ShieldAlert,
    FilePenLine,
    ClipboardList,
    UserPlus,
    Bell,
    Key,
    UserCircle,
    Info,
    ArrowUpRight,
    Settings2,
    Lock
} from "lucide-react"
import { DangerZone } from "./DangerZone"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
    const supabase = createClient()

    // Mock data for the UI based on Stitch design
    const employees = [
        { name: "Liam Henderson", email: "l.henderson@stockflowpro.com", role: "Manager", status: "Active", lastActive: "Today, 10:24 AM" },
        { name: "Sarah Jenkins", email: "s.jenkins@stockflowpro.com", role: "Clerk", status: "Active", lastActive: "2 hours ago" },
        { name: "Marcus Vane", email: "m.vane@stockflowpro.com", role: "Viewer", status: "Inactive", lastActive: "Dec 12, 2023" },
    ]

    const roles = [
        { title: "Administrator", desc: "Unrestricted access to all warehouse zones, financial logs, and system configuration settings.", users: 2, icon: ShieldCheck, color: "text-red-500", bg: "bg-red-500/10" },
        { title: "Warehouse Manager", desc: "Manage stock entries, approve bulk transfers, and view audit trails. No billing access.", users: 4, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
        { title: "Inventory Clerk", desc: "Input daily stock weights and harvest moisture data. Read-only access to historical logs.", users: 6, icon: FilePenLine, color: "text-blue-500", bg: "bg-blue-500/10" },
    ]

    return (
        <div className="flex-1 space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">Control Center</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            System Configuration & Access
                        </span>
                        <span className="text-muted-foreground/40 text-xs font-medium tracking-tight">Managing 12 verified personnel access points.</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                        <Info className="h-4 w-4 text-primary" /> SYSTEM DOCUMENTATION
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Plus className="h-5 w-5 stroke-[3px]" /> CREATE ACCESS NODE
                    </Button>
                </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="border-b border-primary/5 flex items-center gap-10">
                {["Users & Roles", "General Settings", "Security", "Notifications", "API Gateway"].map((tab, i) => (
                    <button
                        key={tab}
                        className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${i === 0 ? 'text-primary' : 'text-muted-foreground/40 hover:text-foreground'}`}
                    >
                        {tab}
                        {i === 0 && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-lg shadow-primary/50" />}
                    </button>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        className="w-full bg-card/40 border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 border"
                        placeholder="Search by name or email identifier..."
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-2xl h-11 px-6 text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all border-primary/10 bg-card/40">
                        <Filter className="h-4 w-4 mr-2" /> Filter Roles
                    </Button>
                </div>
            </div>

            {/* User List Matrix */}
            <div className="rounded-[2.5rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                <Table>
                    <TableHeader className="bg-primary/[0.03]">
                        <TableRow className="border-b border-primary/5 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">Employee Entity</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Assigned Protocol</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Last Terminal Sync</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-8">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map((e, i) => (
                            <TableRow key={i} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group">
                                <TableCell className="py-6 px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-primary/10 border border-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase overflow-hidden">
                                            {e.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm tracking-tight group-hover:text-primary transition-colors">{e.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium">{e.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest border border-primary/5 ${e.role === 'Manager' ? 'bg-primary/10 text-primary border-primary/20' :
                                        e.role === 'Clerk' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                        {e.role}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={`size-1.5 rounded-full ${e.status === 'Active' ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                                        <span className="text-xs font-bold tracking-tight text-muted-foreground">{e.status}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs font-medium text-muted-foreground opacity-60">
                                    {e.lastActive}
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:bg-accent transition-all shrink-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="px-8 py-5 border-t border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Displaying Protocol Matrix: 3 / 12 Access Points</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-primary/10 bg-primary/10 text-primary font-black text-xs">1</Button>
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-muted-foreground font-black text-xs hover:bg-primary/5">2</Button>
                    </div>
                </div>
            </div>

            {/* Permission Presets Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black tracking-tight">Permission Presets</h3>
                        <p className="text-xs text-muted-foreground/60 font-medium mt-1 uppercase tracking-widest underline underline-offset-4 decoration-primary/30">Protocol Authorization Levels</p>
                    </div>
                    <Button variant="ghost" className="text-primary font-black text-[10px] tracking-widest uppercase hover:bg-primary/5">
                        <Plus className="h-4 w-4 mr-2" /> Define New Archetype
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {roles.map((role, i) => (
                        <Card key={i} className="glass-card group hover:scale-[1.02] transition-all duration-300 border-primary/5">
                            <CardContent className="p-8 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className={`p-4 ${role.bg} ${role.color} rounded-2xl group-hover:scale-110 transition-transform shadow-lg shadow-black/10`}>
                                        <role.icon className="h-8 w-8" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">{role.users} Global Users</span>
                                </div>
                                <div>
                                    <h4 className="text-lg font-black tracking-tight mb-2 group-hover:text-primary transition-colors">{role.title}</h4>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{role.desc}</p>
                                </div>
                                <Button className="w-full bg-accent/50 hover:bg-primary hover:text-background text-foreground font-black rounded-xl h-11 text-[9px] tracking-widest uppercase transition-all">
                                    Modify Authority <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <DangerZone />
        </div>
    )
}

