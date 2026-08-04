// src/components/clubs/CreateClubModal.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../auth/useAuth.ts';

interface CreateClubModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateClubModal: React.FC<CreateClubModalProps> = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('clubs').insert({
                name,
                description,
                is_public: isPublic,
                created_by: user.id,
            });
            if (error) throw error;
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error creating guild:', err);
            alert('Failed to create guild.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-line/60 rounded-2xl shadow-2xl w-full max-w-md p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/10 rounded-full blur-xl pointer-events-none" />

                <div className="flex justify-between items-center border-b border-line/30 pb-3 mb-4 relative z-10">
                    <div>
                        <h2 className="font-display font-bold text-lg text-ink">✦ Found a New Guild</h2>
                        <p className="text-[10px] font-mono text-muted">Gather your fellow readers</p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-ink text-lg transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-[10px] font-mono font-bold text-muted uppercase tracking-wider mb-1.5">
                            Guild Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-bg2 border border-line rounded-xl px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-primary transition-all"
                            placeholder="e.g. The Midnight Readers"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono font-bold text-muted uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-bg2 border border-line rounded-xl px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:border-primary transition-all resize-none"
                            placeholder="What brings your guild together?"
                        />
                    </div>

                    <div className="flex items-center justify-between border-t border-line/20 pt-3 mt-2">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-muted">Public Guild</span>
                            <button
                                type="button"
                                onClick={() => setIsPublic(!isPublic)}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${isPublic ? 'bg-primary' : 'bg-line'}`}
                            >
                                <span className={`inline-block h-3 w-3 transform rounded-full bg-card transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-1.5 bg-tertiary text-ink text-[11px] font-mono font-bold rounded-xl hover:opacity-85 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Guild'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};