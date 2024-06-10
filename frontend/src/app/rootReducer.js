import { combineReducers } from '@reduxjs/toolkit';
import { reducerPath as apiReducerPath, reducer as apiReducer } from '../api/client.ts';
import appSlice from './slice.ts';
import filtersSlice from '../features/Query/slice.ts';

const rootReducer = combineReducers({
    app: appSlice,
    filters: filtersSlice,
    [apiReducerPath]: apiReducer,
});

export default rootReducer;
