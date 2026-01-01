import React from 'react';

const SnowFamily: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full pointer-events-none z-0 overflow-hidden h-64">
            {/* Container for the walking animation (Whole family moves together) */}
            <div className="absolute bottom-4 flex items-end animate-[slideAcross_25s_linear_infinite] hover:pause">

                {/* The Snow Family Image - Smaller & Realistic */}
                <img
                    src="https://png.pngtree.com/png-clipart/20231017/original/pngtree-3d-snowman-family-png-image_13327685.png"
                    alt="Snow Family"
                    className="w-32 md:w-48 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />

                {/* Speech Bubble */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 p-2 rounded-xl rounded-bl-none text-[10px] font-bold text-blue-900 animate-bounce shadow-lg whitespace-nowrap">
                    Mutlu Yıllar! ❄️
                </div>

            </div>

            <style>{`
        @keyframes slideAcross {
          0% { transform: translateX(-100vw); }
          100% { transform: translateX(100vw); }
        }
      `}</style>
        </div>
    );
};

export default SnowFamily;
