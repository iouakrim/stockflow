"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { useTranslations } from "next-intl"
import { useSettings } from "@/components/providers/SettingsProvider"

interface ReportsChartProps {
    data: { name: string; revenue: number; profit: number }[];
}

export function ReportsChart({ data }: ReportsChartProps) {
    const t = useTranslations("Reports")
    const { currency } = useSettings()
    return (
        <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--primary) / 0.1)" />
                    <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        style={{ fontWeight: 900, textTransform: 'uppercase' }}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value} ${currency}`}
                        width={60}
                        style={{ fontWeight: 900 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderRadius: '16px',
                            border: '1px solid hsl(var(--border))',
                            fontWeight: 900,
                            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ fontWeight: 900 }}
                        formatter={(value: number | string | undefined, name: string) => [`${(Number(value) || 0).toLocaleString()} ${currency}`, t(name.toLowerCase())]}
                    />
                    <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorProfit)"
                        strokeDasharray="5 5"
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
