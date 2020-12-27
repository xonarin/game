import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './AlarmButton.scss';
import { cn } from '../../../../utils/bem-css-module';
import Button, { ButtonProps } from '../../Button';

export interface AlarmButtonProps extends ButtonProps {
    isAlarm?: boolean;
}

const cnAlarmButton = cn(s, 'AlarmButton');

const AlarmButton: React.FC<AlarmButtonProps> = ({ isAlarm, className, ...rest }) => {
    useStyles(s);

    return (
        <div className={cnAlarmButton()}>
            <Button {...rest} className={cnAlarmButton('Button', [className])} shape="right" color="gray" />
            <div className={cnAlarmButton('Alarm', { isActive: isAlarm })} />
        </div>
    );
};

export default AlarmButton;
