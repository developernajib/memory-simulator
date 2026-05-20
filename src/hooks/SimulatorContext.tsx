// React context wrapping the useSimulator state so any component can read it.
import { createContext, useContext } from 'react';
import type { SimulatorState } from './useSimulator';

export const SimulatorContext = createContext<SimulatorState | null>(null);

export function useSim(): SimulatorState {
  const ctx = useContext(SimulatorContext);
  if (!ctx) throw new Error('useSim must be used within <SimulatorContext.Provider>');
  return ctx;
}
