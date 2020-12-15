import React, { useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ClassicGameWinner.scss';
import { cn } from '../../../../../utils/bem-css-module';
import Text from '../../../../../components/Text/Text';

export interface ClassicGameWinnerProps {
    randomNumber: string | null;
    winnerUsername: string | null;
    winnerAvatar: string | null;
    winnerTicket: number | null;
    winnerChance: number | null;
    className?: string;
}

interface ClassicGameWinnerInfoState {
    randomNumber?: string;
    winnerUsername?: string;
    winnerAvatar?: string;
    winnerTicket?: number;
    winnerChance?: number;
}

const cnClassicGameWinner = cn(s, 'ClassicGameWinner');

const ClassicGameWinner: React.FC<ClassicGameWinnerProps> = ({
    randomNumber,
    winnerUsername,
    winnerAvatar,
    winnerTicket,
    winnerChance,
    className,
}) => {
    useStyles(s);

    const [info, setInfo] = useState<ClassicGameWinnerInfoState>({});

    useEffect(() => {
        if (
            randomNumber !== null &&
            winnerUsername !== null &&
            winnerAvatar !== null &&
            winnerTicket !== null &&
            winnerChance !== null
        ) {
            setInfo({
                randomNumber,
                winnerUsername,
                winnerAvatar,
                winnerTicket,
                winnerChance,
            });
        }
    }, [randomNumber, winnerUsername, winnerAvatar, winnerTicket, winnerChance]);

    return (
        <div className={cnClassicGameWinner(null, [className])}>
            <div className={cnClassicGameWinner('Left')}>
                <img className={cnClassicGameWinner('Avatar')} src={info.winnerAvatar} alt={info.winnerUsername} />
                <div className={cnClassicGameWinner('LeftInfo')}>
                    <Text className={cnClassicGameWinner('Username')} color="white">
                        {info.winnerUsername}
                    </Text>
                    <Text className={cnClassicGameWinner('Chance')} size="xs">
                        Шанс: {info.winnerChance}%
                    </Text>
                </div>
            </div>
            <div className={cnClassicGameWinner('RightInfo')}>
                <Text className={cnClassicGameWinner('Ticket')} size="xs">
                    Победный билет: {info.winnerTicket}
                </Text>
                <Text className={cnClassicGameWinner('RandomNumber')} size="xs">
                    Число раунда: {info.randomNumber}
                </Text>
            </div>
        </div>
    );
};

export default ClassicGameWinner;
