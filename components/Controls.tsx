import React from 'react';
import { CropType, Plot, GrowthStage } from '../types';
import { CROPS } from '../constants';

interface ControlsProps {
  selectedPlot: Plot | null;
  onPlant: (crop: CropType) => void;
  onWater: () => void;
  onHarvest: () => void;
  onRemove: () => void;
}

const Controls: React.FC<ControlsProps> = ({ selectedPlot, onPlant, onWater, onHarvest, onRemove }) => {
  if (!selectedPlot) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm text-center text-stone-500 h-full flex items-center justify-center">
        <p>Select a plot to begin farming</p>
      </div>
    );
  }

  const isPlanted = selectedPlot.crop !== CropType.EMPTY;
  const isMature = selectedPlot.growthStage === GrowthStage.MATURE;
  const isWithered = selectedPlot.growthStage === GrowthStage.WITHERED;

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-stone-100 flex flex-col gap-4 h-full animate-fade-in">
      <div className="border-b pb-2">
        <h3 className="font-bold text-lg text-stone-800">
            {isPlanted ? CROPS[selectedPlot.crop].name : "Empty Plot"}
        </h3>
        {isPlanted && (
           <p className="text-sm text-stone-500">
             Status: {GrowthStage[selectedPlot.growthStage]} | Water: {selectedPlot.waterLevel}%
           </p>
        )}
      </div>

      {!isPlanted && (
        <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-60 pr-1">
          {Object.values(CROPS).filter(c => c.type !== CropType.EMPTY).map((crop) => (
            <button
              key={crop.type}
              onClick={() => onPlant(crop.type)}
              className="flex items-center gap-2 p-2 border rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left group"
            >
              <span className="text-2xl">{crop.icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold group-hover:text-green-700">{crop.name}</span>
                <span className="text-[10px] text-stone-400">{crop.daysToMature} days</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isPlanted && !isWithered && (
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button
            onClick={onWater}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-blue-200 shadow-lg active:scale-95"
          >
            <i className="fas fa-water"></i> Water
          </button>
          
          <button
            onClick={onHarvest}
            disabled={!isMature}
            className={`
              flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors shadow-lg active:scale-95
              ${isMature ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}
            `}
          >
            <i className="fas fa-sickle"></i> Harvest
          </button>
        </div>
      )}

      {(isWithered || (isPlanted && !isMature)) && (
          <button 
            onClick={onRemove}
            className="mt-2 text-xs text-red-400 hover:text-red-600 underline text-center w-full"
          >
            Clear Plot
          </button>
      )}
    </div>
  );
};

export default Controls;