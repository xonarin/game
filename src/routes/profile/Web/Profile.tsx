import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Profile.scss';
import { cn } from '../../../utils/bem-css-module';
import useMeQuery from '../../../hooks/graphql/users/useMeQuery';
import Layout33Content from '../../../components/Layout/Web/containers/Layout33Content';
import ProfileInfo from '../../../components/ProfileInfo/ProfileInfo';

const cnProfile = cn(s, 'Profile');

export interface ProfilePageProps {
    chatId: string;
}

const ProfileWeb: React.FC<ProfilePageProps> = ({ chatId }) =>  {
    useStyles(s);

    const { me } = useMeQuery();

    return (

        <Layout33Content
            chatId={chatId}
            centerContent={
                <ProfileInfo profile={me} />
            }
        />


    );
};

export default ProfileWeb;
