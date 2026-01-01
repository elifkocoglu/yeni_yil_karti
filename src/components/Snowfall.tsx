import React, { useEffect, useRef } from 'react';

interface Snowflake {
    x: number;
    y: number;
    radius: number;
    speed: number;
    wind: number;
}

const Snowfall: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let snowflakes: Snowflake[] = [];
        let animationId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const createSnowflakes = () => {
            const count = 50; // Reduced from 100 for less clutter
            for (let i = 0; i < count; i++) {
                snowflakes.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2 + 0.5, // Smaller: 0.5px to 2.5px
                    speed: Math.random() * 0.8 + 0.2, // Slower fall
                    wind: Math.random() * 0.5 - 0.25,
                });
            }
        };
        createSnowflakes();

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Slightly more transparent
            ctx.beginPath();

            snowflakes.forEach((f) => {
                f.y += f.speed;
                f.x += f.wind;

                if (f.y > canvas.height) {
                    f.y = 0;
                    f.x = Math.random() * canvas.width;
                }
                if (f.x > canvas.width) f.x = 0;
                if (f.x < 0) f.x = canvas.width;

                ctx.moveTo(f.x, f.y);
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            });
            ctx.fill();

            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    // Increased z-index to 50 to appear over content (foreground)
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

export default Snowfall;
