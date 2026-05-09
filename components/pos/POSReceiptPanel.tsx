"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Printer, Loader2 } from "lucide-react"

interface POSReceiptPanelProps {
    completedSaleId: string;
    handleNewSale: () => void;
    handleRevertSale: () => void;
    isCancelling: boolean;
    idPrefix?: string;
}

export function POSReceiptPanel({
    completedSaleId,
    handleNewSale,
    handleRevertSale,
    isCancelling,
    idPrefix = ""
}: POSReceiptPanelProps) {
    const t = useTranslations("POS")

    const receiptId = `receipt-iframe-${idPrefix}`
    const pickupId = `pickup-iframe-${idPrefix}`

    return (
        <div className="flex flex-col h-full bg-background rounded-3xl overflow-hidden border border-primary/10 shadow-sm mt-2 mb-2">
            <div className="p-5 border-b border-primary/10 flex justify-between items-center bg-card">
                <h2 className="font-black text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {t("transactionComplete")}
                </h2>
            </div>
            <iframe id={receiptId} src={`/receipt/${completedSaleId}`} className="flex-1 w-full bg-white relative z-0" />
            <iframe id={pickupId} src={`/receipt/${completedSaleId}?type=pickup`} className="hidden" />
            <div className="p-4 bg-card border-t border-primary/10 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1 justify-center bg-emerald-500/10 text-emerald-600 rounded-xl py-1.5 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-widest">Imprimante Système Détectée</p>
                </div>
                <Button onClick={() => {
                    const rFrame = document.getElementById(receiptId) as HTMLIFrameElement;
                    if (rFrame && rFrame.contentWindow) rFrame.contentWindow.print();
                    setTimeout(() => {
                        const pFrame = document.getElementById(pickupId) as HTMLIFrameElement;
                        if (pFrame && pFrame.contentWindow) pFrame.contentWindow.print();
                    }, 1500);
                }} className="w-full h-14 rounded-xl bg-black hover:bg-black/90 text-white font-black tracking-widest uppercase shadow-xl shadow-black/10 text-[11px] gap-2 flex-col justify-center">
                    <div className="flex items-center gap-2 mb-0.5"><Printer className="w-4 h-4" /> IMPRIMER TOUT</div>
                    <span className="text-[8px] text-white/50 tracking-normal normal-case font-bold">(Ticket + Bon de Livraison)</span>
                </Button>
                <Button onClick={handleNewSale} variant="outline" className="w-full h-12 rounded-xl border-2 border-primary/20 hover:bg-primary/5 text-primary font-black tracking-widest uppercase text-xs">
                    {t("nextCustomer")}
                </Button>
                <Button onClick={handleRevertSale} disabled={isCancelling} variant="ghost" className="w-full h-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive font-black tracking-widest uppercase text-[10px]">
                    {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : "ANNULER LA VENTE & MODIFIER"}
                </Button>
            </div>
        </div>
    )
}
