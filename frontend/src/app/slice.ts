import { createSlice, createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

/* Reducers */

type AppState = {
    sidebarOpen: boolean;
    activeQueryModule: string;
    activeModules: {
        sra: string;
        palmdb: string;
        context: string;
    };
    darkMode: boolean;
};

const appSlice = createSlice({
    name: 'app',
    initialState: {
        sidebarOpen: false,
        activeQueryModule: 'host',
        activeModules: {
            sra: 'host',
            palmdb: 'species',
            context: 'geography',
        },
        darkMode: true,
    },
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        toggleDarkMode: (state) => {
            state.darkMode = !state.darkMode;
        },
        setActiveModule: (state, action) => {
            const { sectionKey, moduleKey } = action.payload;
            state.activeModules[sectionKey] = moduleKey;
        },
        setActiveQueryModule: (state, action) => {
            state.activeQueryModule = action.payload;
        },
    },
});

export default appSlice.reducer;

/* Actions */

export const { toggleSidebar, toggleDarkMode, setActiveModule, setActiveQueryModule } = appSlice.actions;

/* Selectors */

export const selectApp = (state: RootState) => state.app;

export const selectSidebarOpen = createSelector([selectApp], (app: AppState) => app.sidebarOpen);
export const selectDarkMode = createSelector([selectApp], (app: AppState) => app.darkMode);
export const selectActiveModules = createSelector([selectApp], (app: AppState) => app.activeModules);
export const selectActiveModuleBySection = createSelector(
    [selectActiveModules, (_: RootState, sectionKey: string) => sectionKey],
    (activeModules, sectionKey) => activeModules[sectionKey],
);
export const selectActiveQueryModule = createSelector([selectApp], (app: AppState) => app.activeQueryModule);
