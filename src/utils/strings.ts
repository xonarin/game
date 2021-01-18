export const addLeadingZeros = (number: number) => {
    return `0${number}`.slice(-2);
};

export const transformDateToTime = (dateString: string): string => {
    const date = new Date(dateString);
    return `${addLeadingZeros(date.getHours())}:${addLeadingZeros(date.getMinutes())}`;
};

export const cutNumberForHuman = (a: number, extraDigits: number = 2) => {
    if (a >= 1000000) {
        return `${Number((a / 1000000).toFixed(extraDigits))}M`;
    }

    if (a >= 1000) {
        return `${Number((a / 1000).toFixed(extraDigits))}K`;
    }

    return Number(a.toFixed(extraDigits));
};
