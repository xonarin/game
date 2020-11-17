export const addLeadingZeros = (number: number) => {
    return `0${number}`.slice(-2);
};

export const transformDateToTime = (dateString: string): string => {
    const date = new Date(dateString);
    return `${addLeadingZeros(date.getHours())}:${addLeadingZeros(date.getMinutes())}`;
};
