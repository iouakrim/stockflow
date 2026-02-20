export default function DashboardPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to StockFlow Pro</p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold text-sm">Total Sales</h3>
                    <p className="text-2xl font-bold mt-2">$0.00</p>
                </div>
                <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <h3 className="font-semibold text-sm">Products</h3>
                    <p className="text-2xl font-bold mt-2">0</p>
                </div>
            </div>
        </div>
    );
}
