"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useSettings } from "@/components/providers/SettingsProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Package,
    Save,
    Tag,
    DollarSign,
    Layers,
    Boxes,
    Truck,
    Loader2
} from "lucide-react"

const productSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    category: z.string().optional(),
    unit: z.string().min(1, "L'unité est requise"),
    supplier_id: z.string().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    description: z.string().optional(),
    cost_price: z.coerce.number().min(0, "Le prix d'achat ne peut pas être négatif"),
    selling_price: z.coerce.number().min(0, "Le prix de vente ne peut pas être négatif"),
})

type ProductFormValues = z.infer<typeof productSchema>

interface Supplier {
    id: string
    name: string
}

export function ProductForm({ suppliers, tenantId }: { suppliers: Supplier[], tenantId: string }) {
    const router = useRouter()
    const { currency } = useSettings()
    const supabase = createClient()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            category: "",
            unit: "pc",
            supplier_id: "none",
            sku: "",
            barcode: "",
            description: "",
            cost_price: 0,
            selling_price: 0,
        }
    })

    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true)
        try {
            const { error } = await supabase.from("products").insert({
                tenant_id: tenantId,
                name: data.name,
                category: data.category || null,
                supplier_id: data.supplier_id === "none" ? null : data.supplier_id,
                description: data.description || null,
                unit: data.unit || 'kg',
                sku: data.sku || null,
                barcode: data.barcode || null,
                cost_price: data.cost_price,
                selling_price: data.selling_price,
            })

            if (error) {
                if (error.code === '23505') {
                    throw new Error("Un produit avec ce code-barres ou SKU existe déjà.")
                }
                throw new Error(error.message)
            }

            toast.success("Produit ajouté au catalogue avec succès")
            router.push("/products")
            router.refresh()
        } catch (error: unknown) {
            console.error(error)
            const message = error instanceof Error ? error.message : "Erreur lors de la création du produit"
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            <div className="lg:col-span-2 space-y-8">
                {/* Section Base */}
                <div className="glass-card rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <Package className="size-32" />
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Tag className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight uppercase">Base</h3>
                    </div>

                    <div className="space-y-6 relative">
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Nom du produit <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                {...form.register("name")}
                                className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 text-base font-bold focus:ring-primary focus:border-primary/30 transition-all placeholder:font-medium"
                                placeholder="ex: Ciphone 15 Pro Max"
                            />
                            {form.formState.errors.name && (
                                <p className="text-xs text-red-500 font-bold ml-2">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Catégorie</Label>
                                <Input
                                    id="category"
                                    {...form.register("category")}
                                    className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 font-bold focus:ring-primary transition-all"
                                    placeholder="Electronique, Alimentaire..."
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="unit" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Unité (pc, kg, L) <span className="text-red-500">*</span></Label>
                                <Input
                                    id="unit"
                                    {...form.register("unit")}
                                    className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 font-bold focus:ring-primary transition-all placeholder:italic"
                                    placeholder="ex: pc"
                                />
                                {form.formState.errors.unit && (
                                    <p className="text-xs text-red-500 font-bold ml-2">{form.formState.errors.unit.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="supplier_id" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center gap-2">
                                <Truck className="h-3 w-3" /> Fournisseur Préféré
                            </Label>
                            <Select
                                onValueChange={(v) => form.setValue('supplier_id', v)}
                                defaultValue={form.getValues('supplier_id')}
                            >
                                <SelectTrigger className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 font-bold focus:ring-primary transition-all">
                                    <SelectValue placeholder="Sélectionner un fournisseur" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-primary/10 p-2">
                                    <SelectItem value="none" className="rounded-xl py-3 font-bold focus:bg-primary/10 focus:text-primary">Aucun fournisseur spécifique</SelectItem>
                                    {suppliers?.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="rounded-xl py-3 font-bold focus:bg-primary/10 focus:text-primary">{s.name.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Section Valorisation */}
                <div className="glass-card rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <DollarSign className="size-32" />
                    </div>

                    <div className="flex items-center gap-4 mb-2 relative">
                        <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight uppercase">Valorisation</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                        {/* Cost Price */}
                        <div className="space-y-3 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 shadow-inner group/input focus-within:bg-amber-500/10 transition-colors">
                            <Label htmlFor="cost_price" className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 ml-1 flex items-center justify-between">
                                Prix d&apos;achat <span className="bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-lg">PUMP</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="cost_price"
                                    type="number"
                                    step="0.01"
                                    {...form.register("cost_price")}
                                    className="h-14 bg-background/50 border-amber-500/20 rounded-2xl pl-6 pr-12 font-mono font-black text-lg focus:ring-amber-500 transition-all text-amber-500"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black opacity-30 select-none">{currency}</span>
                            </div>
                            {form.formState.errors.cost_price && (
                                <p className="text-xs text-red-500 font-bold ml-2 mt-2">{form.formState.errors.cost_price.message}</p>
                            )}
                        </div>

                        {/* Selling Price */}
                        <div className="space-y-3 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 shadow-inner group/input focus-within:bg-emerald-500/10 transition-colors">
                            <Label htmlFor="selling_price" className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 ml-1 flex items-center justify-between">
                                Prix de vente public <span className="bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-lg">PVP</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="selling_price"
                                    type="number"
                                    step="0.01"
                                    {...form.register("selling_price")}
                                    className="h-14 bg-background/50 border-emerald-500/20 rounded-2xl pl-6 pr-12 font-mono font-black text-lg focus:ring-emerald-500 transition-all text-emerald-500"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black opacity-30 select-none">{currency}</span>
                            </div>
                            {form.formState.errors.selling_price && (
                                <p className="text-xs text-red-500 font-bold ml-2 mt-2">{form.formState.errors.selling_price.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Section Traçabilité */}
                <div className="glass-card rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden group h-full flex flex-col">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <Layers className="size-32" />
                    </div>

                    <div className="flex flex-col flex-1 relative">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Boxes className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight uppercase">Traçabilité</h3>
                        </div>

                        <div className="space-y-8 mt-6">
                            <div className="space-y-3">
                                <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center justify-between">
                                    SKU Code
                                    <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded opacity-50">OPTIONNEL</span>
                                </Label>
                                <Input
                                    id="sku"
                                    {...form.register("sku")}
                                    className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 font-mono font-black focus:ring-blue-500 transition-all uppercase tracking-widest"
                                    placeholder="PROD-XXX-000"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="barcode" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center justify-between">
                                    Code-Barres EAN/UPC
                                    <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded opacity-50">OPTIONNEL</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="barcode"
                                        {...form.register("barcode")}
                                        className="h-14 bg-card/40 border-primary/10 rounded-2xl pl-6 pr-12 font-mono font-black focus:ring-blue-500 transition-all tracking-widest"
                                        placeholder="0000000000000"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-30">
                                        <ScanLineIcon className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 flex-1 mt-auto">
                                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Notes / Description</Label>
                                <Input
                                    id="description"
                                    {...form.register("description")}
                                    className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 font-medium focus:ring-blue-500 transition-all"
                                    placeholder="Notes de produit"
                                />
                            </div>
                        </div>

                        <div className="mt-12 flex-1 flex flex-col justify-end">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-16 bg-primary hover:bg-primary/90 text-background font-black text-lg uppercase tracking-[0.1em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 group/btn"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Enregistrement...</>
                                ) : (
                                    <><Save className="mr-2 h-6 w-6 group-hover/btn:scale-110 transition-transform" /> Confirmer la Création</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

function ScanLineIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
            <line x1="7" x2="17" y1="12" y2="12" />
        </svg>
    )
}
