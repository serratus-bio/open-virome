import { moduleConfig } from '../../features/Explore/constants.ts';

export const getFilterQuery = ({ filters, excludeType = '' }) => {
    return filters
        .filter((filter) => filter.filterType !== excludeType)
        .map((filter) => ({
            filterType: moduleConfig[filter.filterType].groupByKey,
            filterValue: filter.filterValue,
        }));
};

export const handleIdKeyIrregularities = (idKey) => {
    if (['run', 'run_id'].includes(idKey)) {
        return 'run';
    }
    if (['bioproject', 'bioproject_id'].includes(idKey)) {
        return 'bioproject';
    }
    if (['biosample', 'biosample_id'].includes(idKey)) {
        return 'biosample';
    }
    return idKey;
};
