import { useNavigate, useLocation } from 'react-router-dom';

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark border-t border-white/5 safe-bottom z-50">
            <div className="flex items-center justify-around h-20 px-4">
                <button
                    onClick={() => navigate('/')}
                    className={`flex flex-col items-center gap-1 transition-all ${isActive('/') ? 'text-primary' : 'opacity-40 hover:opacity-100'}`}
                >
                    <span className="material-icons">home</span>
                    <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">Home</span>
                </button>


                <button
                    onClick={() => navigate('/shop')}
                    className={`flex flex-col items-center gap-1 transition-all ${isActive('/shop') ? 'text-primary' : 'opacity-40 hover:opacity-100'}`}
                >
                    <span className="material-icons">shopping_bag</span>
                    <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">Shop</span>
                </button>

                <div className="relative -mt-10">
                    <button
                        onClick={() => navigate('/tournaments')}
                        className={`w-16 h-16 rounded-full shadow-[0_0_30px_rgba(13,242,89,0.4)] border-[6px] border-background-dark flex items-center justify-center transform active:scale-90 transition-all ${isActive('/tournaments') ? 'bg-white text-primary' : 'bg-primary text-background-dark'}`}
                    >
                        <span className="material-icons text-3xl">sports_esports</span>
                    </button>
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
                        <span className={`text-[9px] font-black uppercase tracking-widest italic ${isActive('/tournaments') ? 'text-primary' : 'opacity-40'}`}>Play</span>
                    </div>
                </div>


                <button
                    onClick={() => navigate('/yield')}
                    className={`flex flex-col items-center gap-1 transition-all ${isActive('/yield') ? 'text-primary' : 'opacity-40 hover:opacity-100'}`}
                >
                    <span className="material-icons">psychology</span>
                    <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">Yield</span>
                </button>

                <button
                    onClick={() => navigate('/profile')}
                    className={`flex flex-col items-center gap-1 transition-all ${isActive('/profile') ? 'text-primary' : 'opacity-40 hover:opacity-100'}`}
                >
                    <span className="material-icons">person</span>
                    <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">Profile</span>
                </button>
            </div>
        </nav>
    );
};
