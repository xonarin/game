import React, { useMemo } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { DateTime } from 'luxon';

import s from './Announcement.scss';
import { cn } from '../../../../../../utils/bem-css-module';
import { AnnouncementFragment } from '../../../../../../__generated__/graphql';
import TextBlock from '../../../../../TextBlock/TextBlock';
import Text from '../../../../../Text/Text';
import Link from '../../../../../Link/Link';

export interface AnnouncementProps extends AnnouncementFragment {
    now: Date;
    onCloseWidget: () => void;
}

const ONE_MINUTE = 60000;

const cnAnnouncement = cn(s, 'Announcement');

const Announcement: React.FC<AnnouncementProps> = ({ chatId, text, image, createdAt, now, onCloseWidget }) => {
    useStyles(s);

    const transformedDateTime = useMemo(() => {
        const createdAtDate = new Date(createdAt);
        const diff = now.getTime() - createdAtDate.getTime();

        return diff < ONE_MINUTE
            ? 'меньше минуты назад'
            : DateTime.fromJSDate(new Date(createdAt)).toRelative({ base: DateTime.fromJSDate(now), locale: 'ru' });
    }, [createdAt, now]);

    return (
        <Link className={cnAnnouncement()} to={`/messages/${chatId}`} onClick={onCloseWidget}>
            {image && <img className={cnAnnouncement('Image')} src={image} alt="" />}
            <div className={cnAnnouncement('Main')}>
                <TextBlock className={cnAnnouncement('Text')} maxLines={5} color="white">
                    {text}
                </TextBlock>
                <Text>{transformedDateTime}</Text>
            </div>
        </Link>
    );
};

export default Announcement;
