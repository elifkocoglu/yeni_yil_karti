import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

interface Wish {
    id: string;
    nickname: string;
    message: string;
    createdAt: any;
    position: { x: number; y: number };
    color: string;
}

const ORNAMENT_COLORS = [
    'from-red-400 to-red-600',
    'from-blue-400 to-blue-600',
    'from-yellow-300 to-yellow-500',
    'from-purple-400 to-purple-600',
    'from-emerald-400 to-emerald-600'
];

const WishingTree: React.FC = () => {
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [nickname, setNickname] = useState('');
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedWishId, setSelectedWishId] = useState<string | null>(null);
    // const [error, setError] = useState(''); // Removed unused state

    useEffect(() => {
        try {
            const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const newWishes = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Wish[];
                setWishes(newWishes);
            }, (err) => {
                console.error("Firebase connection error:", err);
            });
            return () => unsubscribe();
        } catch (err) {
            console.error("Firebase init error", err);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim() || !message.trim()) return;

        try {
            // Optimistic Close: Close immediately for better UX
            setIsOpen(false);

            const y = Math.random() * 60 + 20; // 20% to 80% from top (keep within tree foliage)
            // Triangle approximation for width
            const spread = (y - 20) * 0.6;
            const x = 50 + (Math.random() - 0.5) * spread;

            const color = ORNAMENT_COLORS[Math.floor(Math.random() * ORNAMENT_COLORS.length)];

            await addDoc(collection(db, 'wishes'), {
                nickname,
                message,
                createdAt: serverTimestamp(),
                position: { x, y },
                color
            });
            setNickname('');
            setMessage('');
            // setIsOpen(false); // Moved up
        } catch (err) {
            alert("Hata: Dilek gönderilemedi.");
            setIsOpen(true); // Re-open if failed
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bu dileği silmek istediğinize emin misiniz?')) {
            try {
                await deleteDoc(doc(db, 'wishes', id));
                setSelectedWishId(null);
            } catch (err) {
                console.error("Error removing document: ", err);
            }
        }
    };

    return (
        <div className="relative flex flex-col items-center w-full max-w-4xl mx-auto p-4 z-30">

            {/* 
          Main Interaction Button 
      */}
            <div className="relative z-50 mb-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white text-lg font-bold rounded-full shadow-[0_0_15px_rgba(220,38,38,0.6)] hover:scale-105 transition-all border border-yellow-400/30"
                >
                    ✨ Bir Dilek As 🎄
                </button>
            </div>

            {/* Modal Form */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/20 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-xl font-bold"
                        >
                            ✕
                        </button>
                        <h2 className="text-3xl text-white font-script mb-6 text-center">✨ Dilek Zamanı ✨</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-sm text-gray-300 ml-1 font-bold">Adın / Rumuzun</label>
                                <input
                                    type="text"
                                    placeholder="Örn: Elişko"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                    maxLength={20}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-300 ml-1 font-bold">Dileğin</label>
                                <textarea
                                    placeholder="Yeni yılda..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent h-32 transition-all resize-none"
                                    maxLength={140}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl hover:opacity-90 shadow-lg transform active:scale-95 transition-all"
                            >
                                As Gitsin! 🎄
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* The Tree Visualization */}
            <div className="relative w-full max-w-[500px] aspect-[4/5] flex justify-center items-end">

                {/* Realistic Tree Image (Using the uploaded one) */}
                {/* We use the base parameter in vite config, so /tree_real.png works if placed in public */}
                <img
                    src="./tree_real.png"
                    alt="Yılbaşı Ağacı"
                    className="absolute inset-0 w-full h-full object-contain filter drop-shadow-2xl opacity-95"
                />

                {/* Wishes as Ornaments */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Make children pointer-events-auto */}
                    {wishes.map((wish, index) => (
                        <div
                            key={wish.id}
                            className="absolute pointer-events-auto" // Enable clicks for individual wishes
                            style={{
                                left: `${wish.position?.x}%`,
                                top: `${wish.position?.y}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {/* Ornament Interaction */}
                            <button
                                onClick={() => setSelectedWishId(selectedWishId === wish.id ? null : wish.id)}
                                className={`group relative transition-transform hover:scale-125 flex items-center justify-center text-white z-10`}
                            >
                                {/* ORNAMENT RENDER LOGIC */}
                                {(() => {
                                    // Index 0 is the Star (The First Wish)
                                    // Note: wishes are sorted by createdAt desc in the query, so index wishes.length - 1 is the oldest.
                                    // Wait, query is `orderBy('createdAt', 'desc')`. So array[0] is the NEWEST.
                                    // User said "ilk dileği asan kişi" (First person to hang it). That means the OLDEST wish.
                                    // So the Star should be the LAST item in this array (wishes[wishes.length - 1]).

                                    // Let's verify sort order. Line 32: orderBy('createdAt', 'desc').
                                    // Newest is at top (index 0). Oldest is at bottom (index length-1).
                                    // "İlk dileği asan" = The one with oldest timestamp.
                                    // So Star = wishes[wishes.length - 1].

                                    // Sequential types for others:
                                    // We can use the index to determine cyclic styles. 

                                    const isFirstWish = index === wishes.length - 1;

                                    // If we want the ornaments to be sequential based on creation order, we should Use (wishes.length - 1 - index)
                                    const chronologicalIndex = wishes.length - 1 - index;
                                    const ornamentTypeIndex = (chronologicalIndex - 1) % 6; // -1 because index 0 is star

                                    if (isFirstWish) {
                                        // 🌟 THE STAR (First Wish)
                                        return (
                                            <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]">
                                                {/* Star SVG */}
                                                <svg viewBox="0 0 24 24" fill="url(#starGradient)" className="w-full h-full animate-pulse-slow">
                                                    <defs>
                                                        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#FFF700" />
                                                            <stop offset="100%" stopColor="#FFD700" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                                <span className="absolute text-yellow-900 font-bold text-xs">{wish.nickname.charAt(0).toUpperCase()}</span>
                                            </div>
                                        );
                                    } else {
                                        // 🎄 6 DISTINCT ORNAMENTS (Rotating)
                                        // Defining styles for the 6 types
                                        const styles = [
                                            'bg-gradient-to-br from-red-500 to-red-700 shadow-red-500/50',        // 1. Red
                                            'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-400/50',     // 2. Blue
                                            'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/50', // 3. Purple
                                            'bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/50', // 4. Green
                                            'bg-gradient-to-br from-pink-400 to-rose-600 shadow-pink-500/50',     // 5. Pink
                                            'bg-gradient-to-br from-orange-300 to-amber-500 shadow-orange-400/50' // 6. Gold/Orange
                                        ];

                                        // Safe modulo
                                        const safeIndex = Math.abs(ornamentTypeIndex) % 6;
                                        const styleClass = styles[safeIndex];

                                        return (
                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${styleClass} shadow-lg border border-white/20 flex items-center justify-center`}>
                                                {/* Glossy Reflection */}
                                                <div className="absolute top-1 right-2 w-2 h-2 bg-white/40 rounded-full blur-[1px]"></div>
                                                <span className="text-[10px] font-bold drop-shadow-md text-white">{wish.nickname.charAt(0).toUpperCase()}</span>
                                                {/* Connector String */}
                                                <div className="absolute -top-4 w-[1px] h-4 bg-white/30"></div>
                                            </div>
                                        );
                                    }
                                })()}
                            </button>

                            {/* Popover */}
                            {selectedWishId === wish.id && (
                                <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-white text-slate-900 p-4 rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-200 origin-bottom border-2 border-yellow-400/50">
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-b-2 border-r-2 border-yellow-400/50"></div>

                                    <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                                        <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                            {wish.nickname}
                                        </h3>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(wish.id); }}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Sil"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 0 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>

                                    <p className="text-sm font-medium leading-relaxed text-gray-600 italic">
                                        "{wish.message}"
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default WishingTree;
