import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './AnnouncementsWidget.scss';
import { cn } from '../../../../../utils/bem-css-module';
import { useDate } from '../../../../../hooks/useDate';
import useDropdown from '../../../../../hooks/useDropdown';
import useAnnouncementsQuery from '../../../../../hooks/graphql/announcements/useAnnouncementsQuery';
import AlarmButton from '../../../../Button/containers/AlarmButton/AlarmButton';
import Text from '../../../../Text/Text';
import Scrollable from '../../../../Scrollable/Scrollable';
import Announcement from './Announcement/Announcement';

export interface AnnouncementsWidgetProps {
    className?: string;
}

const UPDATE_DATE_INTERVAL = 10000;

const cnAnnouncementsWidget = cn(s, 'AnnouncementsWidget');

const AnnouncementsWidget: React.FC<AnnouncementsWidgetProps> = ({ className }) => {
    useStyles(s);

    const now = useDate(UPDATE_DATE_INTERVAL);
    const [containerRef, isOpen, toggle, , close] = useDropdown<HTMLDivElement>();
    const { announcements } = useAnnouncementsQuery();

    return (
        <div className={cnAnnouncementsWidget({ isOpen }, [className])} ref={containerRef}>
            <AlarmButton
                isAlarm={Boolean(announcements && announcements.length > 0)}
                icon="bell"
                iconHover="bellWhite"
                onClick={toggle}
            />
            <div className={cnAnnouncementsWidget('Dropdown')}>
                {announcements && announcements.length > 0 ? (
                    <>
                        <Text className={cnAnnouncementsWidget('DropdownTitle')} size="m" color="white">
                            Уведомления
                        </Text>
                        <Scrollable className={cnAnnouncementsWidget('List')} disablePadding>
                            {announcements.map(announcement => (
                                <Announcement {...announcement} now={now} onCloseWidget={close} key={announcement.id} />
                            ))}
                        </Scrollable>
                    </>
                ) : (
                    <Text className={cnAnnouncementsWidget('Empty')}>Уведомлений пока нет</Text>
                )}
            </div>
        </div>
    );
};

export default AnnouncementsWidget;
