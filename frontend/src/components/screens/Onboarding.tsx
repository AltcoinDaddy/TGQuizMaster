import React, { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Button } from '../ui/Button';
import { Trophy, ArrowRight, Zap, Sparkles, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const onboardingSteps = [
    {
        icon: <Zap size={64} className="text-primary" />,
        title: "SportFi Trivia",
        description: "The ultimate arena for sports fans. Compete in specialized categories like Football, Motorsports, Basketball, and Esports!",
        color: "from-primary"
    },
    {
        icon: <Sparkles size={64} className="text-yellow-400" />,
        title: "Earn Real Rewards",
        description: "Win CHZ crypto and Telegram Stars by placing top 3 in tournaments. Instant withdrawals to your wallet.",
        color: "from-yellow-400"
    },
    {
        icon: <Trophy size={64} className="text-primary" />,
        title: "Refer & Earn",
        description: "Invite your friends and earn a lifetime 5% commission on all their tournament winnings!",
        color: "from-primary"
    },
    {
        icon: <Brain size={64} className="text-accent-purple" />,
        title: "Chili Yield",
        description: "Harvest ChiliPoints (CP) hourly based on your activity. High CP yields higher potential rewards!",
        color: "from-orange-500"
    }
];

interface OnboardingProps {
    onComplete?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();

    const nextStep = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            localStorage.setItem('onboarding_completed', 'true');
            if (onComplete) onComplete();
            navigate('/');
        }
    };

    const step = onboardingSteps[currentStep];

    return (
        <MainLayout showHeader={false} showNav={false}>
        <div className="flex flex-col items-center justify-center min-h-[80dvh] text-center px-4">
            <img src="/logo.png" alt="TGQuizMaster" className="w-24 h-24 mb-10 animate-in fade-in zoom-in duration-1000" />
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${step.color}/20 flex items-center justify-center mb-8 relative`}>
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.color}/10 blur-xl animate-pulse`} />
                    {step.icon}
                </div>

                <div className="space-y-4 max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className="text-3xl font-black text-white leading-tight uppercase italic tracking-tighter">
                        {step.title}
                    </h2>
                    <p className="text-sm opacity-60 font-medium leading-relaxed uppercase tracking-wider text-[10px]">
                        {step.description}
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex gap-2 mt-12">
                    {onboardingSteps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-primary shadow-[0_0_10px_rgba(13,242,89,0.5)]' : 'w-2 bg-white/10'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 safe-bottom">
                <Button fullWidth size="lg" onClick={nextStep} className="py-5 text-xl font-black italic tracking-widest">
                    {currentStep === onboardingSteps.length - 1 ? 'GET STARTED' : 'NEXT STEP'}
                    <ArrowRight size={20} />
                </Button>
            </div>
        </MainLayout>
    );
};
