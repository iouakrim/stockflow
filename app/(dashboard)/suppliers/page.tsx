import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { Supplier } from "@/types"
import {
    Plus,
    Search,
    Phone,
    Mail,
    MapPin,
    Truck,
    Building2,
    ArrowUpRight
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
                    <Link href="/suppliers/new">
                        <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Plus className="h-5 w-5 stroke-[3px]" /> {t("onboardPartner")}
                        </Button>
                    </Link>
                </div>
            </div>


            {/* Supplier Directory Table */}
            <div className="space-y-6 pb-20">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:max-w-sm group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            className="w-full bg-card/40 border border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30"
                            placeholder={t("search")}
                        />
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
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-8">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!suppliers || suppliers.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic opacity-50">
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
                                        <TableCell className="text-right px-8">
                                            <Link href={`/suppliers/${supplier.id}`}>
                                                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary/20 text-primary hover:bg-primary transition-all hover:text-background border border-primary/10">
                                                    {t("logistics")} <ArrowUpRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </Link>
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
