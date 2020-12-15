import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ClassicGame.scss';
import { cn } from '../../../../utils/bem-css-module';
import { ClassicGameFragment, ClassicGameState } from '../../../../__generated__/graphql';
import Text from '../../../../components/Text/Text';
import ProgressBar from '../../../../components/ProgressBar/ProgressBar';
import PolarWave from '../../../../components/PolarWave/PolarWave';
import ClassicGameCanvas from './ClassicGameCanvas/ClassicGameCanvas';
import ClassicGameDigits from './ClassicGameDigits/ClassicGameDigits';
import ClassicGameForm from '../../../../components/forms/Web/ClassicGameForm/ClassicGameForm';
import ClassicGameWinner from './ClassicGameWinner/ClassicGameWinner';
import ClassicGameFund from './ClassicGameFund/ClassicGameFund';
import ClassicGameLight from './ClassicGameLight/ClassicGameLight';

export interface ClassicGameProps {
    game: ClassicGameFragment;
}

const cnClassicGame = cn(s, 'ClassicGame');

const ClassicGame: React.FC<ClassicGameProps> = ({ game }) => {
    useStyles(s);

    const {
        minBetAmount,
        state,
        fund,
        randomNumber,
        winnerUsername,
        winnerAvatar,
        winnerTicket,
        winnerChance,
        timer,
        maxTimer,
        players,
        culminationDegree,
        remainingCulminationDuration,
    } = game;

    const isEnded = state === ClassicGameState.Ended;

    return (
        <div className={cnClassicGame()}>
            <ClassicGameWinner
                className={cnClassicGame('Winner', { isEnded })}
                randomNumber={randomNumber ?? null}
                winnerUsername={winnerUsername ?? null}
                winnerAvatar={winnerAvatar ?? null}
                winnerTicket={winnerTicket ?? null}
                winnerChance={winnerChance ?? null}
            />
            <div className={cnClassicGame('Main')}>
                <PolarWave
                    color={ctx => {
                        const grad = ctx.createLinearGradient(0, 0, ctx.canvas.width / 2, ctx.canvas.height);
                        grad.addColorStop(0.16, '#1e2644');
                        grad.addColorStop(0.4, '#24273a');
                        grad.addColorStop(0.65, '#141a2c');
                        grad.addColorStop(0.89, '#151a23');
                        return grad;
                    }}
                    className={cnClassicGame('WaveBack')}
                    pointsCount={13}
                    minRadius={160}
                    maxRadius={225}
                    rotationPeriod={20000}
                    minBound={35}
                    maxBound={65}
                    minOscillationPeriod={8000}
                    maxOscillationPeriod={15000}
                />
                <PolarWave
                    color={ctx => {
                        const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
                        grad.addColorStop(0.04, '#2c2e4c');
                        grad.addColorStop(0.38, '#202641');
                        grad.addColorStop(0.65, '#1a1f32');
                        grad.addColorStop(0.95, '#151a25');
                        return grad;
                    }}
                    className={cnClassicGame('WaveForward')}
                    pointsCount={13}
                    minRadius={160}
                    maxRadius={195}
                    rotationPeriod={15000}
                    minBound={15}
                    maxBound={35}
                    minOscillationPeriod={8000}
                    maxOscillationPeriod={15000}
                />
                <ClassicGameLight />
                <ClassicGameCanvas
                    className={cnClassicGame('Canvas')}
                    items={players}
                    culminationDegree={culminationDegree ?? null}
                    remainingCulminationDuration={remainingCulminationDuration ?? null}
                />
                <span
                    className={cnClassicGame('Arrow', {
                        isActive: state === ClassicGameState.Culmination || state === ClassicGameState.Ended,
                    })}
                />
                <div className={cnClassicGame('Info')}>
                    <div className={cnClassicGame('Time')}>
                        <ClassicGameDigits className={cnClassicGame('Digits')} seconds={timer} />
                        <Text upper>seconds</Text>
                        <ProgressBar
                            className={cnClassicGame('ProgressBar')}
                            percent={timer < maxTimer ? (1 - (timer - 1) / maxTimer) * 100 : 0}
                        />
                    </div>
                    <ClassicGameFund fund={fund} />
                </div>
            </div>
            <ClassicGameForm className={cnClassicGame('Form', { isEnded })} minBetAmount={minBetAmount} />
        </div>
    );
};

export default ClassicGame;
