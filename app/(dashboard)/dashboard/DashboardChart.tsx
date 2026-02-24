"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { useTranslations } from "next-intl"
import { useSettings } from "@/components/providers/SettingsProvider"

interface DashboardChartProps {
    data: { name: string; Revenue: number }[];
}

export function DashboardChart({ data }: DashboardChartProps) {
    const t = useTranslations("Dashboard")
    const { currency } = useSettings()
    return (
        <div className="h-[320px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                        itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 900 }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any) => [`${(Number(value) || 0).toLocaleString()} ${currency}`, t("revenue")]}
                    />
                    <Line
                        type="monotone"
                        dataKey="Revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={4}
                        dot={{ r: 4, fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
