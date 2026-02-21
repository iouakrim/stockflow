"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import {
    MoreHorizontal,
    Shield,
    Warehouse,
    Mail,
    User,
    Loader2,
    CheckCircle2,
    Trash2,
    KeyRound,
    Settings2
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { updateUserAccess, deleteUser, sendUserResetPassword } from "./actions"

export function UserActionsDropdown({ user, warehouses, currentUserId }: { user: any, warehouses: any[], currentUserId?: string }) {
    const t = useTranslations("Settings")
    const router = useRouter()
    const [editOpen, setEditOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [role, setRole] = useState(user.role)
    const [selectedWarehouses, setSelectedWarehouses] = useState<string[]>(user.warehouse_access || [])

    const isSelf = user.id === currentUserId

    async function handleUpdateAccess(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        const res = await updateUserAccess(user.id, {
            role,
            warehouseAccess: selectedWarehouses
        })
        setIsLoading(false)
        if (res.success) {
            setEditOpen(false)
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    async function handleDelete() {
        if (!confirm(`Toutes les données liées à ${user.full_name} seront conservées, mais l'utilisateur ne pourra plus se connecter. Confirmer la suppression ?`)) return
        setIsLoading(true)
        const res = await deleteUser(user.id)
        setIsLoading(false)
        if (res.success) {
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    async function handleResetPassword() {
        setIsLoading(true)
        const res = await sendUserResetPassword(user.email)
        setIsLoading(true) // Keep loading state for effect or success message
        setTimeout(() => setIsLoading(false), 1000)
        if (res.success) {
            alert(`Un email de réinitialisation a été envoyé à ${user.email}`)
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
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl bg-[#0a140f] border-primary/10 shadow-xl shadow-black p-1">
                    {user.role !== 'admin' && (
                        <DropdownMenuItem
                            onClick={() => setEditOpen(true)}
                            className="text-xs font-bold py-2.5 cursor-pointer text-foreground focus:bg-primary/10 focus:text-primary rounded-lg flex items-center gap-2"
                        >
                            <Settings2 className="size-3.5" /> {t("configureAccess")}
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                        onClick={handleResetPassword}
                        className="text-xs font-bold py-2.5 cursor-pointer text-foreground focus:bg-primary/10 rounded-lg flex items-center gap-2"
                    >
                        <KeyRound className="size-3.5" /> {t("resetPassword")}
                    </DropdownMenuItem>

                    {!isSelf && (
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="text-xs font-bold py-2.5 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500 rounded-lg flex items-center gap-2"
                        >
                            <Trash2 className="size-3.5" /> {t("terminateConnection")}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={editOpen} onOpenChange={setEditOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] border-primary/10 bg-background/80 backdrop-blur-xl p-0">
                    <form onSubmit={handleUpdateAccess} className="h-full flex flex-col">
                        <div className="p-6 border-b border-primary/10">
                            <SheetHeader>
                                <div className="size-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-2">
                                    <Settings2 className="size-6" />
                                </div>
                                <SheetTitle className="text-2xl font-black tracking-tight">{t("configureAccess")}</SheetTitle>
                                <SheetDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                                    Modifier les privilèges de {user.full_name}
                                </SheetDescription>
                            </SheetHeader>
                        </div>

                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t("assignedRole")}</Label>
                                    <Select
                                        value={role}
                                        onValueChange={(v) => {
                                            setRole(v)
                                            setSelectedWarehouses([])
                                        }}
                                        disabled={user.role === 'admin'}
                                    >
                                        <SelectTrigger className="h-12 border-primary/10 rounded-xl bg-primary/5 font-bold focus:ring-primary">
                                            <SelectValue placeholder="Sélectionner un rôle" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/10 bg-[#0a140f] text-foreground">
                                            <SelectItem value="admin" className="font-bold py-3 focus:bg-primary/10">Admin (Accès Total)</SelectItem>
                                            <SelectItem value="manager" className="font-bold py-3 focus:bg-primary/10">Manager (Multi-Dépôts)</SelectItem>
                                            <SelectItem value="cashier" className="font-bold py-3 focus:bg-primary/10">Caissier (Point de Vente)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {user.role === 'admin' && (
                                        <p className="text-[9px] text-muted-foreground italic mt-1">* Le rôle Administrateur est verrouillé pour des raisons de sécurité du système.</p>
                                    )}
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
                                </div>
                            )}

                            {isSelf && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                                        <Shield className="size-3" /> Attention
                                    </p>
                                    <p className="text-[10px] text-amber-500/80 font-medium italic">
                                        Vous modifiez votre propre profil. Assurez-vous de conserver vos accès administratifs.
                                    </p>
                                </div>
                            )}
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
                                    {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : t("saveChanges")}
                                </Button>
                            </SheetFooter>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </>
    )
}
