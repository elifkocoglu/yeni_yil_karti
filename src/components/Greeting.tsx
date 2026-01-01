import React from 'react';
import { motion } from 'framer-motion';

const Greeting: React.FC = () => {
    return (
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen text-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="mb-8"
            >
                <h1 className="text-8xl md:text-9xl font-script text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)] animate-pulse-slow">
                    2026
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
            >
                <h2 className="text-4xl md:text-6xl font-light text-white tracking-widest uppercase mb-4 drop-shadow-lg">
                    Yeni Yılınız
                </h2>
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                    Kutlu Olsun
                </h2>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 max-w-lg shadow-xl"
            >
                <p className="text-lg md:text-xl text-gray-200 font-light leading-relaxed">
                    Yeni yılın size ve sevdiklerinize sağlık, mutluluk ve başarı getirmesini dilerim.
                    <br />
                    <span className="block mt-4 font-script text-3xl text-yellow-200">
                        Mutlu Yıllar!
                    </span>
                </p>
            </motion.div>
        </div>
    );
};

export default Greeting;
