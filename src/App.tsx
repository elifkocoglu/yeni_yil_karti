import Fireworks from './components/Fireworks';
import Snowfall from './components/Snowfall';
import Greeting from './components/Greeting';
import MusicPlayer from './components/MusicPlayer';
import WishingTree from './components/WishingTree';
import ClipStudio from './components/ClipStudio';

function App() {
    return (
        <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-slate-900 pb-20">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155] pointer-events-none -z-10"></div>
            {/* Snow Overlay Image (Optional, lighter opacity) */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1542601098-8fc114e148e2?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none -z-10 bg-fixed"></div>

            <Snowfall />
            <Fireworks />

            <MusicPlayer />

            {/* Main Content */}
            <Greeting />

            {/* Scroll Down Indicator */}
            <div className="absolute bottom-10 left-0 right-0 text-white/50 text-center animate-bounce pointer-events-none">
                <p className="text-sm uppercase tracking-widest mb-2">Sürprizler Aşağıda</p>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </div>

            {/* Wishing Tree Section */}
            <div id="wishing-tree" className="relative z-20 container mx-auto mb-20 px-4 pt-20 border-t border-white/10 mt-20 bg-slate-900/50 backdrop-blur-sm rounded-3xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-script text-white mb-4">Dilek Ağacı</h2>
                    <p className="text-blue-200">2026 için güzel dileklerini buraya as 🎄</p>
                </div>
                <WishingTree />
            </div>

            {/* Video Clip Studio */}
            <div className="relative z-20 container mx-auto mb-20 px-4">
                <ClipStudio />
            </div>

            {/* Footer/Signature */}
            <div className="relative bottom-4 text-center z-20 text-white/30 text-xs uppercase tracking-widest py-8">
                Designed for You
            </div>
        </div>
    )
}

export default App
