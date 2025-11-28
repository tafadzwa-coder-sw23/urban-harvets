import React, { useState, useEffect } from 'react';
import { GameState, Plot, CropType, GrowthStage } from './types';
import { CROPS, INITIAL_PLOTS_COUNT, XP_PER_LEVEL } from './constants';
import FarmGrid from './components/FarmGrid';
import Controls from './components/Controls';
import AIAdvisor from './components/AIAdvisor';

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>({
    xp: 0,
    level: 1,
    day: 1,
    money: 100 // Zimbabwe Bond/Gold/USD placeholder
  });

  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // --- Initialization ---
  useEffect(() => {
    // Initialize empty plots
    const initialPlots: Plot[] = Array.from({ length: INITIAL_PLOTS_COUNT }, (_, i) => ({
      id: i,
      crop: CropType.EMPTY,
      growthStage: GrowthStage.SEED,
      daysPlanted: 0,
      waterLevel: 0,
      health: 100
    }));
    setPlots(initialPlots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Helpers ---
  const selectedPlot = plots.find(p => p.id === selectedPlotId) || null;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Actions ---
  const handlePlant = (cropType: CropType) => {
    if (!selectedPlot || selectedPlot.crop !== CropType.EMPTY) return;
    
    // Simple cost logic (optional, for now free seeds)
    setPlots(prev => prev.map(p => 
      p.id === selectedPlot.id 
        ? { ...p, crop: cropType, growthStage: GrowthStage.SEED, daysPlanted: 0, waterLevel: 50, health: 100 } 
        : p
    ));
    showNotification(`Planted ${CROPS[cropType].name}!`);
  };

  const handleWater = () => {
    if (!selectedPlot || selectedPlot.crop === CropType.EMPTY) return;

    setPlots(prev => prev.map(p => 
      p.id === selectedPlot.id 
        ? { ...p, waterLevel: Math.min(100, p.waterLevel + 40) } 
        : p
    ));
    showNotification("Watered plant. It looks refreshed!");
  };

  const handleHarvest = () => {
    if (!selectedPlot || selectedPlot.growthStage !== GrowthStage.MATURE) return;

    const crop = CROPS[selectedPlot.crop];
    const xpGain = crop.xpReward;

    setGameState(prev => {
        const newXp = prev.xp + xpGain;
        const leveledUp = Math.floor(newXp / XP_PER_LEVEL) > prev.level;
        if (leveledUp) showNotification("Level Up! You are becoming a master farmer.");
        return {
            ...prev,
            xp: newXp,
            level: Math.floor(newXp / XP_PER_LEVEL) + 1,
            money: prev.money + 15 // Sell value
        };
    });

    setPlots(prev => prev.map(p => 
      p.id === selectedPlot.id 
        ? { ...p, crop: CropType.EMPTY, growthStage: GrowthStage.SEED, daysPlanted: 0, waterLevel: 0 } 
        : p
    ));
    showNotification(`Harvested ${crop.name}! +${xpGain} XP`);
  };

  const handleRemove = () => {
      if (!selectedPlot) return;
      setPlots(prev => prev.map(p => 
        p.id === selectedPlot.id 
          ? { ...p, crop: CropType.EMPTY, growthStage: GrowthStage.SEED, daysPlanted: 0, waterLevel: 0 } 
          : p
      ));
      showNotification("Plot cleared.");
  }

  const handleNextDay = () => {
    setGameState(prev => ({ ...prev, day: prev.day + 1 }));

    setPlots(prev => prev.map(plot => {
      if (plot.crop === CropType.EMPTY) return plot;

      // Logic: Decrease water, Increase growth
      let newWater = Math.max(0, plot.waterLevel - 15); // Evaporation
      let newDaysPlanted = plot.daysPlanted + 1;
      let newStage = plot.growthStage;
      let newHealth = plot.health;

      // Water damage or Drought
      if (newWater === 0) {
        newHealth -= 20;
      }

      // Check Withered
      if (newHealth <= 0) {
          newStage = GrowthStage.WITHERED;
      } else if (newStage !== GrowthStage.MATURE && newStage !== GrowthStage.WITHERED) {
          // Growth Logic
          const cropData = CROPS[plot.crop];
          const progress = newDaysPlanted / cropData.daysToMature;

          if (progress >= 1) newStage = GrowthStage.MATURE;
          else if (progress > 0.5) newStage = GrowthStage.GROWING;
          else if (progress > 0.2) newStage = GrowthStage.SPROUT;
      }

      return {
        ...plot,
        waterLevel: newWater,
        daysPlanted: newDaysPlanted,
        growthStage: newStage,
        health: newHealth
      };
    }));

    showNotification(`Day ${gameState.day + 1} begins. Check your water levels!`);
  };

  // --- Render ---
  return (
    <div className="h-full flex flex-col md:flex-row bg-stone-100 overflow-hidden relative">
      
      {/* Navbar / Header (Mobile Top) */}
      <header className="bg-white p-4 shadow-sm z-20 flex justify-between items-center md:hidden">
         <div className="flex items-center gap-2">
            <span className="text-2xl">🚜</span>
            <h1 className="font-bold text-stone-800">UrbanHarvest</h1>
         </div>
         <div className="flex items-center gap-3 text-sm font-semibold text-stone-600">
             <span>Lvl {gameState.level}</span>
             <span>🗓 Day {gameState.day}</span>
         </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
             <div className="absolute top-10 left-10 text-9xl">🇿🇼</div>
             <div className="absolute bottom-20 right-20 text-9xl">🏙️</div>
         </div>

         {/* Top HUD (Desktop) */}
         <div className="hidden md:flex justify-between items-center p-6 pb-2 z-10">
             <div>
                 <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                    <span className="text-3xl">🇿🇼</span> UrbanHarvest Zimbabwe
                 </h1>
                 <p className="text-stone-500">Your virtual rooftop garden in Harare</p>
             </div>
             <div className="flex gap-6 bg-white px-6 py-3 rounded-full shadow-sm border border-stone-200">
                 <div className="flex flex-col items-center">
                    <span className="text-xs text-stone-400 uppercase font-bold">Level</span>
                    <span className="text-xl font-bold text-emerald-600">{gameState.level}</span>
                 </div>
                 <div className="w-px bg-stone-200"></div>
                 <div className="flex flex-col items-center">
                    <span className="text-xs text-stone-400 uppercase font-bold">XP</span>
                    <span className="text-xl font-bold text-blue-600">{gameState.xp}</span>
                 </div>
                 <div className="w-px bg-stone-200"></div>
                 <div className="flex flex-col items-center">
                    <span className="text-xs text-stone-400 uppercase font-bold">Day</span>
                    <span className="text-xl font-bold text-amber-600">{gameState.day}</span>
                 </div>
             </div>
         </div>

         {/* Grid Container */}
         <div className="flex-1 overflow-y-auto p-4 md:p-6 z-10 flex items-center justify-center">
             <div className="w-full max-w-2xl">
                 <FarmGrid 
                   plots={plots} 
                   onSelectPlot={setSelectedPlotId} 
                   selectedPlotId={selectedPlotId} 
                 />
                 
                 {/* Mobile Quick Actions (if needed) or Status Text */}
                 <div className="mt-4 text-center md:hidden">
                    <p className="text-sm text-stone-500 italic">Tap a plot to manage it</p>
                 </div>
             </div>
         </div>

         {/* Bottom Action Bar (Mobile Only - simplified) */}
         <div className="md:hidden p-4 bg-white border-t border-stone-200 z-20 flex gap-2">
            <button 
                onClick={handleNextDay}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-bold shadow-md active:scale-95"
            >
                Sleep (Next Day)
            </button>
            <button 
                onClick={() => setIsAIAdvisorOpen(true)}
                className="aspect-square bg-emerald-600 text-white rounded-xl shadow-md flex items-center justify-center text-xl"
            >
                <i className="fas fa-robot"></i>
            </button>
         </div>
      </main>

      {/* Sidebar Controls (Desktop) */}
      <aside className="hidden md:flex flex-col w-80 bg-white border-l border-stone-200 z-20 p-6 shadow-xl">
         <div className="mb-6">
            <button 
                onClick={handleNextDay}
                className="w-full bg-amber-100 hover:bg-amber-200 text-amber-800 py-3 rounded-xl font-bold border border-amber-300 transition-colors flex items-center justify-center gap-2"
            >
                <i className="fas fa-moon"></i> End Day
            </button>
         </div>
         
         <div className="flex-1 overflow-hidden">
             <Controls 
                selectedPlot={selectedPlot}
                onPlant={handlePlant}
                onWater={handleWater}
                onHarvest={handleHarvest}
                onRemove={handleRemove}
             />
         </div>

         <div className="mt-6">
            <button 
                onClick={() => setIsAIAdvisorOpen(true)}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
                <i className="fas fa-comment-dots"></i> Ask AgriBot
            </button>
         </div>
      </aside>

      {/* Mobile Controls Drawer (Replaces Sidebar on Mobile when plot selected) */}
      {selectedPlotId !== null && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50 flex items-end" onClick={(e) => { if(e.target === e.currentTarget) setSelectedPlotId(null); }}>
           <div className="bg-white w-full rounded-t-2xl p-4 animate-slide-up max-h-[70vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lg">Manage Plot #{selectedPlotId + 1}</h3>
                   <button onClick={() => setSelectedPlotId(null)} className="p-2 bg-stone-100 rounded-full"><i className="fas fa-times"></i></button>
               </div>
               <Controls 
                selectedPlot={selectedPlot}
                onPlant={(c) => { handlePlant(c); setSelectedPlotId(null); }}
                onWater={() => { handleWater(); setSelectedPlotId(null); }}
                onHarvest={() => { handleHarvest(); setSelectedPlotId(null); }}
                onRemove={() => { handleRemove(); setSelectedPlotId(null); }}
               />
           </div>
        </div>
      )}

      {/* AI Advisor Modal */}
      <AIAdvisor isOpen={isAIAdvisorOpen} onClose={() => setIsAIAdvisorOpen(false)} />

      {/* Notifications */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-stone-800/90 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-fade-in text-sm font-medium backdrop-blur-sm">
            {notification}
        </div>
      )}

    </div>
  );
};

export default App;