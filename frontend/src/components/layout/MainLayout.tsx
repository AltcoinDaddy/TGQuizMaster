import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
    children: React.ReactNode;
    showHeader?: boolean;
    showNav?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
    children,
    showHeader = true,
    showNav = true
}) => {
    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white bg-mesh relative overflow-hidden">
            {/* Decorative Background Particles */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center opacity-40 z-0">
                <div className="h-2 w-2 bg-primary rounded-full absolute top-1/4 left-1/4 rotate-45 particle"></div>
                <div className="h-3 w-3 bg-primary rounded-lg absolute top-1/3 right-1/4 -rotate-12 particle"></div>
                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full absolute top-1/2 left-1/3 particle"></div>
                <div className="h-2 w-2 bg-primary absolute bottom-1/4 right-1/3 rotate-[70deg] particle"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {showHeader && <Header />}

                <main className="flex-1 px-5 py-4 space-y-6 overflow-y-auto">
                    {children}
                    <div className="h-20" /> {/* Bottom Spacer for Nav */}
                </main>

                {showNav && <BottomNav />}
            </div>
        </div>
    );
};
