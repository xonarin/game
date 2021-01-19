import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './PrizeMobile.scss';
import { cn } from '../../../utils/bem-css-module';
import Text from '../../../components/Text/Text';
import { TabNameType } from '../PrizeInfo/PrizeInfo';

export interface PrizeTabProps {
    readonly tabName: TabNameType;
    readonly img: string;
    readonly title: string;

    readonly selectedTab: TabNameType;
    readonly setSelectedTab: (value: TabNameType) => void;
}

const cnPrizeMobile = cn(s, 'PrizeMobile');

export const PrizeTabMobile: React.FC<PrizeTabProps> = ({ tabName, img, title, selectedTab, setSelectedTab, children }) => {
    useStyles(s);

    return (
        <button
            type="button"
            className={cnPrizeMobile('Nav-Item', { active: selectedTab === tabName })}
            onClick={() => setSelectedTab(tabName)}
        >
            <div className={cnPrizeMobile('Nav-Item-Img')}>
                <img src={img} alt={title} />
            </div>

            <div className={cnPrizeMobile('Nav-Item-Info')}>
                <Text color="blue">{title}</Text>
                <Text>{children}</Text>
            </div>
        </button>
    );
};
