import { create } from "zustand";

type PresetPickerState = {
  selectedHabitPresetId: string | null;
  selectedGoalPresetId: string | null;
  pickHabitPreset: (presetId: string) => void;
  pickGoalPreset: (presetId: string) => void;
  consumeHabitPreset: () => string | null;
  consumeGoalPreset: () => string | null;
};

export const usePresetPickerStore = create<PresetPickerState>()((set, get) => ({
  selectedHabitPresetId: null,
  selectedGoalPresetId: null,
  pickHabitPreset: (presetId) => set({ selectedHabitPresetId: presetId }),
  pickGoalPreset: (presetId) => set({ selectedGoalPresetId: presetId }),
  consumeHabitPreset: () => {
    const presetId = get().selectedHabitPresetId;
    set({ selectedHabitPresetId: null });
    return presetId;
  },
  consumeGoalPreset: () => {
    const presetId = get().selectedGoalPresetId;
    set({ selectedGoalPresetId: null });
    return presetId;
  },
}));

