import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

export default function NewCustomerPage() {
    async function addCustomer(formData: FormData) {
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
        const email = formData.get("email") as string
        const phone = formData.get("phone") as string
        const address = formData.get("address") as string

        const { error } = await supabase
            .from("customers")
            .insert({
                tenant_id: profile.tenant_id,
                name,
                email: email || null,
                phone: phone || null,
                address: address || null,
            })

        if (error) {
            console.error(error)
            throw new Error(error.message)
        }

        redirect("/customers")
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">New Customer</h1>

            <form action={addCustomer}>
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input id="name" name="name" required placeholder="e.g. John Doe" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" placeholder="+123456789" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" placeholder="Physical Address" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/customers">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit">Save Customer</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
