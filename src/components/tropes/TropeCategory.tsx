import React from 'react';
import { TropeButton } from './TropeButton';

interface TropeCategoryProps {
    title: string;
    tropes: { id: string; name: string }[];
    appliedTropeIds: Set<string>;
    onToggleTrope: (tropeId: string) => void;
    isDisabled: boolean;
}

export const TropeCategory: React.FC<TropeCategoryProps> = ({
                                                                title, tropes, appliedTropeIds, onToggleTrope, isDisabled
                                                            }) => {
    return (
        <section className="animate-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <div className="flex items-center gap-4 mb-4">
                <h3 className="text-xl font-display italic text-ink font-medium tracking-tight">{title}</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-line/60 to-transparent"></div>
                <span className="text-[10px] font-mono text-muted/50">{tropes.length}</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
                {tropes.map((trope) => (
                    <TropeButton
                        key={trope.id}
                        trope={trope}
                        isApplied={appliedTropeIds.has(trope.id)}
                        onToggle={onToggleTrope}
                        isDisabled={isDisabled}
                    />
                ))}
            </div>
        </section>
    );
};