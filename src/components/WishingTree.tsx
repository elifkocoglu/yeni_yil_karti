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
            // Define a tree shape polygon approximation for better placement
            // Normalizing x,y to 0-100% of the container
            // Tree is roughly a triangle: Top(50, 10), BottomLeft(10, 90), BottomRight(90, 90)

            const y = Math.random() * 70 + 20; // 20% to 90% from top
            const spread = (y - 20) * 0.8; // Wider at bottom
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
            setIsOpen(false);
        } catch (err) {
            alert("Hata: Dilek gönderilemedi.");
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
          Moved outside the Z-layer complexity to ensure clickability 
      */}
            <div className="relative z-50 mb-8">
                <button
                    onClick={() => setIsOpen(true)}
                    className="px-12 py-5 bg-gradient-to-r from-red-600 to-red-800 text-white text-xl font-bold rounded-full shadow-[0_0_25px_rgba(220,38,38,0.8)] hover:scale-105 hover:shadow-[0_0_35px_rgba(220,38,38,1)] transition-all animate-pulse border-2 border-yellow-400/50"
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

                {/* Nice SVG Tree Background */}
                <svg viewBox="0 0 100 120" className="absolute inset-0 w-full h-full drop-shadow-2xl opacity-90" preserveAspectRatio="none">
                    {/* Trunk */}
                    <rect x="42" y="100" width="16" height="20" fill="#3E2723" rx="2" />

                    {/* Leaves (Layered Triangles) */}
                    <path d="M50 10 L80 50 L20 50 Z" fill="#1b5e20" /> {/* Top */}
                    <path d="M50 30 L85 80 L15 80 Z" fill="#14532d" /> {/* Middle */}
                    <path d="M50 50 L90 100 L10 100 Z" fill="#052e16" /> {/* Bottom */}

                    {/* Highlights */}
                    <path d="M50 10 L50 100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                </svg>

                {/* Wishes as Ornaments */}
                <div className="absolute inset-0 z-10">
                    {wishes.map((wish) => (
                        <div
                            key={wish.id}
                            className="absolute"
                            style={{
                                left: `${wish.position?.x}%`,
                                top: `${wish.position?.y}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            {/* Ornament Interaction */}
                            <button
                                onClick={() => setSelectedWishId(selectedWishId === wish.id ? null : wish.id)}
                                className={`group relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${wish.color || 'from-yellow-400 to-yellow-600'} shadow-[0_4px_6px_rgba(0,0,0,0.3)] hover:scale-125 transition-transform flex items-center justify-center text-white border border-white/20`}
                            >
                                {/* Glossy Reflection */}
                                <div className="absolute top-1 right-2 w-2 h-2 bg-white/40 rounded-full blur-[1px]"></div>
                                <span className="text-[10px] font-bold drop-shadow-md">{wish.nickname.charAt(0).toUpperCase()}</span>

                                {/* Connector String */}
                                <div className="absolute -top-4 w-[1px] h-4 bg-white/30"></div>
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
