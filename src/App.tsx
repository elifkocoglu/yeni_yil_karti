import Fireworks from './components/Fireworks';
import Snowfall from './components/Snowfall';
import Greeting from './components/Greeting';
import MusicPlayer from './components/MusicPlayer';
import WishingTree from './components/WishingTree';
import ClipStudio from './components/ClipStudio';
import SnowFamily from './components/SnowFamily';

function App() {
    return (
        <div className="relative min-h-screen text-white selection:bg-red-500 selection:text-white">
            {/* Winter Background */}
            <div className="fixed inset-0 bg-gradient-to-b from-[#1e3a8a] via-[#3b82f6] to-[#93c5fd] pointer-events-none -z-20"></div>

            {/* Snowy Landscape & Snow Family */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                {/* Snow ground */}
                <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-white to-blue-100/50 opacity-90 blur-sm rounded-t-[50%_40px]"></div>

                {/* Animated Family */}
                <SnowFamily />
            </div>

            <Snowfall />
            <Fireworks />

            <MusicPlayer />

            {/* Main Content (Full Height Section) */}
            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
                <Greeting />

                {/* Scroll Down Indicator */}
                <div className="absolute bottom-10 animate-bounce text-center">
                    <p className="text-blue-900 font-bold bg-white/50 px-4 py-1 rounded-full backdrop-blur-sm mb-2 shadow-lg">
                        Sürprizler Aşağıda 🎄
                    </p>
                    <div className="w-10 h-16 border-4 border-white rounded-full flex justify-center p-2 bg-black/20 backdrop-blur-sm mx-auto">
                        <div className="w-2 h-4 bg-white rounded-full animate-[bounce_1.5s_infinite]"></div>
                    </div>
                </div>
            </div>

            {/* Wishing Tree Section */}
            <div id="wishing-tree" className="relative z-20 container mx-auto mb-20 px-4 pt-10">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl md:text-5xl font-script text-white drop-shadow-md mb-4">🎄 Dilek Ağacı</h2>
                        <p className="text-blue-100 text-lg">2026 için güzel dileklerini buraya as, herkes okusun!</p>
                    </div>
                    <WishingTree />
                </div>
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
