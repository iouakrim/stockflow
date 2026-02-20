export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted">
            <div className="w-full max-w-sm p-6 bg-background rounded-lg shadow-md border">
                <h1 className="text-2xl font-bold text-center mb-6">StockFlow Pro</h1>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <input type="email" className="w-full flex h-10 rounded-md border px-3 py-2 text-sm mt-1" placeholder="admin@example.com" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Password</label>
                        <input type="password" className="w-full flex h-10 rounded-md border px-3 py-2 text-sm mt-1" />
                    </div>
                    <button className="w-full h-10 bg-primary text-primary-foreground rounded-md font-medium mt-4">
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
}
