import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
    return (
        <div className="flex-1 flex flex-col pt-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-primary/10 animate-pulse rounded-xl"></div>
                    <div className="h-4 w-32 bg-primary/5 animate-pulse rounded-lg"></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-32 bg-primary/5 animate-pulse rounded-2xl"></div>
                    <div className="h-12 w-40 bg-primary/10 animate-pulse rounded-2xl"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-card/40 border border-primary/5 rounded-[2rem] animate-pulse"></div>
                ))}
            </div>

            <div className="flex-1 min-h-[400px] bg-card/30 border border-primary/5 rounded-[2.5rem] p-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-primary opacity-50">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest">Chargement des modules...</p>
                </div>
            </div>
        </div>
    )
}
