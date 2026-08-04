import React from 'react';

interface TropeButtonProps {
    trope: { id: string; name: string };
    isApplied: boolean;
    onToggle: (id: string) => void;
    isDisabled: boolean;
}

export const TropeButton: React.FC<TropeButtonProps> = ({ trope, isApplied, onToggle, isDisabled }) => {
    return (
        <button
            onClick={() => onToggle(trope.id)}
            disabled={isDisabled}
            className={`
                relative px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border
                ${isDisabled
                ? 'cursor-not-allowed opacity-40 border-line/40 text-muted/40'
                : isApplied
                    ? 'bg-tertiary border-tertiary text-bg shadow-md shadow-tertiary/20 scale-95 hover:scale-100 hover:bg-tertiary/90'
                    : 'bg-transparent border-line/60 text-ink/70 hover:border-tertiary/60 hover:text-ink hover:bg-card hover:shadow-md hover:-translate-y-0.5'
            }
            `}
        >
            {trope.name}
            {isDisabled && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-card border border-line rounded-full px-1 text-muted/50">
                    🔒
                </span>
            )}
        </button>
    );
};