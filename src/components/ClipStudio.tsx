import React, { useState, useRef } from 'react';
import PhotoUploader from './PhotoUploader';

// Types for our Particle Engine
interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

const ClipStudio: React.FC = () => {
    const [photos, setPhotos] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'preview' | 'recording' | 'finished'>('idle');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewLoopRef = useRef<number>(0);

    const handleUpload = (files: File[]) => {
        const newPhotos = files.map((file) => URL.createObjectURL(file));
        setPhotos((prev) => [...prev, ...newPhotos]);
    };

    // --- PARTICLE ENGINE LOGIC ---
    const createParticles = (width: number, height: number): Particle[] => {
        const particles: Particle[] = [];
        const count = 300; // Manageable count for recording performance
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                life: 0,
                color: Math.random() > 0.5 ? '#FFD700' : '#FFFFFF', // Gold and White
                size: Math.random() * 3 + 1
            });
        }
        return particles;
    };

    const startPreview = () => {
        if (!canvasRef.current || photos.length === 0) return;
        setStatus('preview');

        // Default nice ambient music
        const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf87a.mp3'); // "Cinematic Atmosphere"
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed (user interaction needed)", e));
        (canvasRef.current as any).previewAudio = audio;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        // Animation constants
        const PHOTO_DURATION = 3000; // 3 seconds visible
        const TRANSITION_DURATION = 1500; // 1.5 seconds explosion
        const particles = createParticles(width, height);

        const startTime = Date.now();

        const loop = () => {
            const now = Date.now();
            const totalElapsed = now - startTime;

            // Calculate which photo we are on
            const totalCycle = PHOTO_DURATION + TRANSITION_DURATION;
            const cycleIndex = Math.floor(totalElapsed / totalCycle);
            const cycleTime = totalElapsed % totalCycle;

            // Stop if we showed all photos
            if (cycleIndex >= photos.length) {
                stopPreview();
                return; // End loop
            }

            // Current & Next Image
            const currentImgSrc = photos[cycleIndex];
            const nextImgSrc = photos[(cycleIndex + 1) % photos.length]; // Loop back to start for next

            const currentImg = new Image(); currentImg.src = currentImgSrc;
            const nextImg = new Image(); nextImg.src = nextImgSrc;

            // --- DRAWING ---
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);

            // Helper to draw an image 'cover' style
            const drawImageCover = (img: HTMLImageElement, opacity: number = 1) => {
                if (!img.complete || img.naturalWidth === 0) return;
                const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
                const x = (width / 2) - (img.naturalWidth / 2) * scale;
                const y = (height / 2) - (img.naturalHeight / 2) * scale;

                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);
                ctx.restore();
            };

            if (cycleTime < PHOTO_DURATION) {
                // STABLE PHASE: Just show the photo
                // Slight slow zoom effect for "Premium" feel
                const zoom = 1 + (cycleTime / PHOTO_DURATION) * 0.05;
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.scale(zoom, zoom);
                ctx.translate(-width / 2, -height / 2);
                drawImageCover(currentImg);
                ctx.restore();

                // Reset particles for next explosion
                particles.forEach(p => {
                    p.x = width / 2;
                    p.y = height / 2;
                    p.life = 0;
                });

            } else {
                // EXPLOSION PHASE (Transition)
                // 1. Draw Next Photo (Background)
                drawImageCover(nextImg);

                // 2. Draw Current Photo fading out rapidly
                const transProgress = (cycleTime - PHOTO_DURATION) / TRANSITION_DURATION;
                drawImageCover(currentImg, 1 - transProgress);

                // 3. Render Particles Exploding
                ctx.save();
                particles.forEach((p) => {
                    // Update
                    p.life = transProgress;
                    p.x += p.vx * (1 + transProgress * 5); // Accelerate
                    p.y += p.vy * (1 + transProgress * 5);

                    // Draw Star/Snowflake
                    ctx.globalAlpha = 1 - transProgress; // Fade out
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * (1 - transProgress), 0, Math.PI * 2);
                    ctx.fill();

                    // Sparkle
                    if (Math.random() > 0.9) {
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = 'white';
                        ctx.fillRect(p.x, p.y, p.size * 2, p.size * 2);
                        ctx.shadowBlur = 0;
                    }
                });
                ctx.restore();
            }

            // Frame
            ctx.strokeStyle = '#c0a062'; // Gold border
            ctx.lineWidth = 20;
            ctx.strokeRect(0, 0, width, height);

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
        if (!canvasRef.current || photos.length === 0) return;
        setStatus('recording');

        // Re-trigger start preview for the recorder to capture it
        // Note: In a real app we might want to separate logic, but this simplifies sync
        stopPreview();

        setTimeout(() => {
            startPreview();
            const stream = canvasRef.current!.captureStream(30);
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
                a.download = `yilbasi_anis_2026.webm`;
                a.click();
                setStatus('finished');
                stopPreview(); // Stop loop after recording
                setTimeout(() => setStatus('idle'), 3000);
            };

            mediaRecorder.start();

            // Calculate Total Duration: (Show + Transition) * Count
            const TOTAL_DURATION = (3000 + 1500) * photos.length;

            setTimeout(() => {
                mediaRecorder.stop();
            }, TOTAL_DURATION + 500); // 500ms buffer
        }, 100);
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-8 bg-slate-800/80 backdrop-blur-xl rounded-[3rem] border border-white/20 mt-24 mb-24 shadow-2xl relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 blur-[100px] -z-10"></div>

            <div className="text-center mb-10">
                <h2 className="text-4xl md:text-6xl font-script text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 mb-4 animate-pulse">
                    ✨ Sihirli Anılar
                </h2>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                    Fotoğraflarını yükle, yıldız tozu efektiyle büyüleyici bir yeni yıl klibine dönüşsün.
                </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left: Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <PhotoUploader onUpload={handleUpload} />

                    {/* Info Box */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-gray-400">
                        <p>🌟 <strong>Otomatik Efekt:</strong> Fotoğrafların binlerce yıldıza dönüşerek değişecek.</p>
                        <p className="mt-2">🎵 <strong>Müzik:</strong> Sinematik atmosfer müziği otomatik eklenir.</p>
                    </div>

                    {/* Photo List Mini */}
                    {photos.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-400">{photos.length} Fotoğraf</span>
                                <button onClick={resetClip} className="text-xs text-red-400 hover:text-red-300 underline">Temizle</button>
                            </div>
                            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 bg-black/20 rounded-xl">
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
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border-4 border-yellow-500/30 shadow-2xl group">
                        <canvas
                            ref={canvasRef}
                            width={1280}
                            height={720}
                            className="w-full h-full object-contain"
                        />

                        {status === 'idle' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer transition-colors hover:bg-black/50" onClick={photos.length > 0 ? startPreview : undefined}>
                                <div className={`text-center ${photos.length === 0 ? 'opacity-50' : 'opacity-100'}`}>
                                    <div className="text-6xl mb-4">✨</div>
                                    <div className="text-2xl font-bold text-white">
                                        {photos.length === 0 ? 'Fotoğraf Yükleyerek Başla' : 'Önizlemeyi Başlat'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        {status === 'preview' && (
                            <button
                                onClick={stopPreview}
                                className="flex-1 py-4 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors"
                            >
                                ⏹️ Durdur
                            </button>
                        )}

                        {(status === 'idle' && photos.length > 0) && (
                            <button
                                onClick={startPreview}
                                className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors"
                            >
                                ▶️ Oynat
                            </button>
                        )}

                        <button
                            disabled={photos.length === 0 || status === 'recording'}
                            onClick={downloadVideo}
                            className={`flex-[2] py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${status === 'recording'
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:scale-105 disabled:opacity-50 disabled:scale-100'
                                }`}
                        >
                            {status === 'recording' ? 'Sihir Yapılıyor... 🎬' : status === 'finished' ? 'Klip İndirildi! ✅' : 'Klibi Oluştur ve İndir 💾'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClipStudio;
