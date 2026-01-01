import Fireworks from './components/Fireworks';
import Snowfall from './components/Snowfall';
import Greeting from './components/Greeting';

function App() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-900 via-purple-900 to-black">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>

            <Snowfall />
            <Fireworks />

            {/* Main Content */}
            <Greeting />

            {/* Footer/Signature */}
            <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                <p className="text-white/30 text-xs uppercase tracking-widest">Designed for You</p>
            </div>
        </div>
    )
}

export default App
