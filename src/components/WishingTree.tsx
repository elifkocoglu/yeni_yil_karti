import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';

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

    // --- DRAGGING LOGIC ---
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Context refs for event handlers
    const draggingIdRef = useRef<string | null>(null);
    const wishesRef = useRef<Wish[]>([]);

    // Track if a drag actually happened to distinguish click vs drag
    const hasMovedRef = useRef<boolean>(false);

    useEffect(() => {
        draggingIdRef.current = draggingId;
    }, [draggingId]);

    useEffect(() => {
        wishesRef.current = wishes;
    }, [wishes]);

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
        // e.preventDefault(); // Removed to allow Click events to bubble up
        e.stopPropagation();

        setDraggingId(id);
        setSelectedWishId(null);
        hasMovedRef.current = false; // Reset movement flag
    };

    useEffect(() => {
        // Global event handlers
        const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
            if (!draggingIdRef.current || !containerRef.current) return;

            // Mark as moved if this handler fires
            hasMovedRef.current = true;

            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

            const rect = containerRef.current.getBoundingClientRect();

            // Calculate percentage position
            let x = ((clientX - rect.left) / rect.width) * 100;
            let y = ((clientY - rect.top) / rect.height) * 100;

            x = Math.max(0, Math.min(100, x));
            y = Math.max(0, Math.min(100, y));

            // Update local state
            setWishes(prev => prev.map(w => w.id === draggingIdRef.current ? { ...w, position: { x, y } } : w));
        };

        const handleGlobalUp = async () => {
            if (draggingIdRef.current) {
                const currentId = draggingIdRef.current;
                const wish = wishesRef.current.find(w => w.id === currentId);

                // Only update Firebase if we actually moved
                if (wish && hasMovedRef.current) {
                    try {
                        await updateDoc(doc(db, 'wishes', currentId), {
                            'position.x': wish.position.x,
                            'position.y': wish.position.y
                        });
                    } catch (err) {
                        console.error("Update failed", err);
                    }
                }
                setDraggingId(null);
            }
        };

        if (draggingId) {
            window.addEventListener('mousemove', handleGlobalMove);
            window.addEventListener('mouseup', handleGlobalUp);
            window.addEventListener('touchmove', handleGlobalMove, { passive: false });
            window.addEventListener('touchend', handleGlobalUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchmove', handleGlobalMove);
            window.removeEventListener('touchend', handleGlobalUp);
        };
    }, [draggingId]);

    const handleClick = (id: string) => {
        // Only open tooltip if we didn't drag
        if (!hasMovedRef.current) {
            setSelectedWishId(selectedWishId === id ? null : id);
        }
    };

    return (
        <div
            className="relative flex flex-col items-center w-full min-h-screen p-4 overflow-x-hidden"
        >

            {/* 
          Main Interaction Button 
      */}
            <div className="relative z-50 mb-4 sticky top-4">
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

            {/* 
                TREE CONTAINER 
                Added overflow-visible and min-width to allow "sideways scrolling" perception/usage if needed.
                Ref for Dragging Calculation.
            */}
            <div
                ref={containerRef}
                className="relative w-full max-w-[600px] aspect-[4/5] flex justify-center items-end mt-8 touch-none"
            >

                {/* Realistic Tree Image (Using the uploaded one) */}
                {/* We use the base parameter in vite config, so /tree_real.png works if placed in public */}
                <img
                    src="./tree_real.png"
                    alt="Yılbaşı Ağacı"
                    className="absolute inset-0 w-full h-full object-contain filter drop-shadow-2xl opacity-95 pointer-events-none select-none"
                />

                {/* Wishes as Ornaments */}
                <div className="absolute inset-0 z-10">
                    {/* Make children pointer-events-auto */}
                    {wishes.map((wish, index) => {
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

                        // Render Content Variable
                        let content;

                        if (isFirstWish) {
                            // 🌟 THE STAR (First Wish)
                            content = (
                                <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] cursor-move hover:scale-110 transition-transform">
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
                                    <span className="absolute text-yellow-900 font-bold text-xs pointer-events-none select-none">{wish.nickname.charAt(0).toUpperCase()}</span>
                                </div>
                            );
                        } else {
                            // 🎄 6 DISTINCT ORNAMENTS (VIVID CLOLORS)
                            const styles = [
                                'bg-gradient-to-br from-red-600 to-red-800 shadow-[0_0_15px_rgba(220,38,38,0.8)] border-red-400',       // 1. Vibrant Red
                                'bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_15px_rgba(59,130,246,0.8)] border-blue-400',    // 2. Electric Blue
                                'bg-gradient-to-br from-purple-500 to-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.8)] border-purple-400', // 3. Deep Purple
                                'bg-gradient-to-br from-green-500 to-emerald-700 shadow-[0_0_15px_rgba(34,197,94,0.8)] border-green-400', // 4. Bright Green
                                'bg-gradient-to-br from-pink-500 to-rose-700 shadow-[0_0_15px_rgba(236,72,153,0.8)] border-pink-400',     // 5. Hot Pink
                                'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-[0_0_15px_rgba(245,158,11,0.8)] border-yellow-300' // 6. Rich Gold
                            ];
                            const safeIndex = Math.abs(ornamentTypeIndex) % 6;
                            const styleClass = styles[safeIndex];

                            content = (
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${styleClass} shadow-lg border-2 flex items-center justify-center cursor-move hover:scale-125 transition-transform duration-300`}>
                                    <div className="absolute top-1 right-2 w-2 h-2 bg-white/60 rounded-full blur-[0.5px]"></div>
                                    <span className="text-[12px] font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-white select-none">{wish.nickname.charAt(0).toUpperCase()}</span>
                                    <div className="absolute -top-4 w-[1px] h-4 bg-yellow-100/50 pointer-events-none"></div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={wish.id}
                                className="absolute z-20"
                                style={{
                                    left: `${wish.position?.x}%`,
                                    top: `${wish.position?.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    cursor: draggingId === wish.id ? 'grabbing' : 'grab',
                                    userSelect: 'none',
                                    touchAction: 'none' // Important for touch drag
                                }}
                                onMouseDown={(e) => handleDragStart(e, wish.id)}
                                onTouchStart={(e) => handleDragStart(e, wish.id)}
                            >
                                <div onClick={() => handleClick(wish.id)}>
                                    {content}
                                </div>

                                {/* Popover */}
                                {selectedWishId === wish.id && !draggingId && (
                                    <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-64 bg-white text-slate-900 p-4 rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-200 origin-bottom border-2 border-yellow-400/50 cursor-auto"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                    >
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
                                                🗑️
                                            </button>
                                        </div>

                                        <p className="text-sm font-medium leading-relaxed text-gray-600 italic">
                                            "{wish.message}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
};

export default WishingTree;
