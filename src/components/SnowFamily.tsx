import React from 'react';

const SnowFamily: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full pointer-events-none z-0 overflow-hidden h-64">
            {/* Container for the walking animation (Whole family moves together) */}
            <div className="absolute bottom-4 flex items-end animate-[slideAcross_25s_linear_infinite] hover:pause">

                {/* The Snow Family Image */}
                <img
                    src="https://png.pngtree.com/png-clipart/20230427/original/pngtree-three-cute-snowmen-family-clipart-png-image_9115202.png"
                    alt="Snow Family"
                    className="w-64 md:w-80 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />

                {/* Speech Bubble (Optional cute touch) */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/90 p-2 rounded-xl rounded-bl-none text-xs font-bold text-blue-900 animate-bounce shadow-lg">
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
