import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';

interface Wish {
    id: string;
    nickname: string;
    message: string;
    createdAt: any;
    position: { x: number; y: number }; // Random position on the tree
}

const WishingTree: React.FC = () => {
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [nickname, setNickname] = useState('');
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
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
            // Random position roughly within a triangle shape
            // Top of tree is roughly 50% width, 10% height
            // Bottom is 10%-90% width, 90% height
            const y = Math.random() * 80 + 10; // 10% to 90% height
            const widthAtY = (y / 100) * 80; // approximate width at this height
            const x = 50 + (Math.random() - 0.5) * widthAtY;

            await addDoc(collection(db, 'wishes'), {
                nickname,
                message,
                createdAt: serverTimestamp(),
                position: { x, y }
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
            } catch (err) {
                console.error("Error removing document: ", err);
            }
        }
    };

    return (
        <div className="z-30 relative mt-16 flex flex-col items-center w-full max-w-4xl mx-auto p-4">
            {/* Search/Add Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mb-8 px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform animate-bounce"
            >
                ✨ Bir Dilek Tut ✨
            </button>

            {/* Modal / Form */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 border border-white/20 p-6 rounded-2xl w-full max-w-md">
                        <h2 className="text-2xl text-white font-script mb-4">Yeni Yıl Dileği</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Adın / Rumuzun"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                maxLength={20}
                            />
                            <textarea
                                placeholder="Dileğin ne?"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 h-32"
                                maxLength={140}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:opacity-90"
                                >
                                    As! 🎄
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* The Tree Visualization */}
            <div className="relative w-full aspect-[3/4] md:aspect-square max-h-[80vh] bg-green-900/10 backdrop-blur-[2px] rounded-[50%] border-2 border-white/5 overflow-hidden">
                {/* Simple CSS Tree Background */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[150px] border-r-[150px] border-b-[500px] border-l-transparent border-r-transparent border-b-green-800/30 blur-xl"></div>

                {error && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-400 bg-black/50 p-4 rounded text-center">{error}</div>}

                {wishes.map((wish) => (
                    <div
                        key={wish.id}
                        className="absolute group cursor-pointer"
                        style={{
                            left: `${wish.position?.x || 50}%`,
                            top: `${wish.position?.y || 50}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        {/* Ornament/Card */}
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded-full shadow-[0_0_15px_rgba(253,224,71,0.5)] animate-pulse hover:scale-125 transition-transform flex items-center justify-center text-xs text-black font-bold">
                            {wish.nickname.charAt(0).toUpperCase()}
                        </div>

                        {/* Tooltip Content */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-white text-black p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-sm">
                            <p className="font-bold text-orange-600 mb-1">{wish.nickname}:</p>
                            <p>{wish.message}</p>
                            <button
                                className="mt-2 text-[10px] text-red-500 hover:underline pointer-events-auto"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(wish.id);
                                }}
                            >
                                (Sil)
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishingTree;
