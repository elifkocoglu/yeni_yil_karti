import Fireworks from './components/Fireworks';
import Snowfall from './components/Snowfall';
import Greeting from './components/Greeting';
import MusicPlayer from './components/MusicPlayer';
import WishingTree from './components/WishingTree';
import ClipStudio from './components/ClipStudio';

function App() {
    return (
        <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-gradient-to-b from-gray-900 via-purple-900 to-black pb-20">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20 pointer-events-none"></div>

            <Snowfall />
            <Fireworks />

            <MusicPlayer />

            {/* Main Content */}
            <Greeting />

            {/* Wishing Tree Section */}
            <div className="relative z-20 container mx-auto mb-20 px-4">
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
