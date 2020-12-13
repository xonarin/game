/* eslint-disable no-bitwise */
import React, { useCallback, useMemo } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { range } from 'lodash';

import s from './MinesGame.scss';
import { cn } from '../../../utils/bem-css-module';
import { countOnes } from '../../../utils/number';
import { MinesGameFragment, MinesGameStatus } from '../../../__generated__/graphql';
import useMakeMinesGameStepMutation from '../../../hooks/graphql/minesGame/useMakeMinesGameStepMutation';
import MinesButton, { MinesButtonProps } from './MinesButton/MinesButton';
import MinesCounter from './MinesCounter/MinesCounter';
import HitsItems from './HitsItems/HitsItems';

export interface MinesGameProps {
    fieldSize: number;
    minBombsCount: number;
    coefs: number[][];
    formBombsCount: number;
    activeMinesGame?: MinesGameFragment | null;
}

const cnMinesGame = cn(s, 'MinesGame');

const MinesGame: React.FC<MinesGameProps> = ({ fieldSize, minBombsCount, coefs, formBombsCount, activeMinesGame }) => {
    useStyles(s);

    const { bombsCount, fieldConf, stepsConf, status } = activeMinesGame || {
        bombsCount: formBombsCount,
        fieldConf: 0,
        stepsConf: 0,
    };

    const cells = useMemo<MinesButtonProps[]>(
        () =>
            range(fieldSize).map(cell => {
                const mask = 1 << cell;
                const type = (fieldConf & mask) === 0 ? 'gem' : 'bomb';
                const isStepped = Boolean(stepsConf & mask);

                return {
                    cell,
                    type: isStepped || status === MinesGameStatus.Ended ? type : undefined,
                    isStepped,
                };
            }),
        [fieldConf, fieldSize, status, stepsConf],
    );

    const makeMinesGameStepMutation = useMakeMinesGameStepMutation();
    const onMinesButtonClick = useCallback(
        (cell: number) => {
            if (status === MinesGameStatus.InGame) {
                makeMinesGameStepMutation(cell).then();
            }
        },
        [makeMinesGameStepMutation, status],
    );

    const remainingGemsCount = fieldSize - bombsCount - countOnes(~fieldConf & stepsConf);
    const currentStep = countOnes(stepsConf);

    return (
        <div className={cnMinesGame()}>
            <div className={cnMinesGame('Main')}>
                <div className={cnMinesGame('Field')}>
                    {cells.map(({ cell, type, isStepped }) => (
                        <MinesButton
                            cell={cell}
                            type={type}
                            isStepped={isStepped}
                            onClick={onMinesButtonClick}
                            key={cell}
                        />
                    ))}
                </div>
                <div className={cnMinesGame('Counters')}>
                    <MinesCounter type="gem" counter={remainingGemsCount} />
                    <MinesCounter type="bomb" counter={bombsCount} />
                </div>
            </div>
            <HitsItems current={currentStep} items={coefs[bombsCount - minBombsCount]} />
        </div>
    );
};

export default MinesGame;
