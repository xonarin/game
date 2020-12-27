import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './MiniProfile.scss';
import { cn } from '../../../../../utils/bem-css-module';
import Link from '../../../../Link/Link';
import Icon from '../../../../Icon/Icon';

export interface MiniProfileProps {
    username: string;
    avatar: string;
}

const cnMiniProfile = cn(s, 'MiniProfile');

const MiniProfile: React.FC<MiniProfileProps> = ({ username, avatar }) => {
    useStyles(s);

    return (
        <div className={cnMiniProfile()}>
            <Link className={cnMiniProfile('Avatar')} to="/">
                <img className={cnMiniProfile('AvatarImg')} src={avatar} alt={username} />
            </Link>
            <Link className={cnMiniProfile('LogOut')} to="/logout" external>
                <Icon className={cnMiniProfile('LogOutIcon')} type="signOut" size="xs" />
            </Link>
        </div>
    );
};

export default MiniProfile;
