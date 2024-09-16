export const isSimpleLayout = (sectionLayout) => {
    return sectionLayout === 'simple';
};

export const isSummaryView = (identifiers) => {
    return identifiers && identifiers.run.totalCount === -1;
};

export const shouldDisableFigureView = (identifiers, sectionKey = '') => {
    if (!identifiers) {
        return true;
    }
    return identifiers?.run?.totalCount > 400000;
};
