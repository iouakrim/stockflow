import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar Placeholder for Desktop */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-card p-4">
                <h1 className="text-xl font-bold mb-8 text-primary">StockFlow Pro</h1>
                <nav className="flex-1 space-y-2">
                    <div className="p-2 bg-accent rounded text-sm font-medium">Dashboard</div>
                    <div className="p-2 hover:bg-accent rounded text-sm font-medium">Sales</div>
                    <div className="p-2 hover:bg-accent rounded text-sm font-medium">Products</div>
                    <div className="p-2 hover:bg-accent rounded text-sm font-medium">Customers</div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col pb-16 md:pb-0">
                <header className="h-14 border-b flex items-center px-4">
                    <div className="md:hidden font-bold text-lg text-primary">StockFlow Pro</div>
                </header>
                <div className="flex-1 p-4 overflow-auto">
                    {children}
                </div>
            </main>

            {/* Bottom Nav Placeholder for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 border-t bg-card flex md:hidden items-center justify-around pb-safe">
                <div className="text-xs font-medium text-primary">Home</div>
                <div className="text-xs font-medium text-muted-foreground">Sales</div>
                <div className="text-xs font-medium text-muted-foreground">Items</div>
                <div className="text-xs font-medium text-muted-foreground">Clients</div>
            </nav>
        </div>
    );
}
