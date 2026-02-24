"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from "recharts"
import { useTranslations } from "next-intl"
import { useSettings } from "@/components/providers/SettingsProvider"

interface ReportsBarChartProps {
    data: { name: string; value: number }[];
    color?: string;
}

export function ReportsBarChart({ data, color = "#3b82f6" }: ReportsBarChartProps) {
    const t = useTranslations("Reports")
    const { currency } = useSettings()
    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--primary) / 0.1)" />
                    <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        style={{ fontWeight: 900 }}
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
                        cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
                        itemStyle={{ fontWeight: 900, color: 'hsl(var(--foreground))' }}
                        formatter={(value: number | string | undefined) => [`${(Number(value) || 0).toLocaleString()} ${currency}`, t("value")]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--primary))" : color} opacity={index === 0 ? 1 : 0.7} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
