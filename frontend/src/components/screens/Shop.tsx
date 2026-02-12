import React, { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Star, Zap, Shield, ShoppingBag, Loader2 } from 'lucide-react';

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
    const [category, setCategory] = useState<'stars' | 'powerups' | 'avatars' | 'pro'>('stars');
    const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

    const handlePurchase = async (item: ShopItem) => {
        setIsPurchasing(item.id);
        console.log(`[SHOP] Initiating purchase for ${item.title} (${item.price} ${item.currency})`);

        // Simulate API call to backend StarsService.createInvoice
        setTimeout(() => {
            setIsPurchasing(null);
            alert(`Premium Flow Initiated!\n\nThis would now trigger a Telegram Stars Invoice for ${item.price} Stars.\n\nPayload: ${item.id}`);
        }, 1200);
    };

    const starsItems: ShopItem[] = [
        { id: 's1', title: 'Star Bundle', description: 'Start your journey', price: 50, currency: 'Stars', reward: '1,000 Stars', icon: Star, color: 'yellow-400' },
        { id: 's2', title: 'Star Chest', description: 'Most popular choice', price: 250, currency: 'Stars', reward: '6,000 Stars', icon: Star, tag: 'BEST VALUE', color: 'yellow-400' },
        { id: 's3', title: 'Star Vault', description: 'For the ultimate masters', price: 1000, currency: 'Stars', reward: '30,000 Stars', icon: Star, color: 'yellow-400' }
    ];

    const powerupItems: ShopItem[] = [
        { id: 'p1', title: '50/50 Pack', description: 'Eliminate 2 wrong answers', price: 100, currency: 'Stars', reward: 'x10 50/50', icon: Zap, color: 'primary' },
        { id: 'p2', title: 'Shield Pack', description: 'Protect your streak', price: 150, currency: 'Stars', reward: 'x5 Shields', icon: Shield, color: 'blue-400' }
    ];

    const avatarItems: ShopItem[] = [
        { id: 'a1', title: 'Neon Glitch', description: 'Animated Frame', price: 500, currency: 'Stars', reward: 'NFT Avatar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJoJylJGktSTFhUfJdOVEmw1ozWpc8h-K9YKXlf-076p2a28wUyRQsSP-KmOgeizOi6c0O-cwUscuyxcYta4Qzlvxpf3V28xTSdGezOsojgY8VIEGye61sAR2uLYZvYQRXKNYUIkMP-JJCz1Iml2rnlQo7abJGIeqgTvXexQxF8IgBOdVmztnQ1YZNckUP7xpHFv-FF4x94DyKxks98fDY6W2GefcpXnOCPdrIuz5gOaNscs3KJwpb48g4CYV-IPAUfYVhvWTh2OA', color: 'primary' },
        { id: 'a2', title: 'Cyber Master', description: 'Premium Identity', price: 750, currency: 'Stars', reward: 'Legendary', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPahSwwA2M4HVR_vLV-lILzXC7xQf0Nox1bVuLcsHHMHaNB0P3tMJvfGAQhR8bjUciAoIGO6E9seaasLxRgULaniBkCmuWpyaweimfuakUNq2fAldQAcHIaImzziiR_16iI4yzrB3lav7O12FjqznvenQ2Bh7I-6f8ZAbJDvQTpblSoiTPnuFmX11iPLcMbsHgsUBjNOm9xx_-uuFtqiOjfUgtxs_MXfi_1w781LIrxGzYltnxrPtJ3k1O_f0P1B8qBuyrWzvlPWs', color: 'accent-purple' },
        { id: 'a3', title: 'Quiz Crown', description: 'Legendary Icon', price: 1200, currency: 'Stars', reward: 'Mythic', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpxvQnPLgvRsdJag0ER3UXSPs0e4Hs_EXeQMs10qLZI63j4W69n5WSnHjbC2ZFM6SZUF6DEuscPqqvkdw6MGkdyMA1xGOT4FNal-D6FHvTJCZEwLNitNulAPX8nU76wCAuwGHfauWHdN3PFV_IQF_AGlus2_ahpCsfr1mYYcjDaN4BAWV9ciFrZnHSG9UyhQ9-jhGkmCVbisnuWHtUDYGpB3VhlaVf6onab2vnMA3l9Llngng8mUcB2hNgkxZcSfDn6ZMit_xobvc', color: 'accent-gold' }
    ];

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
                            <Star size={12} className="fill-primary" /> 1,250
                        </span>
                        <button className="bg-primary text-background-dark h-8 w-8 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/20">
                            <i className="material-icons text-lg">add</i>
                        </button>
                    </div>
                </header>

                {/* Categories */}
                <nav className="flex gap-3 mb-8 overflow-x-auto hide-scrollbar">
                    {['stars', 'powerups', 'avatars', 'pro'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat as any)}
                            className={`flex-shrink-0 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all italic ${category === cat ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'bg-white/5 text-white/40 border border-white/5'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </nav>

                {/* Categories Sub-headers */}
                <div className="flex justify-between items-end mb-6">
                    <h3 className="text-lg font-black italic tracking-tighter uppercase">{category === 'avatars' ? 'Exclusive Avatars' : 'Battle Tools'}</h3>
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] italic opacity-60">
                        {category === 'avatars' ? 'Premium Identity' : '3 Items'}
                    </span>
                </div>

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
                ) : (
                    <div className="space-y-4">
                        {(category === 'stars' ? starsItems : category === 'powerups' ? powerupItems : []).map((item) => (
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
                        <p className="text-white/80 text-[10px] font-bold mt-2 uppercase tracking-widest">5 Power-ups for only 250 ⭐</p>
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
