import { clone } from 'lodash';

class RandomizedPool<T> {
    private readonly initialValues: T[];
    private currentValues: T[];

    constructor(initialValues: T[]) {
        this.initialValues = initialValues;
        this.currentValues = clone(initialValues);
    }

    public reset() {
        this.currentValues = clone(this.initialValues);
    }

    public pop() {
        if (this.currentValues.length === 0) {
            this.reset();
        }

        const randomIdx = Math.floor(Math.random() * this.currentValues.length);
        const randomElement = this.currentValues[randomIdx];

        this.currentValues.splice(randomIdx, 1);

        return randomElement;
    }
}

export default RandomizedPool;
