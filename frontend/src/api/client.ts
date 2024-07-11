import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL =
    (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') && !process.env.REACT_APP_USE_LAMBDA
        ? 'http://localhost:8000/'
        : 'https://zrdbegawce.execute-api.us-east-1.amazonaws.com/prod/';

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: API_URL,
        prepareHeaders: (headers) => {
            headers.set('Accept-Encoding', 'gzip,deflate');
            return headers;
        },
        responseHandler: (response) =>
            response.text().then((text) => {
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Error parsing JSON response', e);
                }
                try {
                    return JSON.parse(atob(text));
                } catch (e) {
                    console.error('Error parsing base64 response', e);
                }
            }),
    }),
    keepUnusedDataFor: 10,
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
