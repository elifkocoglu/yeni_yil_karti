import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Using a short, reliable loopable holiday track from a stable CDN
    const MUSIC_URL = "https://actions.google.com/sounds/v1/ambiences/wind_chimes.ogg"; // Fallback: Wind Chimes (Reliable Google CDN)
    // Alternative cheerful music: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3" (We wish you a merry christmas - instrumental)
    // Let's try a direct reliable MP3 link for "Jingle Bells" or similar if possible. 
    // For now, let's use the Wind Chimes as it is high availability, or revert to a better Pixabay link with error handling.

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.error("Audio play failed:", e);
                        alert("Müzik çalınamadı. Tarayıcı izinlerini kontrol edin veya sayfayı yenileyin.");
                    });
                }
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        // Try a distinct "Christmas" track from a public source
        audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3"); // Gentle Piano Christmas
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={togglePlay}
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full text-white hover:bg-white/20 transition-all shadow-lg group pr-5"
                title={isPlaying ? "Müziği Durdur" : "Müziği Başlat"}
            >
                <div className="p-1">
                    {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 animate-pulse">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
                        </svg>
                    )}
                </div>
                <span className="text-sm font-medium">{isPlaying ? 'Çalıyor' : 'Müzik Başlat'}</span>
            </button>
            <div className="absolute -top-8 right-0 text-white/50 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Müziği aç/kapa
            </div>
        </div>
    );
};

export default MusicPlayer;
