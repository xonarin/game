import 'ioredis';

declare module 'ioredis' {
    interface Commands {
        gqlslIncr: (key: string, points: number, duration: number) => Promise<[number, number]>;
    }
}
