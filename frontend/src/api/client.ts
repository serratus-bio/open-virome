import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = 'http://localhost:8000';

export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
    tagTypes: ['Counts', 'Results', 'Runs'],
    endpoints: (build) => ({
        getCount: build.query({
            query: (args) => ({
                url: 'counts',
                method: 'POST',
                body: args,
            }),
            providesTags: (result) => (result ? result.map((obj) => ({ type: 'Count', ...obj })) : []),
        }),
        getRuns: build.query({
            query: (args) => ({
                url: 'runs',
                method: 'POST',
                body: args,
            }),
            providesTags: (result) => (result ? result.map((obj) => ({ type: 'Run', ...obj })) : []),
        }),
        getResult: build.query({
            query: (args) => ({
                url: 'results',
                method: 'POST',
                body: args,
            }),
            providesTags: (result) => (result ? result.map((obj) => ({ type: 'Result', ...obj })) : []),
        }),
    }),
});

export const { useGetCountQuery, useGetRunsQuery, useGetResultQuery } = api;
export const { endpoints, reducerPath, reducer, middleware } = api;
