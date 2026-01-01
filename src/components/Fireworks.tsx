import React, { useEffect, useRef, useState } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    color: string;
}

const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF', '#FFFFFF', '#FFA500'];

const Fireworks: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isAuto, setIsAuto] = useState(false);
    const isAutoRef = useRef(false); // Ref to hold the latest isAuto value for the animation loop

    // Update the ref whenever isAuto state changes
    useEffect(() => {
        isAutoRef.current = isAuto;
    }, [isAuto]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const createFirework = (x: number, y: number) => {
            const particleCount = 100;
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 6 + 2;
                particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    alpha: 1,
                    color,
                });
            }
        };

        const loop = () => {
            // Semi-transparent clear for trail effect
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'lighter';

            // Randomly launch fireworks
            if (isAutoRef.current && Math.random() < 0.1) {
                createFirework(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height * 0.6
                );
            }

            particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // Gravity
                p.vx *= 0.96; // Air resistance
                p.vy *= 0.96;
                p.alpha -= 0.01;

                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();

                if (p.alpha <= 0) {
                    particles.splice(index, 1);
                }
            });

            ctx.globalAlpha = 1;
            animationId = requestAnimationFrame(loop);
        };

        loop();

        const handleClick = (e: MouseEvent) => {
            createFirework(e.clientX, e.clientY);
        };

        window.addEventListener('mousedown', handleClick);
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                createFirework(e.touches[0].clientX, e.touches[0].clientY);
            }
        });

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousedown', handleClick);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <>
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" style={{ pointerEvents: 'auto', cursor: 'pointer' }} />

            {/* Controls */}
            <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
                <div className="text-white font-bold text-sm text-right mb-1 pointer-events-none bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg">
                    🎆 Ekrana Tıkla & Patlat! <br />
                    <span className="text-xs font-normal opacity-80">veya otomatiği aç 👇</span>
                </div>
                <button
                    onClick={() => setIsAuto(!isAuto)}
                    className={`p-4 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${isAuto ? 'bg-yellow-400 border-yellow-200 text-black shadow-[0_0_25px_rgba(250,204,21,0.6)]' : 'bg-black/60 border-white/30 text-white hover:bg-white/20'}`}
                >
                    <span className="text-2xl">⚡</span>
                </button>
            </div>
        </>
    );
};

export default Fireworks;
