import crypto from 'crypto';
import { range } from 'lodash';

export const md5Hash = (data: string): string => {
    return crypto
        .createHash('md5')
        .update(data)
        .digest('hex');
};

export const sha256Hash = (data: string): string => {
    return crypto
        .createHash('sha256')
        .update(data)
        .digest('hex');
};

export const hmacSha256Hash = (key: string, data: string): string => {
    return crypto
        .createHmac('sha256', key)
        .update(data)
        .digest('hex');
};

export const hmacSha512Bytes = (key: string, data: string): Uint8Array => {
    const buffer = crypto
        .createHmac('sha512', key)
        .update(data)
        .digest();

    return new Uint8Array(buffer);
};

export const generateRandomNumber = (bytes: Uint8Array): number => {
    if (bytes.length !== 8) {
        throw new RangeError('The array must have exact 8 integers');
    }

    return bytes.reduce((acc, byte, idx) => acc + byte / 256 ** (idx + 1), 0);
};

export const generateRandomNumbers = (
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    count: number,
): number[] => {
    let bytes = hmacSha512Bytes(serverSeed, `${clientSeed}:${nonce}:0`);

    return range(count).map(index => {
        if (index !== 0 && index % 8 === 0) {
            bytes = hmacSha512Bytes(serverSeed, `${clientSeed}:${nonce}:${index / 8}`);
        }

        const offset = (index % 8) * 8;
        return generateRandomNumber(bytes.subarray(offset, offset + 8));
    });
};

const generateRandomHexString = (size: number) => {
    return new Array(size)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('');
};

export const generateSeed = (): string => {
    return generateRandomHexString(64);
};
