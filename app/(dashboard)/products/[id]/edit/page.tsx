import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ProductEditForm } from "@/components/products/ProductEditForm"

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")

    // Fetch the product
    const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single()

    if (!product) notFound()

    // Fetch suppliers for the dropdown
    const { data: suppliers } = await supabase
        .from("suppliers")
        .select("id, name")
        .order("name", { ascending: true })

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/products" className="group">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all border border-primary/20">
                                <ArrowLeft className="h-4 w-4" />
                            </div>
                        </Link>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary underline underline-offset-4 decoration-primary/30">
                            Retour au catalogue
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">
                        Modifier le produit
                    </h1>
                    <p className="text-xs text-muted-foreground/50 font-bold uppercase tracking-widest mt-1.5 truncate max-w-sm">
                        {product.name}
                    </p>
                </div>

                <Link
                    href="/products"
                    className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border border-primary/10 bg-card/40 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                >
                    Annuler
                </Link>
            </div>

            <ProductEditForm product={product} suppliers={suppliers || []} />
        </div>
    )
}
