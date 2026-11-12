import { SyncErrorCode, SyncErrorResponse } from '../../interfaces/catalogSync';

/** Ошибка API синхронизации: HTTP-статус + код из контракта. */
export class SyncError extends Error {
    public readonly status: number;
    public readonly code: SyncErrorCode;
    public readonly details?: string[];

    constructor(status: number, code: SyncErrorCode, message: string, details?: string[]) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }

    public toResponse(): SyncErrorResponse {
        return { code: this.code, error: this.message, ...(this.details ? { details: this.details } : {}) };
    }
}
