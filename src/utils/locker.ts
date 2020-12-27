class Locker {
    private pendingCount: number = 0;
    private resolvesQueue: Array<() => void> = [];
    private isBlocked: boolean = false;
    private waitAllResolves: Array<() => void> = [];

    public async lock(): Promise<void> {
        if (this.isBlocked) {
            throw new Error('Queue is blocked');
        }

        ++this.pendingCount;

        return this.pendingCount === 1 ? Promise.resolve() : new Promise(resolve => this.resolvesQueue.push(resolve));
    }

    public unlock(): void {
        --this.pendingCount;

        const resolve = this.resolvesQueue.shift();
        if (resolve) {
            resolve();
        } else {
            this.waitAllResolves.forEach(waitAllResolve => waitAllResolve());
        }
    }

    public async waitAll(withBlock?: boolean): Promise<void> {
        if (withBlock) {
            this.block();
        }

        return this.pendingCount === 0 ? Promise.resolve() : new Promise(resolve => this.waitAllResolves.push(resolve));
    }

    public block(): void {
        this.isBlocked = true;
    }

    public unblock(): void {
        this.isBlocked = false;
    }
}

export default Locker;
