import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './CornerLabel.scss';
import { cn } from '../../../../utils/bem-css-module';
import Icon from '../../../Icon/Icon';
import Text from '../../../Text/Text';

export interface CornerLabelProps {
    readonly className?: string;
}

const cnCornerLabel = cn(s, 'CornerLabel');

const CornerLabel: React.FC<CornerLabelProps> = ({ className, children }) => {
    useStyles(s);

    return (
        <div className={cnCornerLabel(null, [className])}>
            <div className={cnCornerLabel('Icon')}>
                <Icon type="rightWhite" />
            </div>

            <Text>{children}</Text>
        </div>
    );
};

export default CornerLabel;
