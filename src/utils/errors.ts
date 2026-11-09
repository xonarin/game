import { randomUUID } from 'crypto';
import { GraphQLError } from 'graphql';

/**
 * Expected business error shown to the user (message is a translation key, see utils/translation).
 * Sent to the client as `extensions.code = 'USER_ERROR'`.
 */
export class UserError extends GraphQLError {
    constructor(message: string, extensions?: Record<string, unknown>) {
        super(message, { extensions: { ...extensions, code: 'USER_ERROR' } });
    }
}

const isError = (err: unknown): err is Error => err instanceof Error;

/**
 * graphql-shield fallback: user errors pass through, anything else is logged with an id
 * and replaced by a generic message so internals don't leak to the client.
 */
export const fallbackError = (err: unknown): Error => {
    if (err === null) {
        return new Error('ERROR');
    }

    if (err instanceof UserError) {
        return err;
    }

    const errId = randomUUID();

    if (isError(err)) {
        console.error(`[${errId}]`, err.stack || err);
    } else {
        console.error(`Extraordinary error: ${errId}`);
        console.error(err);
    }

    return new Error(`Internal Error: ${errId}`);
};
