export const AdService = {
    showInterstitial: (isPro: boolean = false) => {
        if (isPro) {
            console.log('Ad Service: Skipping ad for PRO player.');
            return;
        }

        console.log('Ad Service: Showing interstitial...');
        if ((window as any).showInterstitialAd) {
            (window as any).showInterstitialAd();
        }
    },

    initialize: (zoneId: string) => {
        const script = document.createElement('script');
        script.src = `https://native.propellerads.com/nt.js?zoneId=${zoneId}`;
        script.async = true;
        document.body.appendChild(script);
    }
};
