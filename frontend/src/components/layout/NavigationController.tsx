import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const NavigationController = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Single Effect to handle Deep Linking on Mount
    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        const startParam = tg?.initDataUnsafe?.start_param;

        if (startParam && startParam.startsWith('room_')) {
            const roomId = startParam.replace('room_', '');
            let finalUrl = `/quiz?roomId=${roomId}`;

            // Support encoded parameters: room_ID_m2_cMovies
            if (startParam.includes('_m')) {
                const parts = startParam.split('_');
                const mPart = parts.find((p: string) => p.startsWith('m'));
                const cPart = parts.find((p: string) => p.startsWith('c'));

                if (mPart) finalUrl += `&maxPlayers=${mPart.substring(1)}`;
                if (cPart) finalUrl += `&category=${cPart.substring(1)}`;
            }

            console.log('[NAVIGATION] Deep link detected, redirecting to room:', roomId);
            navigate(finalUrl, { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const tg = (window as any).Telegram?.WebApp;
        if (!tg) return;

        // Ensure the back button is initially configured
        tg.BackButton.isVisible = location.pathname !== '/' && location.pathname !== '/onboarding';

        const handleBack = () => {
            console.log('Back button clicked', location.pathname);
            if (location.pathname !== '/') {
                navigate(-1);
            } else {
                // Close app if on home? Or minimize?
                tg.close();
            }
        };

        tg.BackButton.onClick(handleBack);

        // Update visibility on location change
        if (location.pathname !== '/' && location.pathname !== '/onboarding') {
            tg.BackButton.show();
        } else {
            tg.BackButton.hide();
        }

        return () => {
            tg.BackButton.offClick(handleBack);
        };
    }, [location, navigate]);

    return null;
};
