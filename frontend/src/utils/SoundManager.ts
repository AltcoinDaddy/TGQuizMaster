export class SoundManager {
    private static instance: SoundManager;
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private enabled: boolean = true;

    private constructor() {
        this.enabled = localStorage.getItem('sound_enabled') !== 'false';
        this.preloadSounds();
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private preloadSounds() {
        const soundUrls: Record<string, string> = {
            correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Arcade game jump/coin
            wrong: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',   // Retro error
            click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',   // UI Click
            win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',     // Winning jingle
            tick: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'     // Clock tick
        };

        Object.entries(soundUrls).forEach(([key, url]) => {
            const audio = new Audio(url);
            audio.preload = 'auto';
            this.sounds.set(key, audio);
        });
    }

    public play(key: 'correct' | 'wrong' | 'click' | 'win' | 'tick') {
        if (!this.enabled) return;

        const audio = this.sounds.get(key);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.warn('Audio play failed:', e));
        }
    }

    public toggle(enabled: boolean) {
        this.enabled = enabled;
        localStorage.setItem('sound_enabled', String(enabled));
    }
}

export const soundManager = SoundManager.getInstance();
