import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Product } from "@/types"

export default async function ProductsPage() {
    const supabase = createClient()

    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products</h1>
                <Link href="/products/new">
                    <Button>Add Product</Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!products || products.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No products found.
                                    {error && <span className="block text-destructive text-sm mt-2">{error.message}</span>}
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product: Product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.sku || "-"}</TableCell>
                                    <TableCell>${product.selling_price}</TableCell>
                                    <TableCell>
                                        <span className={product.stock_quantity <= product.low_stock_threshold ? "text-destructive font-bold" : ""}>
                                            {product.stock_quantity}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
