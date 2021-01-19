import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Prize.scss';
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

const cnPrize = cn(s, 'Prize');

export const PrizeTab: React.FC<PrizeTabProps> = ({ tabName, img, title, selectedTab, setSelectedTab, children }) => {
    useStyles(s);

    return (
        <button
            type="button"
            className={cnPrize('Nav-Item', { active: selectedTab === tabName })}
            onClick={() => setSelectedTab(tabName)}
        >
            <div className={cnPrize('Nav-Item-Img')}>
                <img src={img} alt={title} />
            </div>

            <div className={cnPrize('Nav-Item-Info')}>
                <Text color="blue">{title}</Text>
                <Text>{children}</Text>
            </div>
        </button>
    );
};
