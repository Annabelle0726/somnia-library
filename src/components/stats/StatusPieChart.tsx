// src/components/stats/StatusPieChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatusPieProps {
    data: { name: string; value: number }[];
}

const COLORS = [
    'var(--color-primary)',
    'var(--color-tertiary)',
    'var(--color-muted)',
    'var(--color-line)'
];

export const StatusPieChart: React.FC<StatusPieProps> = ({ data }) => {
    return (
        <div className="bg-card/40 border border-line/60 rounded-2xl p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2 shrink-0">
                <div>
                    <h3 className="font-display font-bold text-sm text-ink">Archive Status</h3>
                    <p className="text-[10px] font-mono text-muted">Reading progress breakdown</p>
                </div>
                <span className="text-xs">📚</span>
            </div>

            <div className="flex-1 min-h-[150px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {data.map((_, index) => (
                                <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-card)',
                                borderColor: 'var(--color-line)',
                                borderRadius: '8px',
                                fontSize: '11px',
                                color: 'var(--color-ink)',
                                fontFamily: 'var(--font-mono)'
                            }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconSize={8}
                            formatter={(value) => <span className="text-[10px] font-mono text-muted">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};