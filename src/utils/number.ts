/* eslint-disable no-bitwise */
export const countOnes = (number: number): number => {
    let count = 0;
    let temp = number;

    while (temp > 0) {
        if ((temp & 1) === 1) {
            ++count;
        }
        temp >>= 1;
    }

    return count;
};

export default { countOnes };
