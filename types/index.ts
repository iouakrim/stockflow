export type Product = {
    id: string
    tenant_id: string
    barcode: string | null
    sku: string | null
    name: string
    description: string | null
    category: string | null
    supplier_id: string | null
    cost_price: number
    selling_price: number
    unit: string | null
    stock_quantity: number
    low_stock_threshold: number
    created_at: string
    updated_at: string
}

export type Supplier = {
    id: string
    tenant_id: string
    name: string
    contact_name: string | null
    email: string | null
    phone: string | null
    address: string | null
    category: string | null
    status: 'active' | 'inactive'
    created_at: string
    updated_at: string
}

export type Customer = {
    id: string
    tenant_id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    credit_balance: number
    created_at: string
    updated_at: string
}
