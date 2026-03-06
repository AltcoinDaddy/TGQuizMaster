import React, { useState } from 'react';
import { API_URL } from '../../config/api';
import { authPost } from '../../utils/authFetch';
import { useAppStore } from '../../store/useAppStore';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Star, Zap, Shield, ShoppingBag, Loader2, Target, Timer, Palette } from 'lucide-react';

interface ShopItem {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: 'TON' | 'Stars' | 'USD';
    reward: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    image?: string;
    tag?: string;
    color: string;
}

export const Shop: React.FC = () => {
    const { user } = useAppStore();
    const [category, setCategory] = useState<'stars' | 'avatars' | 'powerups'>('stars');
    const [shopData, setShopData] = useState<{ stars: ShopItem[], avatars: ShopItem[], powerups: ShopItem[] }>({
        stars: [],
        avatars: [],
        powerups: []
    });
    const [loading, setLoading] = useState(true);

    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

    React.useEffect(() => {
        const fetchShop = async () => {
            try {
                const res = await fetch(`${API_URL}/api/shop`);
                const data = await res.json();
                if (data.shopItems) {
                    // Map icons back to components (API sends just strings/data)
                    const mapIcons = (items: any[]) => items.map(item => ({
                        ...item,
                        icon: item.id.startsWith('s') ? Star : (item.id.startsWith('p') ? (item.title.includes('Shield') ? Shield : Zap) : undefined)
                    }));

                    setShopData({
                        stars: mapIcons(data.shopItems.stars || []),
                        avatars: data.shopItems.avatars || [],
                        powerups: (data.shopItems.powerups || []).map((p: any) => ({ ...p, icon: Zap }))
                    });
                }
            } catch (e) {
                console.error('Failed to fetch shop items:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchShop();
    }, []);

    const handlePurchase = async (item: ShopItem) => {
        setIsPurchasing(item.id);
        console.log(`[SHOP] Initiating purchase for ${item.title} (${item.price} ${item.currency})`);

        try {
            const response = await authPost('/api/create-payment-link', {
                title: item.title,
                description: item.description,
                payload: item.id,
                amount: item.price
            });

            const data = await response.json();

            if (data.invoiceLink) {
                const tg = (window as any).Telegram?.WebApp;
                if (tg && tg.openInvoice) {
                    tg.openInvoice(data.invoiceLink, (status: string) => {
                        if (status === 'paid') {
                            setIsPurchasing(null);
                            tg.showAlert('Payment Successful! Item delivered. 🌟');
                        } else if (status === 'failed') {
                            setIsPurchasing(null);
                            tg.showAlert('Payment Failed. Please try again.');
                        } else {
                            setIsPurchasing(null);
                        }
                    });
                } else {
                    console.log('Would open invoice:', data.invoiceLink);
                    alert(`[DEV] Invoice Link Generated:\n${data.invoiceLink}`);
                    setIsPurchasing(null);
                }
            } else {
                throw new Error('No invoice link returned');
            }

        } catch (error) {
            console.error('Purchase failed:', error);
            setIsPurchasing(null);
            alert('Failed to initiate payment. Please try again.');
        }
    };

    // Power-up purchase: spend in-game Stars directly
    const handlePowerUpPurchase = async (item: ShopItem) => {
        if (user.stars < item.price) {
            const tg = (window as any).Telegram?.WebApp;
            if (tg?.showAlert) tg.showAlert('Not enough Stars!');
            else alert('Not enough Stars!');
            return;
        }
        setIsPurchasing(item.id);
        try {
            const res = await authPost('/api/buy-powerup', {
                powerUpId: item.id, cost: item.price
            });
            const data = await res.json();
            if (data.success) {
                useAppStore.getState().setUser({
                    stars: data.newBalance,
                    inventoryPowerups: data.inventoryPowerups
                });
                const tg = (window as any).Telegram?.WebApp;
                if (tg?.showAlert) tg.showAlert(`${item.title} added to your inventory! ⚡`);
                else alert(`${item.title} purchased!`);
            } else {
                throw new Error(data.error || 'Purchase failed');
            }
        } catch (e: any) {
            console.error('Power-up purchase failed:', e);
            alert(e.message || 'Purchase failed');
        } finally {
            setIsPurchasing(null);
        }
    };

    const starsItems = shopData.stars;
    const avatarItems = shopData.avatars;

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* V2 Header */}
                <header className="flex items-center justify-between mb-8 sticky top-0 z-50 py-4 -mx-6 px-6 bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="text-primary" />
                        <h1 className="text-xl font-black italic tracking-tighter uppercase">Shop</h1>
                    </div>
                    <div className="flex items-center bg-primary/10 rounded-full pl-3 pr-1 py-1 border border-primary/20">
                        <span className="text-primary font-black mr-2 text-xs uppercase tracking-wider flex items-center gap-1">
                            <Star size={12} className="fill-primary" /> {(user.stars || 0).toLocaleString()}
                        </span>
                        <button className="bg-primary text-background-dark h-8 w-8 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/20">
                            <i className="material-icons text-lg">add</i>
                        </button>
                    </div>
                </header>

                {/* Categories */}
                <nav className="flex gap-3 mb-8 overflow-x-auto hide-scrollbar">
                    {['stars', 'powerups', 'avatars'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat as any)}
                            className={`flex-shrink-0 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all italic flex items-center gap-2 ${category === cat ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'bg-white/5 text-white/40 border border-white/5'}`}
                        >
                            {cat === 'stars' ? (
                                <><Star size={12} fill="currentColor" fillOpacity={0.2} /> Stars</>
                            ) : cat === 'powerups' ? (
                                <><Zap size={12} fill="currentColor" fillOpacity={0.2} /> Power-Ups</>
                            ) : (
                                <><Palette size={12} fill="currentColor" fillOpacity={0.2} /> Avatars</>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Categories Sub-headers */}
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-lg font-black italic tracking-tighter uppercase">
                        {category === 'avatars' ? 'Exclusive Avatars' : category === 'powerups' ? 'Game Power-Ups' : 'Battle Tools'}
                    </h3>
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] italic opacity-60">
                        {category === 'avatars' ? 'Premium Identity' : category === 'powerups' ? 'Use in-game' : '3 Items'}
                    </span>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="text-xs font-black uppercase tracking-widest">Loading Shop...</p>
                    </div>
                ) : (
                    <>
                        {/* Exclusive Avatars Horizontal Scroll */}
                        {category === 'avatars' ? (
                            <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6 pb-6">
                                {avatarItems.map((item) => (
                                    <GlassCard key={item.id} className="flex-shrink-0 w-48 p-3 rounded-[2rem] border-white/5 space-y-3">
                                        <div className="relative aspect-square rounded-[1.5rem] overflow-hidden group">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className={`absolute inset-0 ring-4 ring-inset rounded-[1.5rem] ${item.color === 'primary' ? 'ring-primary/40' : item.color === 'accent-purple' ? 'ring-accent-purple/40' : 'ring-accent-gold/40'}`}></div>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase italic tracking-tighter">{item.title}</h4>
                                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{item.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handlePurchase(item)}
                                            disabled={isPurchasing !== null}
                                            className="w-full bg-white/5 border border-primary text-primary font-black py-2.5 rounded-full text-[10px] flex items-center justify-center gap-1 italic uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isPurchasing === item.id ? <Loader2 size={12} className="animate-spin" /> : <Star size={10} className="fill-primary" />}
                                            {item.price}
                                        </button>
                                    </GlassCard>
                                ))}
                            </div>
                        ) : category === 'powerups' ? (
                            <div className="space-y-4">
                                {shopData.powerups.map((item) => {
                                    const ownedCount = user.inventoryPowerups?.[item.id] || 0;
                                    return (
                                        <GlassCard key={item.id} className="p-5 flex items-center gap-4 border-white/5 relative overflow-hidden group">
                                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                                                {item.id === 'pu_5050' ? <Target size={28} /> : item.id === 'pu_time' ? <Timer size={28} /> : <Zap size={28} />}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-sm uppercase italic tracking-tighter leading-none mb-1">{item.title}</h4>
                                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.description}</p>
                                                <p className="mt-1 text-[10px] text-primary/60 font-bold">Owned: {ownedCount}</p>
                                            </div>
                                            <button
                                                onClick={() => handlePowerUpPurchase(item)}
                                                disabled={isPurchasing !== null || user.stars < item.price}
                                                className="bg-primary text-background-dark font-black px-5 py-2.5 rounded-full text-[10px] flex items-center gap-1 italic uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isPurchasing === item.id ? <Loader2 size={12} className="animate-spin" /> : <Star size={10} className="fill-background-dark" />}
                                                {item.price}
                                            </button>
                                        </GlassCard>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {(category === 'stars' ? starsItems : []).map((item) => (
                                    <GlassCard key={item.id} className="p-5 flex items-center gap-4 border-white/5 relative overflow-hidden group">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                            {item.icon && <item.icon size={28} className="text-primary" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-sm uppercase italic tracking-tighter leading-none mb-1">{item.title}</h4>
                                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.description}</p>
                                            <p className="mt-2 text-primary font-black italic tracking-tighter">+{item.reward}</p>
                                        </div>
                                        <button
                                            onClick={() => handlePurchase(item)}
                                            disabled={isPurchasing !== null}
                                            className="bg-primary text-background-dark font-black px-6 py-2.5 rounded-full text-[10px] flex items-center gap-1 italic uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {isPurchasing === item.id ? <Loader2 size={12} className="animate-spin" /> : <Star size={10} className="fill-background-dark" />}
                                            {item.price}
                                        </button>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Pro Upsell */}
                <div className="mt-10 relative rounded-[2rem] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-purple/80 to-transparent z-10"></div>
                    <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8p48ED6AoMZO9S5ZJAQj4s8Xyu4y_HT1KMMhrJiTia4RwshCu9G6SUEBHMpxerfuMMZHF0nh0eav64QGidfj1z0AVXMg2i52zdtBuOdc7XLNVr9UbX-e1SVB3uBJIqjDCxKYf8HRUVC4cuHNWdEYYnlMOIqnkbsW5mDXUMcpDa3u0EJsIEY_FKgRjUHq9mXnYJueZ6i-w8w_wO4lAqlT8XgW7AAjWEoXK4X-s2EXjUclTLjhnQeGIQZ6tdWHgxjgCp-Ia-kZAbOE"
                        className="w-full h-44 object-cover transform transition-transform duration-1000 group-hover:scale-110"
                        alt="Pro subscription banner"
                    />
                    <div className="absolute inset-0 z-20 p-8 flex flex-col justify-center">
                        <span className="bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] w-fit px-3 py-1 rounded-full mb-3 italic">Limited Offer</span>
                        <h2 className="text-2xl font-black text-white leading-none uppercase italic tracking-tighter">STARTER<br />BUNDLE</h2>
                        <p className="text-white/80 text-[10px] font-bold mt-2 uppercase tracking-widest">1,000 Stars + Exclusive Avatar</p>
                    </div>
                </div>

                {/* Footer Center Info */}
                <footer className="mt-12 text-center opacity-40 space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] italic">Official Telegram Stars Store</p>
                    <div className="flex justify-center gap-8">
                        <span className="text-[10px] font-black uppercase italic tracking-widest hover:text-primary transition-colors cursor-pointer">History</span>
                        <span className="text-[10px] font-black uppercase italic tracking-widest hover:text-primary transition-colors cursor-pointer">Restore</span>
                        <span className="text-[10px] font-black uppercase italic tracking-widest hover:text-primary transition-colors cursor-pointer">Terms</span>
                    </div>
                </footer>
            </div>
        </MainLayout>
    );
};
