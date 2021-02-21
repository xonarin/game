type TranslationCode =
    | 'ERROR_TITLE'
    | 'WARN_TITLE'
    | 'SUCCESS_TITLE'
    | 'NOT_AUTH'
    | 'NOT_ADMIN_OR_MODERATOR'
    | 'FREQUENT_REQUESTS'
    | 'NOT_ENOUGH_MONEY'
    | 'NOT_ENOUGH_DEPOSITS'
    | 'CHAT_BANNED'
    | 'INVALID_MESSAGE_REQUIRED'
    | 'INVALID_MESSAGE_MIN'
    | 'INVALID_MESSAGE_MAX'
    | 'INVALID_MESSAGE_MATCHES'
    | 'CLASSIC_GAME_MIN_BET_PRICE_ERROR'
    | 'CLASSIC_GAME_IN_PROGRESS_ERROR'
    | 'CLASSIC_GAME_ENDED_ERROR'
    | 'INVALID_AMOUNT_REQUIRED'
    | 'INVALID_AMOUNT_MORE_THAN'
    | 'INVALID_BET_AMOUNT_MORE_THAN'
    | 'NOT_ENOUGH_BETS'
    | 'MINES_GAME_BET_TOO_HIGH'
    | 'PROMO_CODE_BUSIED'
    | 'BAD_PROMO_CODE'
    | 'NO_PROMO_CODE'
    | 'LAST_PROMO_CODE_DIDNT_BET'
    | 'VK_PAGE_CLOSED'
    | 'NOT_ENOUGH_VK_FRIENDS'
    | 'MAX_BALANCE_REACHED'
    | 'SEND_MESSAGE_NOT_ENOUGH_DEPS'
    | 'PROMO_CODE_FREQ_LIMIT_REACHED'
    | 'PROMO_CODE_NOT_ENOUGH_DEPOSITS'
    | 'NOT_ENOUGH_REF_MONEY';

interface Translation {
    ru: string;
}

const translations: Record<TranslationCode, Translation> = {
    // Common
    ERROR_TITLE: {
        ru: 'Ошибка',
    },

    WARN_TITLE: {
        ru: 'Предупреждение',
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
    INVALID_BET_AMOUNT_MORE_THAN: {
        ru: 'Мин.ставка не может быть меньше 1 рубля',
    },
    NOT_ENOUGH_BETS: {
        ru: 'После первого депозита сделайте отыгрыш 50 рублей в режиме МИНЫ с коэффом не менее 1.6х для вывода средств. Это защита от абузеров.',
    },
    MINES_GAME_BET_TOO_HIGH: {
        ru: 'Максимальная ставка не более 100 рублей.',
    },
    PROMO_CODE_BUSIED: {
        ru: 'Смените название промокода.',
    },
    BAD_PROMO_CODE: {
        ru: 'Мин. сумма промокода 1 рубль и 1 активация.',
    },
    NO_PROMO_CODE: {
        ru: 'Такого промокода не существует.',
    },
    LAST_PROMO_CODE_DIDNT_BET: {
        ru: 'Последний раз вы брали промокод и не сделали на его сумму ставок. Сделайте ставки.',
    },
    VK_PAGE_CLOSED: {
        ru: 'Откройте профиль в ВК, чтобы взять промокод.',
    },
    NOT_ENOUGH_VK_FRIENDS: {
        ru: 'У вас должно быть больше 20 друзей в ВК.',
    },
    NOT_ENOUGH_REF_MONEY: {
        ru: 'Для вывода с реферальского баланса нужно не менее 15 рублей',
    },
    NOT_ENOUGH_DEPOSITS: {
        ru: 'Сделайте депозит в 50 рублей для вывода средств.'
    },
    MAX_BALANCE_REACHED: {
        ru: 'Без депозита в 50 рублей, ваш баланс не может превышать сумму больше 100 рублей.'
    },
    SEND_MESSAGE_NOT_ENOUGH_DEPS: {
        ru: 'Для возможности писать в чат, сделайте депозит в 30 рублей.'
    },
    PROMO_CODE_FREQ_LIMIT_REACHED: {
        ru: 'Промокод больше не активен.'
    },
    PROMO_CODE_NOT_ENOUGH_DEPOSITS: {
        ru: 'Для создания промокода нужно сделать пополнение.'
    }
};

export const getTranslation = (code: TranslationCode, language: keyof Translation = 'ru') => {
    return translations[code][language];
};

export const getTranslationNotStrict = (code: string, language: keyof Translation = 'ru') => {
    return code in translations ? translations[code as TranslationCode][language] : code;
};
