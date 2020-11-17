import { Settings } from 'luxon';

export const configureLuxon = () => {
    Settings.defaultLocale = 'ru-RU';
};

export default { configureLuxon };
