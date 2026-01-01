import React from 'react';

const SnowFamily: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full pointer-events-none z-0 overflow-hidden h-48">
            {/* Container for the walking animation */}
            <div className="absolute bottom-4 flex items-end gap-2 animate-[walk_20s_linear_infinite] hover:pause">

                {/* Father Snowman */}
                <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '2s' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/614/614140.png"
                        alt="Snow Father"
                        className="w-24 md:w-32 drop-shadow-lg"
                    />
                </div>

                {/* Mother Snowwoman */}
                <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.2s' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3771/3771424.png"
                        alt="Snow Mother"
                        className="w-20 md:w-28 drop-shadow-lg filter hue-rotate-15" // Slightly different tone
                    />
                </div>

                {/* Child 1 */}
                <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0.5s' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/2307/2307686.png"
                        alt="Snow Child 1"
                        className="w-14 md:w-20 drop-shadow-lg"
                    />
                </div>

                {/* Child 2 */}
                <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '1.9s', animationDelay: '0.8s' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/614/614050.png"
                        alt="Snow Child 2"
                        className="w-12 md:w-16 drop-shadow-lg transform scale-x-[-1]" // Flip horizontally
                    />
                </div>

            </div>

            <style>{`
        @keyframes walk {
          0% { transform: translateX(-100vw); }
          40% { transform: translateX(20vw); }
          60% { transform: translateX(40vw); }
          100% { transform: translateX(110vw); }
        }
      `}</style>
        </div>
    );
};

export default SnowFamily;
