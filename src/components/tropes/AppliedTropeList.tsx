import React from 'react';

interface AppliedTropeListProps {
    appliedTropeIds: Set<string>;
    allTropes: { id: string; name: string }[];
    onToggleTrope: (tropeId: string) => void;
    selectedBookId: string;
}

export const AppliedTropeList: React.FC<AppliedTropeListProps> = ({
                                                                      appliedTropeIds, allTropes, onToggleTrope, selectedBookId
                                                                  }) => {
    const appliedTropes = allTropes.filter(t => appliedTropeIds.has(t.id));

    if (appliedTropes.length === 0) {
        return (
            <p className="text-sm text-muted/50 italic w-full text-center py-8 font-body border border-dashed border-line/30 rounded-xl bg-bg2/30">
                {selectedBookId ? "This canvas is currently blank." : "Awaiting book selection to reveal tags."}
            </p>
        );
    }

    return (
        <div className="flex flex-wrap gap-2.5 content-start">
            {appliedTropes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => onToggleTrope(t.id)}
                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-medium rounded-full hover:bg-primary/20 hover:scale-95 transition-all shadow-sm"
                    title="Click to remove"
                >
                    <span>{t.name}</span>
                    <span className="opacity-0 group-hover:opacity-100 text-[9px] transition-opacity bg-primary text-on-primary rounded-full w-4 h-4 flex items-center justify-center leading-none">
                        ✕
                    </span>
                </button>
            ))}
        </div>
    );
};