import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './BlockWithTitle.scss';
import { cn } from '../../../../utils/bem-css-module';
import Title from '../../../Title/Title';

export interface BlockWithTitleProps {
    title?: string;
    className?: string;
    children: React.ReactNode;
}

const cnBlockWithTitle = cn(s, 'BlockWithTitle');

const BlockWithTitle: React.FC<BlockWithTitleProps> = ({ title, className, children }) => {
    useStyles(s);

    return (
        <div className={cnBlockWithTitle(null, [className])}>
            {title ? (
                <div className={cnBlockWithTitle('Head')}>
                    <Title className={cnBlockWithTitle('Title')} font="Rubik" size="xl" upper>
                        {title}
                    </Title>
                </div>
            ) : null}

            <div className={cnBlockWithTitle('Content')}>{children}</div>
        </div>
    );
};

export default BlockWithTitle;
