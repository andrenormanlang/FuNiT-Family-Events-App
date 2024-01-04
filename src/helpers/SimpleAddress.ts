export const simpleAddress = (address: string) => {
    if (!address) return '';

    // Split the address by commas
    const parts = address.split(',');

    // Assuming the street is always the third part and the city is the fourth
    const street = parts[2]?.trim();
    const city = parts[1]?.trim();

    return `${street}, ${city}`;
};
