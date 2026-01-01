import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

interface Wish {
    id: string;
    nickname: string;
    message: string;
    createdAt: any;
    position: { x: number; y: number };
    color: string; // Random ornament color
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
    const [error, setError] = useState('');

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
                setError("Veritabanı bağlantısı yok. Lütfen Firebase ayarlarını yapın.");
            });
            return () => unsubscribe();
        } catch (err) {
            console.error("Firebase init error", err);
            setError("Firebase kurulu değil veya hatalı.");
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim() || !message.trim()) return;

        try {
            const y = Math.random() * 70 + 15; // 15% to 85% height to stay on branches
            // Triangle width logic: Top is narrow, bottom is wide
            const widthAtY = (y / 100) * 80;
            const x = 50 + (Math.random() - 0.5) * widthAtY;
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
            alert("Dilek gönderilemedi. Veritabanı ayarlarını kontrol edin.");
            console.log(err);
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

            {/* Add Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mb-8 px-10 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full font-bold shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:scale-105 transition-transform animate-pulse border-2 border-white/20"
            >
                ✨ Bir Dilek As 🎄
            </button>

            {/* Modal Form */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-slate-800 border border-white/20 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
                        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                        <h2 className="text-3xl text-white font-script mb-6 text-center">✨ Dilek Zamanı ✨</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-sm text-gray-400 ml-1">Kimin Adına?</label>
                                <input
                                    type="text"
                                    placeholder="Rumuzun..."
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                                    maxLength={20}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 ml-1">Dileğin Nedir?</label>
                                <textarea
                                    placeholder="2026'da olması istediğin şey..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent h-32 transition-all resize-none"
                                    maxLength={140}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl hover:opacity-90 shadow-lg transform active:scale-95 transition-all"
                            >
                                Dileği As! 🎄
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* The Tree Visualization */}
            <div className="relative w-full aspect-[3/4] md:aspect-square max-h-[80vh] flex justify-center">
                {/* Realistic CSS Tree Layers */}
                <div className="absolute top-[5%] w-[10%] h-[20%] bg-gradient-to-b from-green-600 to-green-800 rounded-t-full clip-path-triangle transform translate-y-0 z-10 blur-[1px]"></div>
                <div className="absolute top-[15%] w-[40%] h-[30%] bg-gradient-to-b from-green-700 to-green-900 clip-path-triangle transform translate-y-0 z-0 blur-[1px]"></div>
                <div className="absolute top-[30%] w-[60%] h-[40%] bg-gradient-to-b from-green-800 to-green-950 clip-path-triangle transform translate-y-0 -z-10 blur-[1px]"></div>

                {/* SVG Tree Placeholder for structure if CSS fails visual test - using a nice gradient Triangle stack manually */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-[10%] drop-shadow-2xl">
                    <div className="w-0 h-0 border-l-[150px] md:border-l-[250px] border-r-[150px] md:border-r-[250px] border-b-[500px] md:border-b-[600px] border-l-transparent border-r-transparent border-b-green-900/80 filter drop-shadow-[0_0_20px_rgba(22,101,52,0.5)]"></div>
                    {/* Trunk */}
                    <div className="w-16 h-24 bg-[#3E2723] -mt-4 rounded-b-lg"></div>
                </div>

                {error && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-300 bg-black/80 p-4 rounded-xl text-center border border-red-500/50 z-50">{error}</div>}

                {wishes.map((wish) => (
                    <div
                        key={wish.id}
                        className="absolute z-20"
                        style={{
                            left: `${wish.position?.x || 50}%`,
                            top: `${wish.position?.y || 50}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {/* Ornament Interaction */}
                        <button
                            onClick={() => setSelectedWishId(selectedWishId === wish.id ? null : wish.id)}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br ${wish.color || 'from-yellow-400 to-yellow-600'} shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:scale-125 transition-transform flex items-center justify-center text-[10px] text-white font-bold border border-white/20`}
                        >
                            <div className="w-2 h-2 rounded-full bg-white/50 absolute top-2 right-2 backdrop-blur-sm"></div>
                            {wish.nickname.charAt(0).toUpperCase()}
                        </button>

                        {/* Stable Popup Card */}
                        {selectedWishId === wish.id && (
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-56 bg-white/95 backdrop-blur-xl text-slate-800 p-4 rounded-xl shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-2 border border-white/50">
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45"></div>
                                <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2 border-b border-gray-200 pb-1">
                                    {wish.nickname} diyor ki:
                                </p>
                                <p className="text-sm font-medium leading-relaxed mb-3 text-gray-700">"{wish.message}"</p>
                                <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2">
                                    <span className="text-[10px] text-gray-400">Yeni</span>
                                    <button
                                        className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 font-bold transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(wish.id);
                                        }}
                                    >
                                        Sil 🗑️
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Scroll Hint */}
            <div className="mt-8 text-center text-blue-200 animate-bounce cursor-pointer opacity-70 hover:opacity-100">
                <p className="text-sm uppercase tracking-widest mb-1">Kendi Klibini Yap</p>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </div>

        </div>
    );
};

export default WishingTree;
