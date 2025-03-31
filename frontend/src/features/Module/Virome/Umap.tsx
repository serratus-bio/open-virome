import React from 'react'
import { useSelector } from 'react-redux';
import { selectAllFilters } from '../../Query/slice.ts'
import { useLazyGetUmapResultsQuery } from '../../../api/client.ts';

const Umap = ({ identifiers, virusFamilies }) => {
    const selectedFilters = useSelector(selectAllFilters)
    console.log("selectedFilters", selectedFilters)

    const [getUmapResults, { data: umapData, isFetching: isFetchingUmapResults, error: errorUmap }] =
            useLazyGetUmapResultsQuery(
                { filters: selectedFilters, identifiers, virusFamilies },
            );
    
    console.log("umapData", umapData)
    // console.log("isFetchingUmapResults", isFetchingUmapResults)
    // console.log("errorUmap", errorUmap)

  return (
    <div>Umap</div>
  )
}

export default Umap