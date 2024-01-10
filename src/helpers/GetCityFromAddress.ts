export const GetCityFromAddress = (address = '') => {
    const parts = address.split(', ');
    return parts.length > 2 ? parts[2] : '';
};
