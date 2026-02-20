import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

export default function NewProductPage() {
    async function addProduct(formData: FormData) {
        "use server"

        // Auth validation
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            redirect("/login")
        }

        // Get the tenant_id from profiles
        const { data: profile } = await supabase
            .from("profiles")
            .select("tenant_id")
            .eq("id", user.id)
            .single()

        if (!profile?.tenant_id) {
            throw new Error("User has no tenant assigned")
        }

        const name = formData.get("name") as string
        const category = formData.get("category") as string
        const sku = formData.get("sku") as string
        const barcode = formData.get("barcode") as string
        const cost_price = parseFloat(formData.get("cost_price") as string) || 0
        const selling_price = parseFloat(formData.get("selling_price") as string) || 0
        const stock_quantity = parseInt(formData.get("stock_quantity") as string) || 0
        const low_stock_threshold = parseInt(formData.get("low_stock_threshold") as string) || 5

        const { error } = await supabase
            .from("products")
            .insert({
                tenant_id: profile.tenant_id,
                name,
                category,
                sku: sku || null,
                barcode: barcode || null,
                cost_price,
                selling_price,
                stock_quantity,
                low_stock_threshold
            })

        if (error) {
            console.error(error)
            throw new Error(error.message)
        }

        redirect("/products")
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">New Product</h1>

            <form action={addProduct}>
                <Card>
                    <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input id="name" name="name" required placeholder="e.g. Smartphone Case" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" name="category" placeholder="e.g. Accessories" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input id="sku" name="sku" placeholder="Auto-generated if empty" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cost_price">Cost Price</Label>
                                <Input id="cost_price" name="cost_price" type="number" step="0.01" defaultValue="0" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="selling_price">Selling Price *</Label>
                                <Input id="selling_price" name="selling_price" type="number" step="0.01" required defaultValue="0" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock_quantity">Initial Stock</Label>
                                <Input id="stock_quantity" name="stock_quantity" type="number" defaultValue="0" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="low_stock_threshold">Low Stock Alert Level</Label>
                                <Input id="low_stock_threshold" name="low_stock_threshold" type="number" defaultValue="5" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="barcode">Barcode</Label>
                            <Input id="barcode" name="barcode" placeholder="Scan or type barcode" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/products">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit">Save Product</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
