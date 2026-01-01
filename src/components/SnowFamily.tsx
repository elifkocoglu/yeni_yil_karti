import React from 'react';

const SnowFamily: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full pointer-events-none z-0 overflow-hidden h-64">
            {/* Container for the walking animation (Whole family moves together) */}
            <div className="absolute bottom-4 flex items-end animate-[slideAcross_25s_linear_infinite] hover:pause">

                <div className="relative transition-transform duration-300 ease-in-out hover:scale-105">
                    <img
                        src="./snow_family.png"
                        alt="Snow Family"
                        className="w-48 md:w-64 drop-shadow-2xl opacity-90 filter brightness-110"
                    />

                    {/* Speech Bubble */}
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 px-6 py-3 rounded-full shadow-xl animate-bounce border-2 border-blue-100 whitespace-nowrap z-20">
                        <span className="font-bold text-lg">Mutlu Yıllar! ❄️</span>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b-2 border-r-2 border-blue-100"></div>
                    </div>
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
