import { RootState } from '../../app/store';
import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';

/* Reducers */

type Filter = {
    filterId: string;
    filterType: string;
    filterValue: string;
};

const filtersAdapter = createEntityAdapter({
    selectId: (filter: Filter) => `${filter.filterType}-${filter.filterValue}`,
    sortComparer: (a, b) => a.filterId.localeCompare(b.filterId),
});

const filtersSlice = createSlice({
    name: 'filters',
    initialState: filtersAdapter.getInitialState(),
    reducers: {
        addFilter: filtersAdapter.addOne,
        removeFilter: filtersAdapter.removeOne,
        removeAllFilters: filtersAdapter.removeAll,
    },
});

export default filtersSlice.reducer;

/* Actions */

export const { addFilter, removeFilter, removeAllFilters } = filtersSlice.actions;

/* Selectors */

export const {
    selectAll: selectAllFilters,
    selectById: selectFilterById,
    selectIds: selectFilterIds,
    selectEntities: selectFilterEntities,
    selectTotal: selectTotalFilters,
} = filtersAdapter.getSelectors((state: RootState) => state.filters);
