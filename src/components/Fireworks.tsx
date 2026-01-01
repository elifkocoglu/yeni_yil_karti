import React, { useEffect, useRef } from 'react';

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
            if (Math.random() < 0.05) {
                createFirework(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height * 0.6 // Top 60% of screen
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

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" style={{ pointerEvents: 'auto', cursor: 'pointer' }} />;
};

export default Fireworks;
