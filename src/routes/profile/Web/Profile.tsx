import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Profile.scss';
import useMeQuery from '../../../hooks/graphql/users/useMeQuery';
import Layout33Content from '../../../components/Layout/Web/containers/Layout33Content';
import ProfileInfo from '../../../components/ProfileInfo/ProfileInfo';

export interface ProfilePageProps {
    chatId: string;
}

const ProfileWeb: React.FC<ProfilePageProps> = ({ chatId }) => {
    useStyles(s);

    const { me } = useMeQuery();

    return <Layout33Content chatId={chatId} centerContent={me ? <ProfileInfo profile={me} /> : null} />;
};

export default ProfileWeb;
