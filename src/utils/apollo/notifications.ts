import { Notification, NotificationLevel } from '../../__generated__/graphql';
import { getTranslationNotStrict } from '../translation';

export const makeNotification = (
    title: string,
    message: string,
    level: NotificationLevel,
    autoDismiss: number = 5000,
): Notification => ({
    __typename: 'Notification',
    id: Date.now().toString(),
    title: getTranslationNotStrict(title),
    message: getTranslationNotStrict(message),
    level,
    autoDismiss,
});

export const makeNotificationFromError = (errorMessage: string, autoDismiss?: number): Notification =>
    makeNotification('ERROR_TITLE', errorMessage, NotificationLevel.Error, autoDismiss);

export const makeWarningNotification = (message: string, autoDismiss?: number): Notification =>
    makeNotification('WARN_TITLE', message, NotificationLevel.Warn, autoDismiss);

export const makeSuccessNotification = (message: string, autoDismiss?: number): Notification =>
    makeNotification('SUCCESS_TITLE', message, NotificationLevel.Success, autoDismiss);
