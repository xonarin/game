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
    | 'INVALID_AMOUNT_REQUIRED'
    | 'INVALID_AMOUNT_MORE_THAN'
    | 'INVALID_BET_AMOUNT_MORE_THAN'
    | 'NOT_ENOUGH_BETS'
    | 'CLASSIC_GAME_MIN_BET_PRICE_ERROR'
    | 'CLASSIC_GAME_IN_PROGRESS_ERROR'
    | 'CLASSIC_GAME_ENDED_ERROR'
    | 'MINES_GAME_BET_TOO_HIGH'
    | 'UPGRADE_INVALID_BET'
    | 'UPGRADE_TOO_MANY_BET_ITEMS'
    | 'SHOP_INVALID_QUANTITY'
    | 'SHOP_EMPTY_CART'
    | 'SHOP_TOO_MANY_ITEMS'
    | 'UPGRADE_CHANCE_TOO_LOW'
    | 'INVENTORY_ITEM_BUSY'
    | 'UPGRADE_BET_OUT_OF_RANGE'
    | 'UPGRADE_BET_ITEM_NOT_FOUND'
    | 'UPGRADE_ITEM_NOT_AVAILABLE'
    | 'UPGRADE_CHANCE_TOO_HIGH'
    | 'UPGRADE_CHANCE_OUT_OF_RANGE'
    | 'UPGRADE_PRICE_CHANGED'
    | 'PROMO_CODE_BUSIED'
    | 'BAD_PROMO_CODE'
    | 'NO_PROMO_CODE'
    | 'LAST_PROMO_CODE_DIDNT_BET'
    | 'TELEGRAM_NOT_LINKED'
    | 'TELEGRAM_ALREADY_LINKED'
    | 'TELEGRAM_NOT_SUBSCRIBED'
    | 'TELEGRAM_BOT_NOT_STARTED'
    | 'BONUS_NOT_CONFIGURED'
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
    INVENTORY_ITEM_BUSY: {
        ru: 'Скин уже используется в другой игре или на выводе',
    },
    UPGRADE_CHANCE_TOO_LOW: {
        ru: 'Слишком низкий шанс: выберите скин дешевле или увеличьте ставку',
    },
    SHOP_INVALID_QUANTITY: {
        ru: 'Неверное количество скинов',
    },
    SHOP_EMPTY_CART: {
        ru: 'Выберите скины для покупки',
    },
    SHOP_TOO_MANY_ITEMS: {
        ru: 'За один раз можно купить не больше 50 скинов',
    },
    UPGRADE_TOO_MANY_BET_ITEMS: {
        ru: 'Слишком много скинов в ставке',
    },
    UPGRADE_INVALID_BET: {
        ru: 'Неверная ставка',
    },
    UPGRADE_BET_OUT_OF_RANGE: {
        ru: 'Ставка (скин + монеты) вне допустимых пределов',
    },
    UPGRADE_BET_ITEM_NOT_FOUND: {
        ru: 'Скин недоступен: его нет в инвентаре или он уже используется',
    },
    UPGRADE_ITEM_NOT_AVAILABLE: {
        ru: 'Скин сейчас недоступен',
    },
    UPGRADE_CHANCE_TOO_HIGH: {
        ru: 'Слишком высокий шанс: выберите скин дороже или уменьшите ставку',
    },
    UPGRADE_CHANCE_OUT_OF_RANGE: {
        ru: 'Шанс вне допустимого диапазона',
    },
    UPGRADE_PRICE_CHANGED: {
        ru: 'Цены изменились, проверьте шанс и попробуйте ещё раз',
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
    TELEGRAM_NOT_LINKED: {
        ru: 'Подключите Telegram, чтобы получить бонус.',
    },
    TELEGRAM_ALREADY_LINKED: {
        ru: 'Этот Telegram уже привязан к другому аккаунту.',
    },
    TELEGRAM_NOT_SUBSCRIBED: {
        ru: 'Подпишитесь на наш Telegram-канал, чтобы получить бонус.',
    },
    TELEGRAM_BOT_NOT_STARTED: {
        ru: 'Запустите нашего Telegram-бота (нажмите «Старт»), чтобы получить бонус.',
    },
    BONUS_NOT_CONFIGURED: {
        ru: 'Бонусы временно недоступны.',
    },
    NOT_ENOUGH_REF_MONEY: {
        ru: 'Для вывода с реферальского баланса нужно не менее 15 рублей',
    },
    NOT_ENOUGH_DEPOSITS: {
        ru: 'Сделайте депозит в 50 рублей для вывода средств.',
    },
    MAX_BALANCE_REACHED: {
        ru: 'Без депозита в 50 рублей, ваш баланс не может превышать сумму больше 100 рублей.',
    },
    SEND_MESSAGE_NOT_ENOUGH_DEPS: {
        ru: 'Для возможности писать в чат, сделайте депозит в 30 рублей.',
    },
    PROMO_CODE_FREQ_LIMIT_REACHED: {
        ru: 'Промокод больше не активен.',
    },
    PROMO_CODE_NOT_ENOUGH_DEPOSITS: {
        ru: 'Для создания промокода нужно сделать пополнение.',
    },
};

export const getTranslation = (code: TranslationCode, language: keyof Translation = 'ru') =>
    translations[code][language];

export const getTranslationNotStrict = (code: string, language: keyof Translation = 'ru') =>
    code in translations ? translations[code as TranslationCode][language] : code;
