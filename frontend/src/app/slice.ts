import { createSlice, createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';
import { sectionConfig } from '../features/Module/constants.ts';

/* Reducers */

type AppState = {
    sidebarOpen: boolean;
    activeModule: string;
    darkMode: boolean;
};

const appSlice = createSlice({
    name: 'app',
    initialState: {
        sidebarOpen: true,
        activeModule: 'host',
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
            state.activeModule = action.payload;
        },
    },
});

export default appSlice.reducer;

/* Actions */

export const { toggleSidebar, toggleDarkMode, setActiveModule } = appSlice.actions;

/* Selectors */

export const selectApp = (state: RootState) => state.app;

export const selectSidebarOpen = createSelector([selectApp], (app: AppState) => app.sidebarOpen);
export const selectDarkMode = createSelector([selectApp], (app: AppState) => app.darkMode);
export const selectActiveModule = createSelector([selectApp], (app: AppState) => app.activeModule);
export const selectActiveSection = createSelector([selectActiveModule], (activeModule) =>
    Object.keys(sectionConfig).find((section) => sectionConfig[section].modules.includes(activeModule)),
);
