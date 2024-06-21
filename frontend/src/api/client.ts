import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL =
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
        ? 'http://localhost:8000/'
        : 'https://l5c6jfyquowvideavvsyaxhkdu0divje.lambda-url.us-east-1.on.aws/';

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: (headers) => {
            headers.set('Accept-Encoding', 'gzip,deflate');
            return headers;
        },
    }),
    tagTypes: ['Counts', 'Identifiers', 'Results'],
    endpoints: (build) => ({
        getCounts: build.query({
            query: (args) => ({
                url: 'counts',
                method: 'POST',
                body: args,
            }),
            providesTags: ['Counts'],
        }),
        getIdentifiers: build.query({
            query: (args) => ({
                url: 'identifiers',
                method: 'POST',
                body: args,
            }),
            providesTags: ['Identifiers'],
        }),
        getResult: build.query({
            query: (args) => ({
                url: 'results',
                method: 'POST',
                body: args,
            }),
            providesTags: ['Results'],
        }),
    }),
});

export const { useGetCountsQuery, useGetIdentifiersQuery, useGetResultQuery } = apiSlice;
export const { endpoints, reducerPath, reducer, middleware } = apiSlice;
