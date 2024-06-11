import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = 'http://localhost:8000';

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
    tagTypes: ['Filters', 'Ids', 'Results'],
    endpoints: (build) => ({
        getFilters: build.query({
            query: (args) => ({
                url: 'filters',
                method: 'POST',
                body: args,
            }),
            // providesTags: (result) => (result ? result.map((obj) => ({ type: 'Count', ...obj })) : []),
        }),
        getIds: build.query({
            query: (args) => ({
                url: 'ids',
                method: 'POST',
                body: args,
            }),
            // providesTags: (result) => (result ? result.map((obj) => ({ type: 'Run', ...obj })) : []),
        }),
        getResult: build.query({
            query: (args) => ({
                url: 'results',
                method: 'POST',
                body: args,
            }),
            // providesTags: (result) => (result ? result.map((obj) => ({ type: 'Result', ...obj })) : []),
        }),
    }),
});

export const { useGetFiltersQuery, useGetIdsQuery, useGetResultQuery } = apiSlice;
export const { endpoints, reducerPath, reducer, middleware } = apiSlice;
