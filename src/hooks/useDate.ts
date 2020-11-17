import { useEffect } from 'react';

import useRefState from './useRefState';

export interface EqualityFunction {
    (oldDate: Date, newDate: Date): boolean;
}

export const dateTimeEquals: EqualityFunction = (oldDate, newDate) => oldDate.getTime() === newDate.getTime();

export const onlyDateEquals: EqualityFunction = (oldDate, newDate) => {
    return (
        oldDate.getFullYear() === newDate.getFullYear() &&
        oldDate.getMonth() === newDate.getMonth() &&
        oldDate.getDate() === newDate.getDate()
    );
};

export const useDate = (interval: number = 1000, isEquals?: EqualityFunction) => {
    const [currentDate, setCurrentDate, currentDateRef] = useRefState(new Date());

    useEffect(() => {
        const taskId = setInterval(() => {
            const newDate = new Date();

            if (!isEquals || !isEquals(currentDateRef.current, newDate)) {
                setCurrentDate(newDate);
            }
        }, interval);

        return () => clearInterval(taskId);
    }, [currentDateRef, isEquals, interval, setCurrentDate]);

    return currentDate;
};
