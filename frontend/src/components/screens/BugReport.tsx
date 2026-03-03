import React, { useState } from 'react';
import { authPost } from '../../utils/authFetch';
import { MainLayout } from '../layout/MainLayout';
import { Button } from '../ui/Button';
import { ChevronLeft, Camera, Send, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const BugReport: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAppStore();
    const [file, setFile] = useState<File | null>(null);
    const [type, setType] = useState('Gameplay Glitch');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!description.trim()) {
            const tg = (window as any).Telegram?.WebApp;
            if (tg?.showAlert) tg.showAlert('Please describe the issue');
            else alert('Please describe the issue');
            return;
        }

        setSubmitting(true);
        try {
            const res = await authPost('/api/bug-report', {
                telegramId: user.telegramId,
                type,
                description
            });
            const data = await res.json();

            if (data.success) {
                const tg = (window as any).Telegram?.WebApp;
                if (tg?.showAlert) tg.showAlert('Report submitted! You earned +10 XP');
                else alert('Report submitted!');
                navigate('/');
            } else {
                throw new Error(data.error || 'Submission failed');
            }
        } catch (e: any) {
            console.error('Bug report failed:', e);
            alert(e.message || 'Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Report a Bug</h1>
                </div>

                {/* Intro */}
                <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 mb-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                        <Bug size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider leading-relaxed">
                        Found a glitch? Help us make TGQuizMaster better. Detailed reports earn <span className="text-primary">Bonus XP!</span>
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Bug Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary/50 appearance-none"
                        >
                            <option className="bg-background-dark">Gameplay Glitch</option>
                            <option className="bg-background-dark">Wallet/Payment Issue</option>
                            <option className="bg-background-dark">UI/Visual Bug</option>
                            <option className="bg-background-dark">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what happened and how to reproduce it..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-primary/50 resize-none"
                        ></textarea>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Screenshot (Optional)</label>
                        <div className="relative group">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <div className="w-full border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-primary/50 transition-all">
                                <Camera size={32} className="text-white/20 group-hover:text-primary transition-all" />
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-all">
                                    {file ? file.name : 'Tap to upload or take a photo'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-10">
                    <Button
                        fullWidth
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="py-5 text-xl gap-3 shadow-[0_10px_30px_rgba(242,204,13,0.3)] font-black italic tracking-widest disabled:opacity-50"
                    >
                        {submitting ? 'SENDING...' : (
                            <>
                                <Send size={20} />
                                SUBMIT REPORT
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
};

