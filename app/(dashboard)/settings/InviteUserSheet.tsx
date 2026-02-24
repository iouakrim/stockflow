"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    UserPlus,
    Shield,
    Warehouse,
    Mail,
    User,
    Loader2,
    CheckCircle2
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { inviteUser } from "./actions"

export function InviteUserSheet({ warehouses }: { warehouses: { id: string; name: string; address?: string | null }[] }) {
    const t = useTranslations("Settings")
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [role, setRole] = useState("cashier")
    const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>([])
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const fullName = formData.get("fullName") as string

        const res = await inviteUser({
            email,
            fullName,
            role,
            warehouseAccess: selectedWarehouses
        })

        setIsLoading(false)
        if (res.success) {
            setIsOpen(false)
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    const toggleWarehouse = (id: string) => {
        if (role === "cashier") {
            setSelectedWarehouses([id])
        } else {
            setSelectedWarehouses(prev =>
                prev.includes(id)
                    ? prev.filter(wId => wId !== id)
                    : [...prev, id]
            )
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-2xl h-11 px-6 uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                    <UserPlus className="h-4 w-4 stroke-[3px]" /> {t("inviteUser") || "Inviter Utilisateur"}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] border-primary/10 bg-background/80 backdrop-blur-xl p-0">
                <form onSubmit={handleSubmit} className="h-full flex flex-col">
                    <div className="p-6 border-b border-primary/10">
                        <SheetHeader>
                            <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-2">
                                <UserPlus className="size-6" />
                            </div>
                            <SheetTitle className="text-2xl font-black tracking-tight">{t("newUser")}</SheetTitle>
                            <SheetDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                {t("onboardNewTeamMember")}
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <User className="size-3" /> {t("fullName")}
                                </Label>
                                <Input name="fullName" placeholder="Ex: Jean Dupont" required className="h-12 border-primary/10 rounded-xl bg-primary/5 font-bold focus-visible:ring-primary shadow-inner px-5" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Mail className="size-3" /> {t("emailAddress")}
                                </Label>
                                <Input name="email" type="email" placeholder="jean.dupont@stockflow.pro" required className="h-12 border-primary/10 rounded-xl bg-primary/5 font-bold focus-visible:ring-primary shadow-inner px-5" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Shield className="size-3" /> {t("assignedRole")}
                                </Label>
                                <Select value={role} onValueChange={(v) => {
                                    setRole(v)
                                    setSelectedWarehouses([])
                                }}>
                                    <SelectTrigger className="h-12 border-primary/10 rounded-xl bg-primary/5 font-bold focus:ring-primary">
                                        <SelectValue placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-primary/10 bg-[#0a140f] text-foreground">
                                        <SelectItem value="admin" className="font-bold py-3 focus:bg-primary/10">Admin (Accès Total)</SelectItem>
                                        <SelectItem value="manager" className="font-bold py-3 focus:bg-primary/10">Manager (Multi-Dépôts)</SelectItem>
                                        <SelectItem value="cashier" className="font-bold py-3 focus:bg-primary/10">Caissier (Point de Vente)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {(role === "manager" || role === "cashier") && (
                            <div className="space-y-4 pt-6 border-t border-primary/10">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Warehouse className="size-3" /> {role === "cashier" ? t("assignedDepot") : t("authorizedDepots")}
                                </Label>

                                <div className="grid grid-cols-1 gap-2 mt-2">
                                    {warehouses.map((w) => (
                                        <div
                                            key={w.id}
                                            onClick={() => toggleWarehouse(w.id)}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedWarehouses.includes(w.id)
                                                ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                                                : "bg-primary/5 border-primary/10 hover:border-primary/30"
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black tracking-tight">{w.name}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{w.address || "No address"}</span>
                                            </div>
                                            {selectedWarehouses.includes(w.id) && (
                                                <CheckCircle2 className="size-5 text-primary" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {selectedWarehouses.length === 0 && (
                                    <p className="text-[10px] text-red-500/80 font-bold italic">
                                        * {role === "cashier" ? "Veuillez sélectionner un dépôt." : "Veuillez sélectionner au moins un dépôt."}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3 mt-6">
                            <Mail className="size-5 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-foreground">{t("emailNotification")}</p>
                                <p className="text-[10px] text-muted-foreground font-medium italic">
                                    {t("inviteInfo")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-primary/10 bg-accent/10">
                        <SheetFooter className="flex w-full sm:justify-between gap-4">
                            <SheetClose asChild>
                                <Button type="button" variant="outline" className="h-12 rounded-xl flex-1 border-primary/20 font-bold hover:bg-primary/5 uppercase text-[10px] tracking-widest">{t("abort")}</Button>
                            </SheetClose>
                            <Button
                                type="submit"
                                disabled={isLoading || ((role === "manager" || role === "cashier") && selectedWarehouses.length === 0)}
                                className="h-12 rounded-xl flex-1 bg-primary text-[#102219] font-black uppercase tracking-widest text-[10px] hover:bg-primary/90 shadow-xl shadow-primary/20"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : t("sendInvite")}
                            </Button>
                        </SheetFooter>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
