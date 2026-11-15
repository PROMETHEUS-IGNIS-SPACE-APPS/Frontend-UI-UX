import { create } from 'zustand';

import type { AppModuleId } from '@/types/domain/module';

export type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'prometheus-ignis-theme';

function readStoredTheme(): ThemeMode {
  try {
    return globalThis.localStorage?.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Estado global de interfaz compartido entre módulos.
 * Reglas repo: aquí NO vive estado remoto (ese es de TanStack Query) ni
 * estado efímero local de un componente.
 */
interface UiState {
  /** Pestaña activa de la sesión (navegación sin router, v1). */
  activeModule: AppModuleId;
  setActiveModule: (moduleId: AppModuleId) => void;
  /** Tema visual; el oscuro es la identidad predeterminada. */
  theme: ThemeMode;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  activeModule: 'explorer',
  setActiveModule: (moduleId) => set({ activeModule: moduleId }),
  theme: readStoredTheme(),
  toggleTheme: () => set((state) => {
    const theme: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
    try { globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme); } catch { /* el tema sigue funcionando sin almacenamiento */ }
    return { theme };
  }),
}));
