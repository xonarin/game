import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from '../CenterPage/CenterPage.scss';
import { cn } from '../../../../utils/bem-css-module';
import Title from '../../../Title/Title';

export interface CenterPageProps {
    title?: string;
    className?: string;
    children: React.ReactNode;
}

const cnCenterPage = cn(s, 'CenterPage');

const CenterPage: React.FC<CenterPageProps> = ({ title, className, children }) => {
    useStyles(s);

    return (
        <div className={cnCenterPage(null, [className])}>
            {title ? (
                <div className={cnCenterPage('Head')}>
                    <Title className={cnCenterPage('Title')} font="Rubik" size="xl" upper>
                        {title}
                    </Title>
                </div>
            ) : null}

            <div className={cnCenterPage('Content')}>{children}</div>
        </div>
    );
};

export default CenterPage;
