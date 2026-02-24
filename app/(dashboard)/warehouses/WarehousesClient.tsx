"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    Plus,
    ArrowUpRight,
    MapPin,
    Building2,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Card, CardContent } from "@/components/ui/card"
import { createWarehouse, updateWarehouse, deleteWarehouse } from "./actions"

interface Warehouse {
    id: string;
    name: string;
    address: string | null;
}

export function WarehousesClient({ initialWarehouses }: { initialWarehouses: Warehouse[] }) {
    const t = useTranslations("Settings")
    const router = useRouter()
    const [isAdding, setIsAdding] = useState(false)
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [addOpen, setAddOpen] = useState(false)

    async function handleAdd(formData: FormData) {
        setIsAdding(true)
        const res = await createWarehouse(formData)
        setIsAdding(false)
        if (res.success) {
            setAddOpen(false)
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    async function handleUpdate(id: string, formData: FormData) {
        setIsUpdating(id)
        const res = await updateWarehouse(id, formData)
        setIsUpdating(null)
        if (res.success) {
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm(t("deleteWarehouseConfirm") || "Êtes-vous sûr de vouloir supprimer cet entrepôt ?")) return
        setIsDeleting(id)
        const res = await deleteWarehouse(id)
        setIsDeleting(null)
        if (res.success) {
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    const handleViewStock = (w: Warehouse) => {
        // Set cookie manually and redirect to ensure server-side data is correct on next page
        document.cookie = `stockflow_active_warehouse=${w.id}; path=/; max-age=31536000; SameSite=Lax`;
        localStorage.setItem('stockflow_active_warehouse', w.id);
        window.location.href = "/products";
    }

    return (
        <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">{t("depotNetwork")}</h1>
                    <p className="text-xs text-muted-foreground/60 font-medium mt-2 uppercase tracking-widest underline underline-offset-4 decoration-primary/30">{t("geographicLogicalStorage")}</p>
                </div>
                <Sheet open={addOpen} onOpenChange={setAddOpen}>
                    <SheetTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-2xl h-11 px-6 uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                            <Plus className="h-4 w-4 stroke-[3px]" /> {t("addNewLocation")}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[400px] sm:w-[540px] border-primary/10 bg-background/80 backdrop-blur-xl p-0">
                        <form action={handleAdd} className="h-full flex flex-col">
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
                                    <Input name="name" placeholder={t("depotNamePlaceholder")} className="h-12 border-primary/20 rounded-xl bg-primary/5 font-bold focus-visible:ring-primary shadow-inner" required />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("geographicCoordinates")}</Label>
                                    <Input name="address" placeholder={t("depotAddressPlaceholder")} className="h-12 border-primary/20 rounded-xl bg-primary/5 font-medium focus-visible:ring-primary shadow-inner" required />
                                </div>
                            </div>
                            <div className="p-6 border-t border-primary/10 bg-accent/10">
                                <SheetFooter className="flex w-full sm:justify-between gap-4">
                                    <SheetClose asChild>
                                        <Button type="button" variant="outline" className="h-12 rounded-xl flex-1 border-primary/20 font-bold hover:bg-primary/5">{t("abort")}</Button>
                                    </SheetClose>
                                    <Button type="submit" disabled={isAdding} className="h-12 rounded-xl flex-1 bg-primary text-[#102219] font-black uppercase tracking-widest text-xs hover:bg-primary/90 shadow-xl shadow-primary/20">
                                        {isAdding ? <Loader2 className="animate-spin h-4 w-4" /> : t("initializeNode")}
                                    </Button>
                                </SheetFooter>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(!initialWarehouses || initialWarehouses.length === 0) ? (
                    <div className="col-span-full p-12 text-center rounded-3xl border border-dashed border-primary/20 bg-primary/5">
                        <Building2 className="size-10 text-primary/40 mx-auto mb-4" />
                        <h4 className="text-sm font-black tracking-tight mb-1">{t("noDepotsFound")}</h4>
                        <p className="text-xs text-muted-foreground font-medium">{t("createFirstWarehouse")}</p>
                    </div>
                ) : (
                    initialWarehouses.map((w: Warehouse) => (
                        <Card key={w.id} className="glass-card group hover:scale-[1.02] transition-all duration-300 border-primary/10 overflow-hidden">
                            <div className="h-32 bg-primary/[0.03] w-full border-b border-primary/5 relative flex items-center justify-center overflow-hidden">
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

                                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-primary/5">
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button variant="outline" className="h-9 rounded-xl border-primary/20 text-xs font-bold hover:bg-primary/10">{t("configure")}</Button>
                                        </SheetTrigger>
                                        <SheetContent side="right" className="w-[400px] sm:w-[540px] border-primary/10 bg-background/80 backdrop-blur-xl p-0">
                                            <form action={(formData) => handleUpdate(w.id, formData)} className="h-full flex flex-col">
                                                <div className="p-6 border-b border-primary/10">
                                                    <SheetHeader>
                                                        <SheetTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                                                            <div className="size-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Building2 className="size-5" /></div>
                                                            {w.name}
                                                        </SheetTitle>
                                                        <SheetDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{t("warehousesNetwork")}</SheetDescription>
                                                    </SheetHeader>
                                                </div>
                                                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                                                    <div className="space-y-2 pb-4 border-b border-primary/10">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("uuidTracker")}</Label>
                                                        <div className="p-3 rounded-lg bg-accent font-mono text-[10px] overflow-hidden text-ellipsis opacity-60 italic">{w.id}</div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="space-y-3">
                                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("depotName")}</Label>
                                                            <Input name="name" defaultValue={w.name} className="h-12 border-primary/20 rounded-xl bg-primary/5 font-bold focus-visible:ring-primary shadow-inner" required />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("currentAddress")}</Label>
                                                            <Input name="address" defaultValue={w.address || ""} className="h-12 border-primary/20 rounded-xl bg-primary/5 font-medium focus-visible:ring-primary shadow-inner" required />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-6 border-t border-primary/10 bg-accent/10">
                                                    <div className="flex flex-col gap-3">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={() => handleDelete(w.id)}
                                                            disabled={isDeleting === w.id}
                                                            className="w-full opacity-80 hover:opacity-100 font-bold rounded-xl h-11"
                                                        >
                                                            {isDeleting === w.id ? <Loader2 className="animate-spin h-4 w-4" /> : t("decommissionDepot")}
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            disabled={isUpdating === w.id}
                                                            className="w-full bg-primary text-[#102219] font-black uppercase tracking-widest text-xs h-11 rounded-xl shadow-xl shadow-primary/20"
                                                        >
                                                            {isUpdating === w.id ? <Loader2 className="animate-spin h-4 w-4" /> : t("saveChanges")}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </form>
                                        </SheetContent>
                                    </Sheet>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleViewStock(w)}
                                        className="h-9 rounded-xl border-primary/20 text-xs font-bold text-primary hover:bg-primary/10"
                                    >
                                        <ArrowUpRight className="size-3 mr-1" /> {t("viewStock")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
