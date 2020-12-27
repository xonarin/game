import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { Form } from 'react-final-form';
import { Decorator } from 'final-form';

import s from './MinesBetForm.scss';
import { cn } from '../../../../utils/bem-css-module';
import { countOnes } from '../../../../utils/number';
import { MinesGameFragment, MinesGameStatus } from '../../../../__generated__/graphql';
import Text from '../../../Text/Text';
import Button from '../../../Button/Button';
import ExtendedBetField from '../../../fields/ExtendedBetField/ExtendedBetField';
import CountField from '../../../fields/CountField/CountField';
import useStartMinesGameMutation from '../../../../hooks/graphql/minesGame/useStartMinesGameMutation';
import useEndMinesGameMutation from '../../../../hooks/graphql/minesGame/useEndMinesGameMutation';

export interface MinesBetFormValues {
    betAmount: number;
    bombsCount: number;
}

export interface MinesBetFormMobileProps {
    fieldSize: number;
    minBombsCount: number;
    coefs: number[][];
    activeMinesGame?: MinesGameFragment | null;
    onChangeBombsCount?: (bombsCount: number) => void;
    className?: string;
}

export const BOMBS_COUNT_BREAKPOINTS = [3, 5, 10, 24];
const TRULY = () => true;

const cnMinesBetForm = cn(s, 'MinesBetForm');

const MinesBetFormMobile: React.FC<MinesBetFormMobileProps> = ({
    fieldSize,
    minBombsCount,
    coefs,
    activeMinesGame,
    onChangeBombsCount,
    className,
}) => {
    useStyles(s);

    const startMinesGameMutation = useStartMinesGameMutation();
    const endMinesGameMutation = useEndMinesGameMutation();

    const { betAmount, bombsCount, stepsConf, status } = activeMinesGame || {
        betAmount: 0,
        bombsCount: BOMBS_COUNT_BREAKPOINTS[0],
        stepsConf: 0,
    };
    const step = countOnes(stepsConf);
    const isInGame = status === MinesGameStatus.InGame;
    const coef = coefs[bombsCount - minBombsCount][step - 1] || 1;

    const onSubmit = useCallback(
        async (values: MinesBetFormValues) => {
            if (isInGame) {
                if (step === 0) return;

                await endMinesGameMutation();
            } else {
                await startMinesGameMutation(values);
            }
        },
        [step, isInGame, endMinesGameMutation, startMinesGameMutation],
    );

    const onChangeBombsCountDecorator = useCallback<Decorator<MinesBetFormValues>>(
        form =>
            form.subscribe(
                ({ values, errors }) => {
                    if (!errors.bombsCount && onChangeBombsCount) {
                        onChangeBombsCount(values.bombsCount);
                    }
                },
                { values: true, errors: true },
            ),
        [onChangeBombsCount],
    );

    return (
        <Form<MinesBetFormValues>
            onSubmit={onSubmit}
            initialValues={{ betAmount, bombsCount }}
            initialValuesEqual={TRULY}
            decorators={[onChangeBombsCountDecorator]}
        >
            {({ handleSubmit }) => (
                <form className={cnMinesBetForm(null, [className])} onSubmit={handleSubmit}>
                    <div className={cnMinesBetForm('Fields', { isDisabled: isInGame })}>
                        <Text className={cnMinesBetForm('Label')} weight="regular">
                            Сумма ставки
                        </Text>
                        <ExtendedBetField className={cnMinesBetForm('BetField')} name="betAmount" />
                        <Text className={cnMinesBetForm('Label')} weight="regular">
                            Количество бомб
                        </Text>
                        <CountField
                            name="bombsCount"
                            min={minBombsCount}
                            max={fieldSize - 1}
                            breakpoints={BOMBS_COUNT_BREAKPOINTS}
                        />
                    </div>
                    <Button
                        className={cnMinesBetForm('SubmitButton', { isDisabled: isInGame && step === 0 })}
                        size='m'
                        submit
                    >
                        {isInGame && coef ? `Забрать ${(betAmount * coef).toFixed(2)}` : 'Играть'}
                    </Button>
                </form>
            )}
        </Form>
    );
};

export default MinesBetFormMobile;
