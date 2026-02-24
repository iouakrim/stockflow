"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface ReportsPieChartProps {
    data: { name: string; value: number; color: string }[];
}

export function ReportsPieChart({ data }: ReportsPieChartProps) {
    return (
        <div className="h-[200px] w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderRadius: '16px',
                            border: '1px solid hsl(var(--border))',
                            fontWeight: 900,
                            boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ fontWeight: 900, color: 'hsl(var(--foreground))' }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(value: any, name: any) => [`${value ?? 0}%`, name]}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
