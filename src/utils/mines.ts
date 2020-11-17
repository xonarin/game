import { range } from 'lodash';
import { combinations } from 'mathjs';

export const FIELD_SIZE = 25;
export const PROFIT_PERCENT = -0.05;
export const MIN_BOMBS_COUNT = 2;

let minesCoefsCache: number[][] | null = null;

export const generateMinesCoef = (
    fieldSize: number,
    bombsCount: number,
    step: number,
    profitPercent: number,
): number => {
    const coef = ((1 + profitPercent) * combinations(fieldSize, step)) / combinations(fieldSize - bombsCount, step);
    return Math.floor(coef * 100) / 100;
};

export const generateMinesCoefs = (): number[][] => {
    minesCoefsCache = range(MIN_BOMBS_COUNT, FIELD_SIZE).map(bombsCount =>
        range(1, FIELD_SIZE - bombsCount + 1).map(step =>
            generateMinesCoef(FIELD_SIZE, bombsCount, step, PROFIT_PERCENT),
        ),
    );

    return minesCoefsCache;
};

export const getMinesCoefs = ((bombsCount?: number): number[][] | number[] => {
    if (minesCoefsCache === null) {
        minesCoefsCache = generateMinesCoefs();
    }

    return bombsCount === undefined ? minesCoefsCache : minesCoefsCache[bombsCount - MIN_BOMBS_COUNT];
}) as {
    (): number[][];
    (bombsCount: number): number[];
};

export const getMinesCoef = (bombsCount: number, step: number): number => {
    if (minesCoefsCache === null) {
        minesCoefsCache = generateMinesCoefs();
    }

    return minesCoefsCache[bombsCount - MIN_BOMBS_COUNT][step - 1];
};
