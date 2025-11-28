import { Crop, CropType } from './types';

export const CROPS: Record<CropType, Crop> = {
  [CropType.MAIZE]: {
    type: CropType.MAIZE,
    name: "Maize (Chibage)",
    daysToMature: 10,
    waterNeeds: 6,
    description: "The staple crop of Zimbabwe. Needs good sunlight and regular watering.",
    xpReward: 50,
    icon: "🌽"
  },
  [CropType.TOMATO]: {
    type: CropType.TOMATO,
    name: "Tomato (Madomasi)",
    daysToMature: 7,
    waterNeeds: 8,
    description: "Great for relish. Susceptible to pests, keep leaves dry.",
    xpReward: 35,
    icon: "🍅"
  },
  [CropType.RAPE]: {
    type: CropType.RAPE,
    name: "Rape / Covo",
    daysToMature: 4,
    waterNeeds: 7,
    description: "Fast-growing leafy green, essential for daily meals.",
    xpReward: 20,
    icon: "🥬"
  },
  [CropType.SPINACH]: {
    type: CropType.SPINACH,
    name: "Spinach",
    daysToMature: 5,
    waterNeeds: 9,
    description: "Nutritious and loves nitrogen-rich soil.",
    xpReward: 25,
    icon: "🌿"
  },
  [CropType.ONION]: {
    type: CropType.ONION,
    name: "Onion",
    daysToMature: 8,
    waterNeeds: 4,
    description: "Low maintenance, good for maximizing small spaces.",
    xpReward: 30,
    icon: "🧅"
  },
  [CropType.EMPTY]: {
    type: CropType.EMPTY,
    name: "Empty Plot",
    daysToMature: 0,
    waterNeeds: 0,
    description: "Ready for planting.",
    xpReward: 0,
    icon: "🟫"
  }
};

export const INITIAL_PLOTS_COUNT = 9;
export const XP_PER_LEVEL = 100;