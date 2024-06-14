export const capitalize = (s: string) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export const formatNumber = (n: number) => {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const truncate = (s: string, n: number = 10) => {
    return s.length > n ? s.substring(0, n - 1) + '...' : s;
};
