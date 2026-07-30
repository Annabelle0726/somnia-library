// src/components/planner/CalendarGrid.tsx
import type { BookWithUserData } from '../../types/book';
import type { PlanEvent } from '../../pages/Planner';
interface CalendarGridProps {
    currentDate: Date;
    plans: Record<string, PlanEvent[]>;
    onDateClick: (dateStr: string) => void;
    onPlanClick: (book: BookWithUserData) => void;
}

export function CalendarGrid({ currentDate, plans, onDateClick, onPlanClick }: CalendarGridProps) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return (
        <div className="lg:col-span-3 flex flex-col gap-3">
            <div className="grid grid-cols-7 text-center font-mono text-xs font-bold text-tertiary py-2 border-b border-line/30">
                <span>SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {/* 填充上个月的空白天数 */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[90px] p-2 bg-card/10 border border-line/10 rounded-xl opacity-30 select-none" />
                ))}

                {/* 渲染当月天数 */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString();
                    const dayPlans = plans[dateStr] || [];

                    return (
                        <div
                            key={dayNum}
                            onClick={() => onDateClick(dateStr)}
                            className={`group min-h-[95px] p-2 bg-card/40 border border-line/40 rounded-xl flex flex-col justify-between hover:border-tertiary transition-all cursor-pointer relative ${isToday ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`font-mono text-xs font-bold rounded-md px-1.5 py-0.5 ${isToday ? 'bg-primary text-on-primary' : 'text-muted group-hover:text-ink'}`}>
                                    {dayNum}
                                </span>
                                <span className="opacity-0 group-hover:opacity-100 text-[10px] text-tertiary transition-opacity">
                                    + Plan
                                </span>
                            </div>

                            <div className="flex flex-col gap-1 my-1 overflow-y-auto max-h-[50px] no-scrollbar">
                                {dayPlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (plan.book) onPlanClick(plan.book);
                                        }}
                                        className="bg-tertiary/10 border border-tertiary/30 rounded px-1.5 py-0.5 text-[10px] font-mono text-tertiary truncate hover:bg-tertiary/20"
                                    >
                                        📖 {plan.book?.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}