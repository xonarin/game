export const getTime = (time: Date) => {
    const date = time.getDate();
    const month = time.getMonth() + 1;
    const hour = time.getHours();
    const minutes = time.getMinutes();

    return `${date < 10 ? `0${date}` : date}.${month < 10 ? `0${month}` : month}.${time.getFullYear()} в ${
        hour < 10 ? `0${hour}` : hour
    }:${minutes < 10 ? `0${minutes}` : minutes}`;
};
