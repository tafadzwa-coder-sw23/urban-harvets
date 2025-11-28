import React from 'react';
import { Plot, CropType, GrowthStage } from '../types';
import { CROPS } from '../constants';

interface FarmGridProps {
  plots: Plot[];
  onSelectPlot: (plotId: number) => void;
  selectedPlotId: number | null;
}

const FarmGrid: React.FC<FarmGridProps> = ({ plots, onSelectPlot, selectedPlotId }) => {
  
  const getGrowthIcon = (plot: Plot) => {
    if (plot.crop === CropType.EMPTY) return '';
    if (plot.growthStage === GrowthStage.WITHERED) return '🥀';
    if (plot.growthStage === GrowthStage.SEED) return '🌱';
    if (plot.growthStage === GrowthStage.SPROUT) return '🌿';
    
    // Mature or Growing uses the crop icon, maybe smaller if growing
    return CROPS[plot.crop].icon;
  };

  const getStatusColor = (plot: Plot) => {
    if (plot.crop === CropType.EMPTY) return 'bg-stone-200 border-stone-300';
    if (plot.growthStage === GrowthStage.WITHERED) return 'bg-amber-100 border-amber-300';
    if (plot.waterLevel < 30) return 'bg-orange-100 border-orange-300'; // Dry
    if (plot.growthStage === GrowthStage.MATURE) return 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400';
    return 'bg-stone-100 border-stone-300';
  };

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 bg-stone-50 rounded-xl shadow-inner max-w-md mx-auto">
      {plots.map((plot) => (
        <button
          key={plot.id}
          onClick={() => onSelectPlot(plot.id)}
          className={`
            relative aspect-square rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center
            ${getStatusColor(plot)}
            ${selectedPlotId === plot.id ? 'scale-95 ring-4 ring-blue-400 z-10' : 'hover:scale-105 hover:shadow-md'}
          `}
        >
          {/* Water Indicator */}
          {plot.crop !== CropType.EMPTY && plot.growthStage !== GrowthStage.WITHERED && (
             <div className="absolute top-1 right-1">
                {plot.waterLevel < 30 && <i className="fas fa-tint text-xs text-orange-500 animate-pulse" />}
             </div>
          )}

          {/* Icon */}
          <span className={`text-4xl md:text-5xl select-none filter drop-shadow-sm ${plot.growthStage === GrowthStage.GROWING ? 'scale-75 opacity-90' : ''}`}>
            {getGrowthIcon(plot)}
          </span>

          {/* Label */}
          <span className="text-xs font-semibold text-stone-600 mt-1 truncate w-full text-center px-1">
            {plot.crop === CropType.EMPTY ? 'Empty' : CROPS[plot.crop].name}
          </span>
          
          {/* Progress Bar (if growing) */}
          {plot.crop !== CropType.EMPTY && plot.growthStage !== GrowthStage.MATURE && plot.growthStage !== GrowthStage.WITHERED && (
             <div className="absolute bottom-2 w-3/4 h-1.5 bg-gray-300 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500" 
                  style={{ width: `${(plot.daysPlanted / CROPS[plot.crop].daysToMature) * 100}%` }}
                />
             </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default FarmGrid;