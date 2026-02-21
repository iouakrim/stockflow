import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { Supplier } from "@/types"
import {
    Plus,
    Search,
    Download,
    MoreVertical,
    Phone,
    Mail,
    MapPin,
    Truck,
    Building2,
    ArrowUpRight,
    Star,
    ShieldCheck,
    ListFilter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default async function SuppliersPage() {
    const supabase = createClient()

    // Fetch suppliers (using a fallback since the table might not exist in the DB yet until user runs migration)
    const { data: suppliers } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true })

    // Calculations for header stats
    const totalSuppliers = suppliers?.length || 0

    const t = await getTranslations("Suppliers")

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">{t("title")}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                        <Download className="h-4 w-4 text-primary" /> {t("exportReports")}
                    </Button>
                    <Link href="/suppliers/new">
                        <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Plus className="h-5 w-5 stroke-[3px]" /> {t("onboardPartner")}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Hub Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-7 flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all shadow-lg shadow-black/10">
                            <Building2 className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{t("totalPartners")}</p>
                            <p className="text-3xl font-black tracking-tighter">{totalSuppliers}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-7 flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-background transition-all shadow-lg shadow-black/10">
                            <Truck className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{t("activeDeliveries")}</p>
                            <p className="text-3xl font-black tracking-tighter">04</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-7 flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-background transition-all shadow-lg shadow-black/10">
                            <ShieldCheck className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{t("qualityCertified")}</p>
                            <p className="text-3xl font-black tracking-tighter">{Math.floor(totalSuppliers * 0.8)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Supplier Directory Table */}
            <div className="space-y-6 pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                        <Button variant="secondary" size="sm" className="rounded-2xl h-10 px-6 text-xs font-black bg-primary text-background uppercase tracking-widest shadow-lg shadow-primary/20">{t("allPartners")}</Button>
                        <Button variant="ghost" size="sm" className="rounded-2xl h-10 px-6 text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all">{t("wholesalers")}</Button>
                        <Button variant="ghost" size="sm" className="rounded-2xl h-10 px-6 text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all">{t("farmers")}</Button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full bg-card/40 border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 border"
                                placeholder={t("search")}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="size-11 rounded-2xl border-primary/10 bg-card/40 transition-all hover:bg-primary/10 hover:text-primary active:scale-95">
                            <ListFilter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="rounded-[2.5rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                    <Table>
                        <TableHeader className="bg-primary/[0.03]">
                            <TableRow className="border-b border-primary/5 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">{t("companyEntity")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("mainContact")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("communications")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("classification")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("reliability")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-8">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!suppliers || suppliers.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-24 text-muted-foreground italic opacity-50">
                                        <div className="flex flex-col items-center gap-4">
                                            <Building2 className="h-10 w-10 opacity-20" />
                                            <div className="space-y-1">
                                                <p className="text-xs font-black uppercase tracking-[0.2em]">{t("directoryEmpty")}</p>
                                                <p className="text-[10px] font-medium tracking-tight">{t("onboardFirst")}</p>
                                            </div>
                                            <Link href="/suppliers/new" className="mt-4">
                                                <Button className="h-10 px-6 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-black text-[10px] tracking-widest uppercase">
                                                    {t("initializeFirstOnboarding")}
                                                </Button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                suppliers.map((supplier: Supplier) => (
                                    <TableRow key={supplier.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group">
                                        <TableCell className="py-6 px-8">
                                            <Link href={`/suppliers/${supplier.id}`} className="flex items-center gap-4 block w-full hover:opacity-80 transition-opacity">
                                                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all border border-primary/10 shadow-sm font-black text-sm uppercase">
                                                    {supplier.name[0]}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-black text-sm tracking-tight truncate group-hover:text-primary transition-colors underline-offset-4 group-hover:underline">{supplier.name}</span>
                                                    <div className="flex items-center gap-1.5 opacity-40 mt-0.5">
                                                        <MapPin className="h-3 w-3" />
                                                        <span className="text-[10px] font-medium truncate max-w-[150px]">{supplier.address || t("unspecifiedLocation")}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black tracking-tighter">{supplier.contact_name || "N/A"}</span>
                                                <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-0.5">{t("directRepresentative")}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 group/contact">
                                                    <Mail className="h-3.5 w-3.5 text-primary opacity-40 group-hover/contact:opacity-100 transition-opacity" />
                                                    <span className="text-xs font-bold text-muted-foreground/80 group-hover/contact:text-foreground transition-colors">{supplier.email || "---"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 group/contact">
                                                    <Phone className="h-3.5 w-3.5 text-primary opacity-40 group-hover/contact:opacity-100 transition-opacity" />
                                                    <span className="text-xs font-bold text-muted-foreground/80 group-hover/contact:text-foreground transition-colors">{supplier.phone || "---"}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-[9px] px-3 py-1.5 rounded-full bg-accent/50 text-muted-foreground border border-primary/5 font-black uppercase tracking-widest group-hover:border-primary/20 transition-all">
                                                {supplier.category || t("generalSupply")}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 w-fit">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} className={`h-2.5 w-2.5 ${star <= 4 ? 'fill-primary text-primary' : 'text-primary/20'}`} />
                                                ))}
                                                <span className="text-[10px] font-black text-primary ml-1">4.0</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link href={`/suppliers/${supplier.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/20 border border-primary/10">
                                                        {t("logistics")} <ArrowUpRight className="ml-1 h-3 w-3" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:bg-accent transition-all shrink-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    <div className="px-8 py-5 border-t border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{t("supplyMatrix", { count: suppliers?.length || 0 })}</p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-primary/10 bg-primary/10 text-primary font-black text-xs shadow-lg shadow-primary/10">1</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
