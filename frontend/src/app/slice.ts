import { createSlice, createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

/* Reducers */

type AppState = {
    sidebarOpen: boolean;
    activeView: string;
    activeModule: string;
    darkMode: boolean;
};

const appSlice = createSlice({
    name: 'app',
    initialState: {
        sidebarOpen: true,
        activeView: 'query',
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
        setActiveView: (state, action) => {
            state.activeView = action.payload;
        },
        setActiveModule: (state, action) => {
            state.activeModule = action.payload;
        },
    },
});

export default appSlice.reducer;

/* Actions */

export const { toggleSidebar, toggleDarkMode, setActiveView, setActiveModule } = appSlice.actions;

/* Selectors */

export const selectApp = (state: RootState) => state.app;

export const selectSidebarOpen = createSelector([selectApp], (app: AppState) => app.sidebarOpen);
export const selectDarkMode = createSelector([selectApp], (app: AppState) => app.darkMode);
export const selectActiveView = createSelector([selectApp], (app: AppState) => app.activeView);
export const selectActiveModule = createSelector([selectApp], (app: AppState) => app.activeModule);
