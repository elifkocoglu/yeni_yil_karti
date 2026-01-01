import React, { useState, useRef } from 'react';
import PhotoUploader from './PhotoUploader';

const ClipStudio: React.FC = () => {
    const [photos, setPhotos] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleUpload = (files: File[]) => {
        const newPhotos = files.map((file) => URL.createObjectURL(file));
        setPhotos((prev) => [...prev, ...newPhotos]);
    };

    const startGeneration = async () => {
        if (!canvasRef.current || photos.length === 0) return;
        setIsRecording(true);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const stream = canvas.captureStream(30); // 30 FPS
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
            a.download = `yilbasi_klibi_2026.webm`;
            a.click();
            setIsRecording(false);
        };

        mediaRecorder.start();

        // Simple slideshow logic for demonstration (Replace with 'Extraordinary' engine later)
        const durationPerPhoto = 2000;
        const startTime = Date.now();
        const totalDuration = photos.length * durationPerPhoto;

        const animate = () => {
            if (!ctx) return;
            const elapsed = Date.now() - startTime;

            if (elapsed > totalDuration) {
                mediaRecorder.stop();
                return;
            }

            // Background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw current photo
            const currentPhotoIndex = Math.floor(elapsed / durationPerPhoto) % photos.length;
            const img = new Image();
            img.src = photos[currentPhotoIndex];

            // Simulating image load for canvas (In real app, preload images)
            if (img.complete) {
                // Center crop logic would go here
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }

            // Overlay Text
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText("Mutlu Yıllar!", 50, 100);

            requestAnimationFrame(animate);
        }

        // Preload first image then start
        const firstImg = new Image();
        firstImg.src = photos[0];
        firstImg.onload = () => {
            animate();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-slate-800/60 backdrop-blur-md rounded-3xl border border-white/10 mt-24 mb-24">
            <div className="text-center mb-8">
                <h2 className="text-3xl md:text-5xl font-script text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-2">
                    Yılbaşı Klibini Oluştur 🎬
                </h2>
                <p className="text-slate-300">Fotoğraflarını yükle, videonu indir!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <PhotoUploader onUpload={handleUpload} />

                    <div className="mt-4 grid grid-cols-4 gap-2">
                        {photos.map((src, i) => (
                            <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/20 relative group">
                                <img src={src} className="w-full h-full object-cover" alt="upload" />
                                <button
                                    onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-500 font-bold"
                                >
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-4 bg-black/60 rounded-xl p-4 min-h-[300px]">
                    {/* Preview Canvas */}
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={360}
                        className="w-full h-auto bg-black rounded border border-white/10 shadow-2xl"
                    />

                    <button
                        disabled={photos.length === 0 || isRecording}
                        onClick={startGeneration}
                        className={`px-8 py-3 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all ${isRecording
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105'
                            }`}
                    >
                        {isRecording ? 'Klip Hazırlanıyor... 🎥' : '🎬 Klibi Oluştur & İndir'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClipStudio;
