import React from 'react';

const SnowFamily: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full pointer-events-none z-0 overflow-hidden h-64">
            {/* Container for the walking animation (Whole family moves together) */}
            <div className="absolute bottom-4 flex items-end animate-[slideAcross_25s_linear_infinite] hover:pause">

                {/* The Snow Family Image - Using SVG to prevent broken links */}
                <div className="w-64 md:w-80 filter drop-shadow-2xl hover:scale-105 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
                        {/* Father */}
                        <g transform="translate(10, 20)">
                            <circle cx="30" cy="80" r="25" fill="#fff" />
                            <circle cx="30" cy="45" r="18" fill="#fff" />
                            <rect x="15" y="20" width="30" height="25" fill="#333" rx="2" /> {/* Hat */}
                            <rect x="10" y="42" width="40" height="5" fill="#333" />
                            <circle cx="25" cy="40" r="2" fill="#000" /> <circle cx="35" cy="40" r="2" fill="#000" />
                            <path d="M28 48 l10 5 -10 5" stroke="orange" strokeWidth="4" strokeLinecap="round" />
                            <rect x="20" y="55" width="20" height="8" fill="#c0392b" rx="4" /> {/* Scarf */}
                        </g>
                        {/* Mother */}
                        <g transform="translate(70, 30)">
                            <circle cx="30" cy="80" r="22" fill="#fff" />
                            <circle cx="30" cy="48" r="16" fill="#fff" />
                            <path d="M20 40 Q30 20 40 40" fill="none" stroke="#e91e63" strokeWidth="15" strokeLinecap="round" /> {/* Pink Hat */}
                            <circle cx="25" cy="45" r="2" fill="#000" /> <circle cx="35" cy="45" r="2" fill="#000" />
                            <circle cx="30" cy="50" r="3" fill="orange" />
                            <rect x="22" y="58" width="16" height="6" fill="#e91e63" rx="3" />
                        </g>
                        {/* Child 1 */}
                        <g transform="translate(120, 50)">
                            <circle cx="20" cy="85" r="15" fill="#fff" />
                            <circle cx="20" cy="65" r="12" fill="#fff" />
                            <polygon points="10,60 30,60 20,40" fill="#2ecc71" /> {/* Green Hat */}
                            <circle cx="20" cy="63" r="1.5" fill="#000" /> <circle cx="24" cy="63" r="1.5" fill="#000" />
                            <circle cx="20" cy="68" r="2" fill="orange" />
                        </g>
                        {/* Child 2 */}
                        <g transform="translate(155, 60)">
                            <circle cx="15" cy="88" r="12" fill="#fff" />
                            <circle cx="15" cy="72" r="10" fill="#fff" />
                            <rect x="5" y="60" width="20" height="10" fill="#f1c40f" rx="2" /> {/* Yellow Hat */}
                            <circle cx="12" cy="70" r="1.5" fill="#000" /> <circle cx="18" cy="70" r="1.5" fill="#000" />
                            <circle cx="15" cy="74" r="2" fill="orange" />
                        </g>
                    </svg>
                </div>

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
