import { Notification, NotificationLevel } from '../../__generated__/graphql';
import { getTranslation, getTranslationNotStrict } from '../translation';

export const makeNotificationFromError = (errorMessage: string, autoDismiss: number = 5000): Notification => ({
    __typename: 'Notification',
    id: Date.now().toString(),
    title: getTranslation('ERROR_TITLE'),
    message: getTranslationNotStrict(errorMessage),
    level: NotificationLevel.Error,
    autoDismiss,
});

export default { makeNotification: makeNotificationFromError };
