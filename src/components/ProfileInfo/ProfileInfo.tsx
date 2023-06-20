import React from "react";
import { cn } from "../../utils/bem-css-module";
import { getDateDMY } from "../../utils/time";
import useStyles from 'isomorphic-style-loader/useStyles';
import s from './ProfileInfo.scss';

export interface ProfileInfoProps {
    profile: string[];
}

const cnProfile = cn(s, 'Profile');

const ProfileInfo = ({ profile }) => {
    useStyles(s);

    return (
        <div className={cnProfile()}>
            <div className={cnProfile('Avatar')}>
                <img src={profile.avatar} alt={profile.username} />
            </div>
            <ul className={cnProfile('List')}>
                <li className={cnProfile('Item')}>ID: <span>{profile.id}</span></li>
                <li className={cnProfile('Item')}>Имя: <span>{profile.username}</span></li>
                <li className={cnProfile('Item')}>Revshare: <span>{profile.refPercent}</span></li>
                <li className={cnProfile('Item')}>Нарушений: <span>{profile.chatWarns} из 7</span></li>
                <li className={cnProfile('Item')}>Сумма ставок: <span>{profile.turnover}</span></li>
                <li className={cnProfile('Item')}>Регистрация: <span>{getDateDMY(new Date(profile.createdAt))}</span></li>
            </ul>
        </div>
    )
}

export default ProfileInfo;