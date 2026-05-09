"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { User, ChevronDown, Plus, X, Phone, Loader2 } from "lucide-react"
import { quickCreateCustomer } from "@/app/(dashboard)/sales/actions"

interface POSCustomerSelectProps {
    isCustomerOpen: boolean;
    setIsCustomerOpen: (open: boolean) => void;
    selectedCustomerId: string;
    setSelectedCustomerId: (id: string) => void;
    localCustomers: any[];
    setLocalCustomers: (updater: (prev: any[]) => any[]) => void;
    isNewCustomerOpen: boolean;
    setIsNewCustomerOpen: (open: boolean) => void;
    newCustomerName: string;
    setNewCustomerName: (name: string) => void;
    newCustomerPhone: string;
    setNewCustomerPhone: (phone: string) => void;
    isCreatingCustomer: boolean;
    setIsCreatingCustomer: (creating: boolean) => void;
}

export function POSCustomerSelect({
    isCustomerOpen,
    setIsCustomerOpen,
    selectedCustomerId,
    setSelectedCustomerId,
    localCustomers,
    setLocalCustomers,
    isNewCustomerOpen,
    setIsNewCustomerOpen,
    newCustomerName,
    setNewCustomerName,
    newCustomerPhone,
    setNewCustomerPhone,
    isCreatingCustomer,
    setIsCreatingCustomer
}: POSCustomerSelectProps) {
    const t = useTranslations("POS")
    const router = useRouter()

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <div className="relative group flex-1">
                    <Popover open={isCustomerOpen} onOpenChange={setIsCustomerOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={isCustomerOpen}
                                className="w-full h-14 pl-11 justify-between bg-card/40 border-primary/10 rounded-2xl font-bold transition-all focus:ring-1 focus:ring-primary shadow-sm hover:border-primary/30"
                            >
                                <div className="flex items-center">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                    <span className="truncate">
                                        {selectedCustomerId === "walk-in"
                                            ? t("walkIn")
                                            : localCustomers.find((c) => c.id === selectedCustomerId)?.name?.toUpperCase() || t("selectCustomer")}
                                    </span>
                                </div>
                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0 rounded-2xl border-primary/10 shadow-2xl">
                            <Command>
                                <CommandInput placeholder={t("searchClients")} className="h-12 font-bold" />
                                <CommandList className="max-h-[300px] custom-scrollbar">
                                    <CommandEmpty className="py-6 text-center text-sm font-medium">{t("noClientFound")}</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                            value="walk-in"
                                            className="font-bold py-3 pl-10 data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary cursor-pointer relative"
                                            onSelect={() => {
                                                setSelectedCustomerId("walk-in")
                                                setIsCustomerOpen(false)
                                            }}
                                        >
                                            {selectedCustomerId === "walk-in" && (
                                                <div className="size-2 bg-primary rounded-full absolute left-4 top-1/2 -translate-y-1/2" />
                                            )}
                                            {t("walkIn")}
                                        </CommandItem>
                                        {localCustomers.map((c) => (
                                            <CommandItem
                                                key={c.id}
                                                value={c.name}
                                                className="font-bold py-3 pl-10 data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary cursor-pointer relative"
                                                onSelect={() => {
                                                    setSelectedCustomerId(c.id)
                                                    setIsCustomerOpen(false)
                                                }}
                                            >
                                                {selectedCustomerId === c.id && (
                                                    <div className="size-2 bg-primary rounded-full absolute left-4 top-1/2 -translate-y-1/2" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span>{c.name.toUpperCase()}</span>
                                                    {c.phone && <span className="text-[9px] text-muted-foreground/60">{c.phone}</span>}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Add New Customer Button Toggle */}
                <Button
                    variant={isNewCustomerOpen ? "default" : "outline"}
                    size="icon"
                    className={`h-14 w-14 shrink-0 rounded-2xl border-primary/10 shadow-sm hover:border-primary/30 transition-all ${isNewCustomerOpen ? 'bg-primary text-primary-foreground' : 'bg-card/40 text-primary'}`}
                    onClick={() => setIsNewCustomerOpen(!isNewCustomerOpen)}
                >
                    {isNewCustomerOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </Button>
            </div>

            {/* Inline Horizontal New Customer Form */}
            {isNewCustomerOpen && (
                <div className="flex items-center gap-3 bg-card/60 p-3 rounded-2xl border border-primary/10 shadow-inner animate-in slide-in-from-top-2 duration-300">
                    <div className="relative flex-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                        <Input
                            placeholder={t("clientName")}
                            className="pl-9 h-11 border-primary/5 focus-visible:ring-primary/20 bg-background/80 uppercase font-bold text-sm"
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                        <Input
                            placeholder={t("phoneNumber")}
                            className="pl-9 h-11 border-primary/5 focus-visible:ring-primary/20 bg-background/80 font-bold text-sm"
                            value={newCustomerPhone}
                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') document.getElementById('quick-save-client-btn')?.click()
                            }}
                        />
                    </div>
                    <Button
                        id="quick-save-client-btn"
                        className="h-11 px-6 font-black uppercase tracking-wider rounded-xl shrink-0"
                        disabled={!newCustomerName.trim() || isCreatingCustomer}
                        onClick={async () => {
                            if (!newCustomerName.trim()) return
                            setIsCreatingCustomer(true)
                            const res = await quickCreateCustomer(newCustomerName, newCustomerPhone)
                            if (res.success && res.id) {
                                const newC = { id: res.id, name: newCustomerName, phone: newCustomerPhone || null }
                                setLocalCustomers(prev => [newC, ...prev])
                                setSelectedCustomerId(res.id)
                                setIsNewCustomerOpen(false)
                                setNewCustomerName("")
                                setNewCustomerPhone("")
                                router.refresh()
                            } else {
                                alert("Failed to create customer: " + res.error)
                            }
                            setIsCreatingCustomer(false)
                        }}
                    >
                        {isCreatingCustomer ? <Loader2 className="h-4 w-4 animate-spin" /> : t("save")}
                    </Button>
                </div>
            )}
        </div>
    )
}
