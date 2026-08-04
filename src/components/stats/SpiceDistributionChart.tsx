// src/components/stats/SpiceDistributionChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SpiceDistributionProps {
    data: { spice: string; count: number }[];
}

export const SpiceDistributionChart: React.FC<SpiceDistributionProps> = ({ data }) => {
    return (
        <div className="bg-card/40 border border-line/60 rounded-2xl p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-display font-bold text-sm text-ink">Spice Spectrum</h3>
                    <p className="text-[10px] font-mono text-muted">Book count by heat rating (0 - 5)</p>
                </div>
                <span className="text-xs">🌶️</span>
            </div>

            <div className="flex-1 min-h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis
                            dataKey="spice"
                            stroke="var(--color-muted)"
                            fontSize={10}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="var(--color-muted)"
                            fontSize={10}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-card)',
                                borderColor: 'var(--color-line)',
                                borderRadius: '8px',
                                fontSize: '11px',
                                color: 'var(--color-ink)',
                                fontFamily: 'var(--font-mono)'
                            }}
                            cursor={{ fill: 'var(--color-bg2)', opacity: 0.4 }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {data.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={index >= 4 ? 'var(--color-primary)' : 'var(--color-tertiary)'}
                                    opacity={0.85}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};