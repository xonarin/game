import config from '../../config';

/**
 * Источник импорта каталога хранится в настройке catalog::sourceUrl (таблица Setting).
 * Скачивает его сервер plant-admin, поэтому ссылка проверяется здесь — при сохранении
 * и при выдаче воркеру: только https, без логина/пароля и порта, хост из CATALOG_SOURCE_HOSTS.
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

export const CATALOG_SOURCE_SETTING = 'catalog::sourceUrl';

const MAX_URL_LENGTH = 255; // Setting.value — VARCHAR(255)

// ── VALIDATION ────────────────────────────────────────────────────────────────

/** Текст ошибки для админа или null, если ссылка допустима. */
export const checkCatalogSourceUrl = (value: string): string | null => {
    const raw = value.trim();
    if (!raw) {
        return 'Ссылка на источник каталога не может быть пустой';
    }
    if (raw.length > MAX_URL_LENGTH) {
        return `Ссылка длиннее ${MAX_URL_LENGTH} символов`;
    }

    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        return `Не похоже на ссылку: «${raw}»`;
    }

    if (url.protocol !== 'https:') {
        return 'Разрешены только ссылки https://';
    }
    if (url.username || url.password) {
        return 'Ссылка не должна содержать логин или пароль';
    }
    if (url.port) {
        return 'Ссылка не должна содержать порт';
    }

    const allowed = config.catalog.sourceHosts;
    if (!allowed.includes(url.hostname.toLowerCase())) {
        return `Хост «${url.hostname}» не разрешён. Разрешены: ${allowed.join(', ') || '(список пуст)'} — задаются в CATALOG_SOURCE_HOSTS игры`;
    }
    return null;
};
