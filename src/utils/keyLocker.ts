import Locker from './locker';

interface LockerHolder {
    locker: Locker;
    dirt: number;
}

class KeyLocker<K> {
    private readonly lockers = new Map<K, LockerHolder>();

    public async use<T>(key: K, user: (locker: Locker) => Promise<T>): Promise<T> {
        const holder = this.lockers.get(key);

        if (holder) {
            return this.doUse(key, holder, user);
        }

        const newHolder: LockerHolder = { locker: new Locker(), dirt: 1 };
        this.lockers.set(key, newHolder);

        return this.doUse(key, newHolder, user);
    }

    private async doUse<T>(key: K, holder: LockerHolder, user: (locker: Locker) => Promise<T>): Promise<T> {
        // eslint-disable-next-line no-param-reassign
        ++holder.dirt;

        try {
            return await user(holder.locker);
        } finally {
            // eslint-disable-next-line no-param-reassign
            --holder.dirt;

            if (holder.dirt === 0) {
                this.lockers.delete(key);
            }
        }
    }
}

export default KeyLocker;
