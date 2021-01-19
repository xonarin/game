type TranslationCode =
    | 'ERROR_TITLE'
    | 'SUCCESS_TITLE'
    | 'NOT_AUTH'
    | 'NOT_ADMIN_OR_MODERATOR'
    | 'FREQUENT_REQUESTS'
    | 'NOT_ENOUGH_MONEY'
    | 'CHAT_BANNED'
    | 'INVALID_MESSAGE_REQUIRED'
    | 'INVALID_MESSAGE_MIN'
    | 'INVALID_MESSAGE_MAX'
    | 'INVALID_MESSAGE_MATCHES'
    | 'CLASSIC_GAME_MIN_BET_PRICE_ERROR'
    | 'CLASSIC_GAME_IN_PROGRESS_ERROR'
    | 'CLASSIC_GAME_ENDED_ERROR'
    | 'INVALID_AMOUNT_REQUIRED'
    | 'INVALID_AMOUNT_MORE_THAN';

interface Translation {
    ru: string;
}

const translations: Record<TranslationCode, Translation> = {
    // Common
    ERROR_TITLE: {
        ru: 'Ошибка',
    },

    SUCCESS_TITLE: {
        ru: 'Успех',
    },

    // Common errors
    NOT_AUTH: {
        ru: 'Вы не аутентифицированы',
    },
    NOT_ADMIN_OR_MODERATOR: {
        ru: 'У вас нет прав',
    },
    FREQUENT_REQUESTS: {
        ru: 'Подождите несколько секунд',
    },
    NOT_ENOUGH_MONEY: {
        ru: 'Недостаточно средств',
    },

    // Chat errors
    CHAT_BANNED: {
        ru: 'Вы забанены в чате',
    },
    INVALID_MESSAGE_REQUIRED: {
        ru: 'Вы не ввели сообщение',
    },
    INVALID_MESSAGE_MIN: {
        ru: 'Сообщение слишком короткое',
    },
    INVALID_MESSAGE_MAX: {
        ru: 'Сообщение не может превышать 255 символов',
    },
    INVALID_MESSAGE_MATCHES: {
        ru: 'Недопустимые символы в сообщении',
    },

    // Classic game errors
    CLASSIC_GAME_MIN_BET_PRICE_ERROR: {
        ru: 'Слишком маленькая ставка',
    },
    CLASSIC_GAME_IN_PROGRESS_ERROR: {
        ru: 'Игры уже началась',
    },
    CLASSIC_GAME_ENDED_ERROR: {
        ru: 'Игры уже закончилась',
    },
    INVALID_AMOUNT_REQUIRED: {
        ru: 'Вы не ввели сумму',
    },
    INVALID_AMOUNT_MORE_THAN: {
        ru: 'Сумма должна быть больше 0',
    },
};

export const getTranslation = (code: TranslationCode, language: keyof Translation = 'ru') => {
    return translations[code][language];
};

export const getTranslationNotStrict = (code: string, language: keyof Translation = 'ru') => {
    return code in translations ? translations[code as TranslationCode][language] : code;
};
