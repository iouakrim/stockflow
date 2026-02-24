"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateTenantName } from "./actions"
import { toast } from "sonner"

export function GeneralSettingsForm({ initialName, currency, labels }: { initialName: string, currency: string, labels: Record<string, string> }) {
    const [name, setName] = useState(initialName)
    const [isSaving, setIsSaving] = useState(false)

    async function handleSave() {
        if (!name.trim()) {
            toast.error("Le nom ne peut pas être vide")
            return
        }

        setIsSaving(true)
        const result = await updateTenantName(name)
        setIsSaving(false)

        if (result.success) {
            toast.success("Désignation mise à jour avec succès")
        } else {
            toast.error(result.error || "Une erreur est survenue")
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{labels.entityDesignation}</Label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-2xl bg-card border-primary/10 focus-visible:ring-primary font-bold px-5"
                />
            </div>
            <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{labels.primaryCurrencyBase}</Label>
                <Input defaultValue={currency} disabled className="h-12 rounded-2xl bg-primary/[0.02] border-primary/10 text-muted-foreground font-bold px-5 opacity-70 cursor-not-allowed" />
            </div>
            <div className="pt-4">
                <Button
                    onClick={handleSave}
                    disabled={isSaving || name === initialName}
                    className="bg-primary text-[#102219] font-black rounded-2xl h-12 px-8 uppercase text-[10px] tracking-widest hover:scale-[1.02] shadow-xl shadow-primary/20"
                >
                    {isSaving ? "Enregistrement..." : labels.commitChanges}
                </Button>
            </div>
        </div>
    )
}
