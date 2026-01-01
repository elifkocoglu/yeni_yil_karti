import React, { useState, useRef } from 'react';
import PhotoUploader from './PhotoUploader';

const THEMES = [
    { id: 'romantic', name: '💖 Romantik', color: 'from-pink-500 to-rose-500', song: 'romantic' },
    { id: 'funny', name: '🤡 Komik & Eğlenceli', color: 'from-yellow-400 to-orange-500', song: 'funny' },
    { id: 'exciting', name: '🚀 Heyecanlı & Hızlı', color: 'from-blue-500 to-purple-600', song: 'exciting' },
];

const SURPRISE_IMAGES = {
    funny: [
        'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGZ4eWx5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5eXl5/3o7TKSjRrfIPjeiVyM/giphy.gif', // Cat meme (placeholder)
        'https://cdn-icons-png.flaticon.com/512/742/742751.png', // Clown
    ],
    romantic: [
        'https://cdn-icons-png.flaticon.com/512/1077/1077035.png', // Heart 
    ],
    exciting: []
};

const ClipStudio: React.FC = () => {
    const [photos, setPhotos] = useState<string[]>([]);
    const [selectedTheme, setSelectedTheme] = useState(THEMES[1]); // Default Funny
    const [status, setStatus] = useState<'idle' | 'preview' | 'recording' | 'finished'>('idle');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewLoopRef = useRef<number>(0);

    const handleUpload = (files: File[]) => {
        const newPhotos = files.map((file) => URL.createObjectURL(file));
        setPhotos((prev) => [...prev, ...newPhotos]);
    };

    // The rendering logic separated for reuse
    const renderFrame = (ctx: CanvasRenderingContext2D, elapsed: number, theme: string, images: string[], width: number, height: number) => {
        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);

        let durationPerPhoto = 2000;
        if (theme === 'exciting') durationPerPhoto = 1000;

        const totalIndex = Math.floor(elapsed / durationPerPhoto);
        const photoIndex = totalIndex % images.length;

        const img = new Image();
        img.src = images[photoIndex];

        // Basic "Cover" fit
        if (img.complete && img.naturalWidth > 0) {
            const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
            const x = (width / 2) - (img.naturalWidth / 2) * scale;
            const y = (height / 2) - (img.naturalHeight / 2) * scale;

            // Apply Theme Effects
            ctx.save();
            if (theme === 'romantic') {
                ctx.globalAlpha = 1 - (elapsed % durationPerPhoto) / durationPerPhoto * 0.2; // Pulse opacity
                ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);

                // Random Surprise Image overlay
                if (photoIndex % 2 === 0 && SURPRISE_IMAGES.romantic.length > 0) {
                    const heartImg = new Image();
                    heartImg.src = SURPRISE_IMAGES.romantic[0];
                    if (heartImg.complete) ctx.drawImage(heartImg, 50, 50, 100, 100);
                }
                // Overlay Text
                ctx.font = "100px Arial";
                ctx.fillText("❤️", width - 150, 100);

            } else if (theme === 'funny') {
                // Random shake
                const shakeX = Math.random() * 10 - 5;
                const shakeY = Math.random() * 10 - 5;
                ctx.drawImage(img, x + shakeX, y + shakeY, img.naturalWidth * scale, img.naturalHeight * scale);

                // Occasional Surprise Overlay (every 3rd photo)
                if (totalIndex % 3 === 0 && SURPRISE_IMAGES.funny.length > 0) {
                    const surpriseImg = new Image();
                    // Pick random surprise
                    surpriseImg.src = SURPRISE_IMAGES.funny[totalIndex % SURPRISE_IMAGES.funny.length];
                    if (surpriseImg.complete) ctx.drawImage(surpriseImg, width - 200, height - 200, 150, 150);
                }
            } else {
                // Normal zoom
                const zoom = 1 + ((elapsed % durationPerPhoto) / durationPerPhoto) * 0.1;
                ctx.translate(width / 2, height / 2);
                ctx.scale(zoom, zoom);
                ctx.translate(-width / 2, -height / 2);
                ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
            }
            ctx.restore();
        }

        // Border / Frame
        ctx.strokeStyle = theme === 'romantic' ? 'pink' : theme === 'exciting' ? 'cyan' : 'yellow';
        ctx.lineWidth = 10;
        ctx.strokeRect(0, 0, width, height);
    };

    // Ensure music plays during preview
    const startPreview = () => {
        if (!canvasRef.current || photos.length === 0) return;
        setStatus('preview');

        // Mix in surprise photos if funny
        let processedPhotos = [...photos];
        // In a real implementation we would insert the surprise images into the array
        // properly rather than just overlaying them, but the overlay approach works for simple demo.

        // Mute background music for clip preview
        // (In a real app, we would talk to the global music player to pause it)

        const startTime = Date.now();
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Start Theme Music
        // Note: In browsers, we need user interaction to start audio context. 
        // This function is triggered by a button click, so it should work.

        // Simple HTML Audio for theme music
        const audio = new Audio();
        if (selectedTheme.id === 'romantic') audio.src = 'https://cdn.pixabay.com/download/audio/2022/11/22/audio_febc508520.mp3'; // Gentle
        else if (selectedTheme.id === 'funny') audio.src = 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3'; // Upbeat
        else audio.src = 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_1012809624.mp3'; // Action

        audio.volume = 0.5;
        audio.play().catch(e => console.log("Clone music play error", e));

        // Store audio to stop it later
        (canvasRef.current as any).previewAudio = audio;

        const loop = () => {
            const elapsed = Date.now() - startTime;
            renderFrame(ctx, elapsed, selectedTheme.id, processedPhotos, canvasRef.current!.width, canvasRef.current!.height);
            previewLoopRef.current = requestAnimationFrame(loop);
        };
        loop();
    };

    const stopPreview = () => {
        cancelAnimationFrame(previewLoopRef.current);
        setStatus('idle');
        const audio = (canvasRef.current as any)?.previewAudio as HTMLAudioElement;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    const resetClip = () => {
        setPhotos([]);
        setStatus('idle');
        stopPreview();
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const downloadVideo = () => {
        if (!canvasRef.current) return;
        setStatus('recording');

        const stream = canvasRef.current.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `yilbasi_klibi_${selectedTheme.id}_2026.webm`;
            a.click();
            setStatus('finished');
            setTimeout(() => setStatus('idle'), 3000);
        };

        mediaRecorder.start();

        // Record for 1 cycle of photos or max 15 seconds
        setTimeout(() => {
            mediaRecorder.stop();
        }, photos.length * 2000 + 1000);
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-8 bg-slate-800/80 backdrop-blur-xl rounded-[3rem] border border-white/20 mt-24 mb-24 shadow-2xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[100px] -z-10"></div>

            <div className="text-center mb-10">
                <h2 className="text-4xl md:text-6xl font-script text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 mb-4 animate-pulse">
                    🎬 Yönetmen Koltuğu
                </h2>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                    Kendi yeni yıl filmini çek! Fotoğraflarını yükle, sana uygun temayı seç ve sihrin gerçekleşmesini izle.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left: Controls */}
                <div className="lg:col-span-5 space-y-6">
                    <PhotoUploader onUpload={handleUpload} />

                    {/* Theme Selector */}
                    <div className="space-y-3">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            🎨 Tema Seç: <span className="text-xs text-purple-300 font-normal">(Müzik ve Efektler buna göre değişir)</span>
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {THEMES.map(theme => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedTheme(theme)}
                                    className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${selectedTheme.id === theme.id ? `bg-gradient-to-r ${theme.color} border-transparent text-white shadow-lg scale-105` : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full border-2 ${selectedTheme.id === theme.id ? 'bg-white border-white' : 'border-gray-500'}`}></div>
                                    <span className="font-bold text-lg">{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Photo List Mini */}
                    {photos.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">{photos.length} Fotoğraf Seçildi</span>
                                <button onClick={resetClip} className="text-xs text-red-400 hover:text-red-300 underline">Tümünü Temizle</button>
                            </div>
                            <div className="grid grid-cols-4 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-black/20 rounded-xl">
                                {photos.map((p, i) => (
                                    <div key={i} className="relative group aspect-square">
                                        <img src={p} className="w-full h-full object-cover rounded-lg border border-white/20" />
                                        <button
                                            onClick={() => removePhoto(i)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Preview & Action */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* ... Canvas Container ... */}
                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl group">
                        <canvas
                            ref={canvasRef}
                            width={1280}
                            height={720}
                            className="w-full h-full object-contain"
                        />

                        {/* Overlay Play Button if Idle */}
                        {status === 'idle' && photos.length > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer" onClick={startPreview}>
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border border-white/50 hover:scale-110 transition-transform backdrop-blur-md">
                                    <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[30px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                                </div>
                            </div>
                        )}

                        {status === 'idle' && photos.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 text-white/30">
                                <span className="text-4xl opacity-50">🎬</span>
                                <span className="font-bold text-xl">Önizleme Sahnesi</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        {status === 'preview' ? (
                            <button
                                onClick={stopPreview}
                                className="py-4 rounded-xl bg-orange-600/80 text-white font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                            >
                                ⏸️ Durdur
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    disabled={photos.length === 0}
                                    onClick={startPreview}
                                    className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    ▶️ Başlat
                                </button>
                                {photos.length > 0 && (
                                    <button onClick={resetClip} className="px-4 rounded-xl bg-white/10 text-white hover:bg-white/20" title="Yeni Klip">
                                        🔄
                                    </button>
                                )}
                            </div>
                        )}

                        <button
                            disabled={photos.length === 0 || status === 'recording'}
                            onClick={downloadVideo}
                            className={`py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${status === 'recording'
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:saturation-0'
                                }`}
                        >
                            {status === 'recording' ? 'Kaydediliyor... 🔴' : status === 'finished' ? 'İndirildi! ✅' : 'Klibi İndir 💾'}
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ClipStudio;
