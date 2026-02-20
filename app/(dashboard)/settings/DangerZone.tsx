"use client"

import { useState } from "react"
import { deleteUserAccount } from "./actions"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ShieldAlert, Trash2, Loader2, Info } from "lucide-react"

export function DangerZone() {
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setIsDeleting(true)
        setError(null)
        try {
            const result = await deleteUserAccount()
            if (result.error) {
                setError(result.error)
            } else {
                window.location.href = "/"
            }
        } catch (err) {
            setError("Wipe protocol failed. Direct manual intervention required. " + err)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 p-6 rounded-3xl bg-red-500/5 border border-red-500/10">
                <div className="size-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <ShieldAlert className="size-6" />
                </div>
                <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-red-500">Danger Zone</h4>
                    <p className="text-xs text-muted-foreground font-medium">Irreversible actions. Authorized personnel only.</p>
                </div>
            </div>

            <div className="glass-card p-10 rounded-[2.5rem] border-red-500/10 bg-red-500/[0.02]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h5 className="text-lg font-black tracking-tight">Total Account Wipe</h5>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-md">
                            Eliminate all corporate nodes, inventory logs, and access credentials.
                            This procedure is <span className="text-red-500 font-bold uppercase underline decoration-red-500/30">absolute</span> and cannot be undone.
                        </p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500 font-black rounded-2xl px-8 h-12 uppercase text-[10px] tracking-widest transition-all">
                                <Trash2 className="size-4 mr-2" /> Initialize Wipeout
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0a140f] border-red-500/20 rounded-[2.5rem] p-10">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tighter text-white">Security Verification</DialogTitle>
                                <DialogDescription className="text-sm text-white/40 font-medium">
                                    You are initiating a level-7 system wipe. This will purge all associated facility data.
                                </DialogDescription>
                            </DialogHeader>

                            {error && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 mt-4">
                                    <Info className="size-4 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{error}</p>
                                </div>
                            )}

                            <DialogFooter className="mt-8 gap-3 sm:gap-0">
                                <Button variant="ghost" className="rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-white/5" onClick={() => setError(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl px-10 h-14 uppercase text-[10px] tracking-widest shadow-2xl shadow-red-500/20"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="animate-spin" /> : "Confirm Protocol"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}
