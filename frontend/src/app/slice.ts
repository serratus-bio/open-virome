import { createSlice, createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

/* Reducers */

type AppState = {
    sidebarOpen: boolean;
    activeQueryModule: string;
    sectionLayouts: {
        sra: string;
        palmdb: string;
        ecology: string;
        host: string;
    };
    darkMode: boolean;
};

const appSlice = createSlice({
    name: 'app',
    initialState: {
        sidebarOpen: false,
        activeQueryModule: 'host',
        sectionLayouts: {
            sra: 'simple',
            palmdb: 'advanced',
            ecology: 'simple',
            host: 'simple',
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
        setSectionLayout: (state, action) => {
            const { sectionKey, sectionValue } = action.payload;
            state.sectionLayouts[sectionKey] = sectionValue;
        },
        setActiveQueryModule: (state, action) => {
            state.activeQueryModule = action.payload;
        },
    },
});

export default appSlice.reducer;

/* Actions */

export const { toggleSidebar, toggleDarkMode, setSectionLayout, setActiveQueryModule } = appSlice.actions;

/* Selectors */

export const selectApp = (state: RootState) => state.app;

export const selectSidebarOpen = createSelector([selectApp], (app: AppState) => app.sidebarOpen);
export const selectDarkMode = createSelector([selectApp], (app: AppState) => app.darkMode);
export const selectSectionLayouts = createSelector([selectApp], (app: AppState) => app.sectionLayouts);
export const selectSectionLayoutBySection = createSelector(
    [selectSectionLayouts, (_: RootState, sectionKey: string) => sectionKey],
    (sectionLayouts, sectionKey) => sectionLayouts[sectionKey],
);
export const selectActiveQueryModule = createSelector([selectApp], (app: AppState) => app.activeQueryModule);
