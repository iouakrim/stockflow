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
    Save,
    Tag,
    DollarSign,
    Boxes,
    Truck,
    Loader2
} from "lucide-react"
import { Product } from "@/types"

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

interface ProductEditFormProps {
    product: Product
    suppliers: Supplier[]
}

export function ProductEditForm({ product, suppliers }: ProductEditFormProps) {
    const router = useRouter()
    const { currency } = useSettings()
    const supabase = createClient()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<ProductFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: product.name ?? "",
            category: product.category ?? "",
            unit: product.unit ?? "KG",
            supplier_id: product.supplier_id ?? "none",
            sku: product.sku ?? "",
            barcode: product.barcode ?? "",
            description: product.description ?? "",
            cost_price: product.cost_price ?? 0,
            selling_price: product.selling_price ?? 0,
        }
    })

    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true)
        try {
            const { error } = await supabase.from("products").update({
                name: data.name,
                category: data.category || null,
                supplier_id: data.supplier_id === "none" ? null : data.supplier_id,
                description: data.description || null,
                unit: data.unit,
                sku: data.sku || null,
                barcode: data.barcode || null,
                cost_price: data.cost_price,
                selling_price: data.selling_price,
            }).eq("id", product.id)

            if (error) {
                if (error.code === '23505') throw new Error("Un produit avec ce code-barres ou SKU existe déjà.")
                throw new Error(error.message)
            }

            toast.success("Produit mis à jour avec succès")
            router.push("/products")
            router.refresh()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour"
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-20">
            <div className="lg:col-span-2 space-y-5">
                {/* Section Base */}
                <div className="glass-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Tag className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-black tracking-tight uppercase">Base</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Nom du produit <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                {...form.register("name")}
                                className="h-10 bg-card/40 border-primary/10 rounded-xl px-4 font-bold focus:ring-primary focus:border-primary/30 transition-all"
                            />
                            {form.formState.errors.name && (
                                <p className="text-xs text-red-500 font-bold ml-1">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Catégorie</Label>
                                <Select
                                    onValueChange={(v) => form.setValue('category', v)}
                                    defaultValue={form.getValues('category')}
                                >
                                    <SelectTrigger id="category" className="h-10 bg-card/40 border-primary/10 rounded-xl px-4 font-bold focus:ring-primary transition-all">
                                        <SelectValue placeholder="Sélectionner..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-primary/10 p-1">
                                        {[
                                            "Aliments Volailles",
                                            "Aliments Bovins",
                                            "Aliments Ovins",
                                            "Aliments Caprins",
                                            "Aliments Équins",
                                            "Aliments Lapins",
                                            "Aliments Porcins",
                                            "Compléments Minéraux",
                                            "Vitamines & Additifs",
                                            "Produits Vétérinaires",
                                            "Emballages & Accessoires",
                                            "Autre",
                                        ].map(cat => (
                                            <SelectItem key={cat} value={cat} className="rounded-lg py-2 font-bold focus:bg-primary/10 focus:text-primary">{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="unit" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Unité <span className="text-red-500">*</span></Label>
                                <Select
                                    onValueChange={(v) => form.setValue('unit', v)}
                                    defaultValue={form.getValues('unit') || 'KG'}
                                >
                                    <SelectTrigger id="unit" className="h-10 bg-card/40 border-primary/10 rounded-xl px-4 font-bold focus:ring-primary transition-all">
                                        <SelectValue placeholder="Unité..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-primary/10 p-1">
                                        {[
                                            { value: 'KG', label: 'KG — Kilogramme' },
                                            { value: 'UN', label: 'UN — Unité' },
                                            { value: 'L', label: 'L — Litre' },
                                            { value: 'M', label: 'M — Mètre' },
                                        ].map(u => (
                                            <SelectItem key={u.value} value={u.value} className="rounded-lg py-2 font-bold focus:bg-primary/10 focus:text-primary">{u.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.formState.errors.unit && (
                                    <p className="text-xs text-red-500 font-bold ml-1">{form.formState.errors.unit.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="supplier_id" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center gap-1.5">
                                <Truck className="h-3 w-3" /> Fournisseur Préféré
                            </Label>
                            <Select
                                onValueChange={(v) => form.setValue('supplier_id', v)}
                                defaultValue={form.getValues('supplier_id')}
                            >
                                <SelectTrigger className="h-10 bg-card/40 border-primary/10 rounded-xl px-4 font-bold focus:ring-primary transition-all">
                                    <SelectValue placeholder="Sélectionner un fournisseur" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-primary/10 p-1">
                                    <SelectItem value="none" className="rounded-lg py-2 font-bold focus:bg-primary/10 focus:text-primary">Aucun fournisseur spécifique</SelectItem>
                                    {suppliers?.map(s => (
                                        <SelectItem key={s.id} value={s.id} className="rounded-lg py-2 font-bold focus:bg-primary/10 focus:text-primary">{s.name.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Section Valorisation */}
                <div className="glass-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="size-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <DollarSign className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-black tracking-tight uppercase">Valorisation</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                            <Label htmlFor="cost_price" className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 ml-1 flex items-center justify-between">
                                Prix d&apos;achat <span className="bg-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded text-[8px]">PUMP</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="cost_price"
                                    type="number"
                                    step="0.01"
                                    {...form.register("cost_price")}
                                    className="h-10 bg-background/50 border-amber-500/20 rounded-xl pl-4 pr-12 font-mono font-black focus:ring-amber-500 transition-all text-amber-500"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-30 select-none">{currency}</span>
                            </div>
                            {form.formState.errors.cost_price && (
                                <p className="text-xs text-red-500 font-bold ml-1">{form.formState.errors.cost_price.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                            <Label htmlFor="selling_price" className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 ml-1 flex items-center justify-between">
                                Prix de vente public <span className="bg-emerald-500/20 text-emerald-600 px-1.5 py-0.5 rounded text-[8px]">PVP</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="selling_price"
                                    type="number"
                                    step="0.01"
                                    {...form.register("selling_price")}
                                    className="h-10 bg-background/50 border-emerald-500/20 rounded-xl pl-4 pr-12 font-mono font-black focus:ring-emerald-500 transition-all text-emerald-500"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black opacity-30 select-none">{currency}</span>
                            </div>
                            {form.formState.errors.selling_price && (
                                <p className="text-xs text-red-500 font-bold ml-1">{form.formState.errors.selling_price.message}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                {/* Section Traçabilité */}
                <div className="glass-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="size-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                            <Boxes className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-black tracking-tight uppercase">Traçabilité</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center justify-between">
                                SKU Code
                                <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded opacity-50">OPTIONNEL</span>
                            </Label>
                            <Input
                                id="sku"
                                {...form.register("sku")}
                                className="h-10 bg-card/40 border-primary/10 rounded-xl px-4 font-mono font-black focus:ring-blue-500 transition-all uppercase tracking-widest"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="barcode" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center justify-between">
                                Code-Barres EAN/UPC
                                <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded opacity-50">OPTIONNEL</span>
                            </Label>
                            <Input
                                id="barcode"
                                {...form.register("barcode")}
                                className="h-10 bg-card/40 border-primary/10 rounded-xl px-4 font-mono font-black focus:ring-blue-500 transition-all tracking-widest"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Notes / Description</Label>
                            <Input
                                id="description"
                                {...form.register("description")}
                                className="h-10 bg-card/40 border-primary/10 rounded-xl px-4 font-medium focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                    {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" /> Enregistrer les modifications</>
                    )}
                </Button>
            </div>
        </form>
    )
}
