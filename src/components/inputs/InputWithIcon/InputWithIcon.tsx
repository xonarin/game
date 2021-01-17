import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../../utils/bem-css-module';
import Icon from '../../Icon/Icon';
import Text from '../../Text/Text';
import s from './InputWithIcon.scss';

const cnInputWithIcon = cn(s, 'InputWithIcon');

export interface InputWithIconProps {
    icon?: string;
    error?: string;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({ icon, error, children }) => {
    useStyles(s);

    return (
        <div className={cnInputWithIcon({ error: !!error })}>
            <div className={cnInputWithIcon('Icon')}>
                {icon ? <img src={icon} alt="Icon" /> : <Icon type="diamond" />}
            </div>

            <div className={cnInputWithIcon('Error')}>
                <Text color="red">{error}</Text>
            </div>

            {children}
        </div>
    );
};

export default InputWithIcon;
