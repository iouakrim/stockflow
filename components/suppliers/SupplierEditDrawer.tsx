"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Pencil,
    Building2,
    Mail,
    Phone
} from "lucide-react"
import { updateSupplier } from "@/app/(dashboard)/suppliers/actions"
import { toast } from "sonner"
import { Supplier } from "@/types"

export function SupplierEditDrawer({ supplier }: { supplier: Supplier }) {
    const t = useTranslations("Suppliers")
    const [open, setOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsSaving(true)

        const formData = new FormData(event.currentTarget)
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
        }

        const result = await updateSupplier(supplier.id, data)

        setIsSaving(false)
        if (result.success) {
            toast.success(t("editSuccess") || "Supplier updated successfully")
            setOpen(false)
        } else {
            toast.error(result.error || "Failed to update supplier")
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                    <Pencil className="h-4 w-4 text-primary" /> {t("editEntity")}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md border-l border-primary/10 bg-card/95 backdrop-blur-xl">
                <SheetHeader className="mb-8">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <SheetTitle className="text-2xl font-black tracking-tighter uppercase">{t("editEntity")}</SheetTitle>
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-label ml-1">{t("companyName")}</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={supplier.name}
                                required
                                className="h-12 bg-background border-primary/10 rounded-xl font-bold focus:ring-primary transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="phone" className="text-label ml-1">{t("voiceProtocol")}</Label>
                                <div className="relative group/input">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={supplier.phone || ""}
                                        className="h-12 bg-background border-primary/10 rounded-xl pl-11 text-sm font-bold focus:ring-primary transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-label ml-1">{t("digitalTransmission")}</Label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={supplier.email || ""}
                                        className="h-12 bg-background border-primary/10 rounded-xl pl-11 text-sm font-bold focus:ring-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="w-full h-14 bg-primary hover:bg-primary/90 text-background font-black rounded-2xl shadow-xl shadow-primary/20 gap-3 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {isSaving ? (
                            <div className="h-5 w-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        ) : (
                            t("validatePartner")
                        )}
                    </Button>
                </form>
            </SheetContent>
        </Sheet>
    )
}
